import { controlSet, setHas, type Wave, waveTalk } from "@neon-spore/content";
import { type Composed, composeBlockAt } from "./compose.js";
import { type Block, placeable, poolOf, readBlock } from "./compose-block.js";
import {
  blocksBefore,
  gentlestBefore,
  isFiller,
  isReviewHead,
  startsBlock,
} from "./compose-starts.js";
import { type Step, TUTORIAL_LAST_ID } from "./compose-steps.js";
import { regularAt } from "./list-reading.js";

/**
 * **A filler**: three regular waves of things already taught, between a
 * block and the boss that closes it — `docs/spec/wave-curriculum.md` §7.
 * The owner, 17 October 2026: *boss waves … should not be associated with a
 * parent wave list, which parent introduces something new. instead create
 * some new parent wave with maybe 3 number of waves, which just reuse what we
 * have so far then the boss.* So past the tutorial arc no boss folds under a
 * wave that teaches: it folds under its filler, and the next block teaches.
 *
 * Its steps are **Breathe, Recall, Bend** (`FILLER_STEPS`): the block before
 * ended on its Peak, so the filler drops back to the oldest basics, brings
 * back something from far behind, and rises into the boss with one known
 * lever — the next tooth of the sawtooth, short. **It has no theme**: each
 * wave draws a few of everything taught before the last body
 * (`Block.pool`), and never that body, whose own block it follows — the
 * owner, 19 October 2026, of SOFT MORSEL after THE MORSEL's block: *should
 * not repeat another parent*. It is named for the boss it leads to
 * (`compose-names.ts`). It plays on the panel the game has reached, never
 * THE CLAW's, whose waves are pods alone.
 *
 * A review block (`compose-review.ts`) teaches nothing either, so a boss
 * behind one needs no filler; nor does a boss in the arc, whose blocks are
 * the basics themselves. A filler is no block of its own (`isFiller`): boss
 * placement reads it as the end of the block it follows, so the boss stays
 * where it was put.
 */

export const FILLER_STEPS: readonly Step["id"][] = ["R5", "R6", "R7"];

export interface Filler {
  block: Block;
  /** The boss it leads to, by id. */
  boss: string;
  /** The intro of the last body taught, which it leaves out. */
  theme: string;
  /** Every composed id starts with it: `filler` and the boss's name. */
  prefix: string;
}

const capital = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/** The filler's ids, for a boss: THE GAUGE's is `fillerGauge…`. */
export function fillerPrefix(bossId: string): string {
  return `filler${capital(bossId.replace(/^the(?=[A-Z])/, ""))}`;
}

/** Where the block a wave belongs to starts: an intro, a lesson or a review. */
function blockStart(waves: readonly Wave[], at: number): number {
  let s = at;
  while (s > 0 && !startsBlock(waves, s)) s--;
  return s;
}

/** Whether a boss past the arc closes a block that teaches, with nothing
 * between: the waves it follows are not a filler's or a review's. */
export function wantsFiller(waves: readonly Wave[], at: number): boolean {
  const finale = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  const before = waves[at - 1];
  if (at <= finale || !waves[at]?.boss || !before || before.boss || isFiller(before.id)) {
    return false;
  }
  const start = blockStart(waves, at - 1);
  return start > finale && !isReviewHead(waves, start);
}

/** The panel the game plays on at `at`: the nearest regular wave's above
 * it, passing over THE CLAW's. */
function panelAt(waves: readonly Wave[], at: number): Wave["controls"] {
  for (let i = at - 1; i > 0; i--) {
    const w = waves[i] as Wave;
    if (w.boss || !regularAt(waves, i) || setHas(controlSet(w.controls), "reach")) continue;
    return w.controls;
  }
  return undefined;
}

/** The next boss with no filler in front of it, and the filler it wants —
 * or why there is none. */
export function nextFiller(waves: readonly Wave[]): Filler | string {
  const at = waves.findIndex((_, i) => wantsFiller(waves, i));
  const boss = waves[at];
  if (!boss) return "every boss has its filler";
  let t = blockStart(waves, at - 1);
  let read: Block | string = "no body taught before it";
  for (; t > 0; t--) {
    if (placeable(waves, t) === undefined) continue;
    read = readBlock(waves, waves[t]?.id ?? "");
    if (typeof read !== "string") break;
  }
  if (typeof read === "string") return `${boss.id}: ${read}`;
  const floor = gentlestBefore(waves, at);
  const talkFloor = gentlestBefore(waves, at, waveTalk);
  const { leads: _l, after: _a, floor: _f, talkFloor: _t, lesson: _s, ...rest } = read;
  const block: Block = {
    ...rest,
    tutorial: false,
    existing: 0,
    sinceTutorial: blocksBefore(waves, at),
    ...(floor === undefined ? {} : { floor }),
    ...(talkFloor === undefined ? {} : { talkFloor }),
    insertAt: at,
    controls: panelAt(waves, at),
    only: FILLER_STEPS,
    pool: poolOf(read, read.x),
  };
  return { block, boss: boss.id, theme: waves[t]?.id ?? "", prefix: fillerPrefix(boss.id) };
}

const SEEDS = [0, 4, 8, 12, 16, 20];

const whole = (c: readonly Composed[]) => c.length > 0 && c.every((x) => x.wave);

/** Every filler the list still wants, composed into it in turn, the ids
 * composed added to `ids` — or why one could not be. */
export function addFillers(list: Wave[], ids: Set<string>, log = console.log): Wave[] | string {
  let out = list;
  for (;;) {
    const filler = nextFiller(out);
    if (typeof filler === "string") {
      return filler === "every boss has its filler" ? out : filler;
    }
    let got: ReturnType<typeof composeBlockAt> | undefined;
    for (const seed of SEEDS) {
      got = composeBlockAt(out, filler.block, filler.prefix, seed);
      if (whole(got.composed)) break;
    }
    if (!got || !whole(got.composed)) {
      return `${filler.prefix}: ${got?.composed.flatMap((c) => c.faults).join("; ")}`;
    }
    const made = got.composed.map((c, i) => {
      const { variant: _v, ...head } = c.wave as Wave;
      return i === 0 ? head : (c.wave as Wave);
    });
    const taken = new Set(out.map((w) => w.id));
    const clash = made.find((w) => taken.has(w.id));
    if (clash) return `${clash.id} is already a wave`;
    for (const w of made) ids.add(w.id);
    const at = filler.block.insertAt;
    out = [...out.slice(0, at), ...made, ...out.slice(at)];
    const row = got.composed.map((c) => `${c.pressure ?? "—"}/${c.talk ?? "—"}`).join(" ");
    log(`${filler.prefix.padEnd(24)}${row}  on ${filler.theme}, before ${filler.boss}`);
  }
}
