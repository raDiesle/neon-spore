#!/usr/bin/env bun
import { WAVES, type Wave } from "@neon-spore/content";
import { bossOrder } from "./src/boss-slots.js";
import { type Composed, composeBlockAt } from "./src/compose.js";
import { type Block, readBlock } from "./src/compose-block.js";
import { LESSON_NAMES, nextLesson } from "./src/compose-lesson.js";
import { nextReview, REVIEW_NAMES } from "./src/compose-review.js";
import { stepName, thingWords } from "./src/curriculum-names.js";
import { pickNext, splitCurriculum, type Unit, unitWaves } from "./src/curriculum-order.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:order [--write [--recut]]`
 *
 * Every new thing after the tutorial arc taught again in the order of
 * `docs/spec/wave-curriculum.md` §4.1 (`src/curriculum-order.ts`): the
 * composed waves taken out, the units put in rising cost with bodies and
 * levers taking turns, each block's regular waves composed again for its new
 * neighbours — a body's, then a lesson's — the bosses placed again
 * (`bossOrder`) and the review blocks written for those left at the end.
 * Without `--write` it prints the order and says whether anything would
 * change; a second run after `--write` changes nothing. A write cuts the act
 * files after the arc again in play order (`src/waves-recut.ts`), and
 * `--recut` does that alone, for an order that already holds.
 */

const SEEDS = [0, 4, 8, 12, 16, 20];

const cur = splitCurriculum(WAVES);
const bodies = cur.units.filter((u) => u.kind === "body").map((u) => u.head.id);
const words = thingWords(WAVES, bodies);
let waves: Wave[] = [...cur.arc];

const whole = (c: readonly Composed[]) => c.every((x) => x.wave);
function compose(block: Block, prefix: string) {
  let first: ReturnType<typeof composeBlockAt> | undefined;
  for (const seed of SEEDS) {
    const got = composeBlockAt(waves, block, prefix, seed);
    first ??= got;
    if (whole(got.composed)) return got;
  }
  return first as ReturnType<typeof composeBlockAt>;
}

function stop(why: string): never {
  console.error(`stopped: ${why}`);
  process.exit(1);
}

const row = (head: string, c: readonly Composed[]) =>
  `${head.padEnd(24)}${c.map((x) => `${x.pressure ?? "—"}/${x.talk ?? "—"}`).join(" ")}`;

function insert(at: number, out: readonly Wave[]) {
  const ids = new Set(waves.map((w) => w.id));
  const names = new Set(waves.map((w) => w.name));
  const clash = out.find((w) => ids.has(w.id) || names.has(w.name) || w.name.length > 20);
  if (clash) stop(`${clash.id} "${clash.name}" is taken or longer than 20 letters`);
  waves = [...waves.slice(0, at), ...out, ...waves.slice(at)];
}

/** A block's composed waves, named, or why there are none. */
function composeUnit(u: Unit): { at: number; out: Wave[]; composed: Composed[] } | string {
  if (u.kind === "body") {
    const read = readBlock(waves, u.head.id);
    if (typeof read === "string") return read;
    const { block, composed } = compose(read, u.head.id);
    if (!whole(composed)) return composed.flatMap((c) => c.faults).join("; ");
    const out = composed.map((c) => {
      const wave = c.wave as Wave;
      return { ...wave, name: stepName(words, u.head.id, c.step, block.y) ?? wave.name };
    });
    return { at: block.insertAt, out, composed };
  }
  const lesson = nextLesson(waves);
  if (typeof lesson === "string") return lesson;
  if (lesson.prefix !== u.head.id) return `the next lesson is ${lesson.prefix}`;
  const { block, composed } = compose(lesson.block, lesson.prefix);
  if (!whole(composed)) return composed.flatMap((c) => c.faults).join("; ");
  const out = composed.map((c, i) => ({
    ...(c.wave as Wave),
    name: LESSON_NAMES[i]?.(lesson.word) ?? (c.wave as Wave).name,
  }));
  return { at: block.insertAt, out, composed };
}

console.log("block                   pressure/talk, step by step");
const left = [...cur.units];
const placed: Unit[] = [];
const refused = new Set<string>();
while (left.length > 0) {
  const u = pickNext(left, placed, refused);
  if (!u) stop(`nothing can be composed next: ${[...refused].join(", ")} refused`);
  const before = waves;
  waves = [...waves, ...unitWaves(cur, u, placed, waves)];
  const got = composeUnit(u);
  if (typeof got === "string") {
    // It waits for the next place (`pickNext`), the list as it was.
    console.log(`${u.head.id.padEnd(24)}waits: ${got}`);
    waves = before;
    refused.add(u.head.id);
    continue;
  }
  insert(got.at, got.out);
  console.log(`${row(u.head.id, got.composed)}  ${u.kind} ${u.cost}`);
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
    const name = REVIEW_NAMES[i]?.(review.plural) ?? head.name;
    return i === 0 ? { ...head, name } : { ...(c.wave as Wave), name };
  });
  insert(block.insertAt, out);
  console.log(`${row(review.prefix, composed)}  review`);
}
const settled = bossOrder(waves).order;
if (settled.some((w, i) => w.id !== waves[i]?.id)) stop("the bosses move again after the reviews");

const same = waves.length === WAVES.length && Bun.deepEquals(waves, [...WAVES]);
console.log(`\n${waves.length} waves; ${same ? "nothing changes" : "the list changes"}`);
// `--recut` cuts the act files again in play order when the order itself
// holds — the cut a reorder before 16 October 2026 left behind.
const recut = process.argv.includes("--recut");
if (!process.argv.includes("--write") || (same && !recut)) process.exit(0);
const { complaint, rels, removed } = await writeWaves(waves, undefined, { recut: true });
if (complaint) stop(complaint);
console.log(`wrote ${rels.length} files, deleted ${removed.length}`);
if (!same) console.log("then: waves:measure, briefings:renumber, baseline:blank");
