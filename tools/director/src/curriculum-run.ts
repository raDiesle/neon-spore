import type { Wave } from "@neon-spore/content";
import { playsClean } from "./autopilot-play.js";
import { bossOrder } from "./boss-slots.js";
import { type Composed, composeBlockAt } from "./compose.js";
import { type Block, readBlock } from "./compose-block.js";
import { hasWaves, nextLesson } from "./compose-lesson.js";
import { nameWaves } from "./compose-names.js";
import { nextReview } from "./compose-review.js";
import { pickNext, splitCurriculum, type Unit, unitWaves } from "./curriculum-order.js";
import { softenHeads } from "./soften-intro.js";

/**
 * **The whole of `bun run waves:order`, as a function of the list**, so a
 * test can hold that a run on the shipped list changes nothing
 * (`test/curriculum-run.test.ts`), as `boss-slots.test.ts` holds
 * `waves:bosses`. Cut out of `waves-order.ts` on 18 October 2026.
 *
 * Every new thing after the tutorial arc taught again in the order of
 * `docs/spec/wave-curriculum.md` §4.1 (`curriculum-order.ts`): the composed
 * waves taken out, the units put in rising cost with bodies and levers taking
 * turns, each block's regular waves composed again for its new neighbours — a
 * body's, then a lesson's — the bosses placed again (`bossOrder`), the review
 * blocks written for those left at the end, the composed waves named, and **every group's head softened to its gentlest child**
 * (`soften-intro.ts`). That last pass is `waves:soften`'s, and until it was
 * here a `waves:order --write` quietly undid what `waves:soften --write` had
 * done after the last one.
 */

const SEEDS = [0, 4, 8, 12, 16, 20];

/** Thrown with the reason the order cannot go on. */
export class OrderStopped extends Error {}

const whole = (c: readonly Composed[]) => c.every((x) => x.wave);

const stop = (why: string): never => {
  throw new OrderStopped(why);
};

/** The list in curriculum order, `log` told a line per block as it is placed. */
export function orderWaves(list: readonly Wave[], log: (line: string) => void = () => {}): Wave[] {
  const cur = splitCurriculum(list);
  let waves: Wave[] = [...cur.arc];
  /** Every wave composed here, named once the list stands (`compose-names.ts`). */
  const composedIds = new Set<string>();

  function compose(block: Block, prefix: string) {
    let first: ReturnType<typeof composeBlockAt> | undefined;
    for (const seed of SEEDS) {
      const got = composeBlockAt(waves, block, prefix, seed);
      first ??= got;
      if (whole(got.composed)) return got;
    }
    return first as ReturnType<typeof composeBlockAt>;
  }

  const row = (head: string, c: readonly Composed[]) =>
    `${head.padEnd(24)}${c.map((x) => `${x.pressure ?? "—"}/${x.talk ?? "—"}`).join(" ")}`;

  function insert(at: number, out: readonly Wave[]) {
    const ids = new Set(waves.map((w) => w.id));
    const clash = out.find((w) => ids.has(w.id));
    if (clash) stop(`${clash.id} is already a wave`);
    for (const w of out) composedIds.add(w.id);
    waves = [...waves.slice(0, at), ...out, ...waves.slice(at)];
  }

  /** A block's composed waves, or why there are none. */
  function composeUnit(u: Unit): { at: number; out: Wave[]; composed: Composed[] } | string {
    if (u.kind === "body") {
      const read = readBlock(waves, u.head.id);
      if (typeof read === "string") return read;
      const { block, composed } = compose(read, u.head.id);
      if (!whole(composed)) return composed.flatMap((c) => c.faults).join("; ");
      return { at: block.insertAt, out: composed.map((c) => c.wave as Wave), composed };
    }
    // A lesson with a wave written for it has its one (THE TWINS).
    const at = waves.findIndex((w) => w.id === u.head.id);
    if (hasWaves(waves, at)) return { at, out: [], composed: [] };
    const lesson = nextLesson(waves);
    if (typeof lesson === "string") return lesson;
    if (lesson.prefix !== u.head.id) return `the next lesson is ${lesson.prefix}`;
    const { block, composed } = compose(lesson.block, lesson.prefix);
    if (!whole(composed)) return composed.flatMap((c) => c.faults).join("; ");
    return { at: block.insertAt, out: composed.map((c) => c.wave as Wave), composed };
  }

  log("block                   pressure/talk, step by step");
  const left = [...cur.units];
  const placed: Unit[] = [];
  const refused = new Set<string>();
  while (left.length > 0) {
    const u = pickNext(left, placed, refused);
    if (!u) return stop(`nothing can be composed next: ${[...refused].join(", ")} refused`);
    const before = waves;
    waves = [...waves, ...unitWaves(cur, u, placed, waves)];
    const got = composeUnit(u);
    if (typeof got === "string") {
      // It waits for the next place (`pickNext`), the list as it was.
      log(`${u.head.id.padEnd(24)}waits: ${got}`);
      waves = before;
      refused.add(u.head.id);
      continue;
    }
    insert(got.at, got.out);
    log(`${row(u.head.id, got.composed)}  ${u.kind} ${u.cost}`);
    left.splice(left.indexOf(u), 1);
    placed.push(u);
    refused.clear();
  }

  waves = bossOrder([...waves, ...cur.bosses]).order;
  for (;;) {
    const review = nextReview(waves);
    if (typeof review === "string") break;
    const { block, composed } = compose(review.block, review.prefix);
    if (!whole(composed)) stop(`${review.prefix}: ${composed.flatMap((c) => c.faults).join("; ")}`);
    const out = composed.map((c, i) => {
      const { variant: _v, ...head } = c.wave as Wave;
      return i === 0 ? head : (c.wave as Wave);
    });
    insert(block.insertAt, out);
    log(`${row(review.prefix, composed)}  review`);
  }
  const settled = bossOrder(waves).order;
  if (settled.some((w, i) => w.id !== waves[i]?.id))
    stop("the bosses move again after the reviews");
  return softenHeads(nameWaves(waves, composedIds), playsClean).waves;
}
