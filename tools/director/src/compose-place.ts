import { PACE_REST_BEATS, paceBeats, type Wave, type WaveEntry } from "@neon-spore/content";
import { next, nextInt, type Rng } from "@neon-spore/sim";
import type { Block, Motif } from "./compose-block.js";
import { fastSlidesAllowed, gapRule, needsBasics, type Step } from "./compose-steps.js";

/**
 * **One step of a block, placed** — the table in
 * `docs/spec/wave-curriculum.md` §6 turned into entries. Every arrival is a
 * copy of one its thing's intro wave wrote (`compose-block.ts`), moved to a
 * column and a beat; nothing here invents a body.
 *
 * It places and does not judge: `compose-check.ts` says whether the wave is
 * one to keep, and the composer draws again until it is.
 */

const LAST_COL = 10;

const pick = <T>(rng: Rng, list: readonly T[]): T | undefined => list[nextInt(rng, list.length)];
const between = (rng: Rng, [lo, hi]: readonly [number, number]): number =>
  lo + nextInt(rng, hi - lo + 1);

/** A slick or a bulb: the game's ordinary enemy, which §4 wants to be at least
 * half of everything from R4 on. */
export function isBasic(e: WaveEntry): boolean {
  return e.kind === undefined;
}

/** Up to `n` different things off `list`, drawn from `rng`. */
function several(rng: Rng, list: readonly string[], n: number): string[] {
  const left = [...list];
  const out: string[] = [];
  while (out.length < n && left.length > 0) out.push(...left.splice(nextInt(rng, left.length), 1));
  return out;
}

/** How many things a wave of a block with no theme of its own mixes. */
const POOL_MIX = 3;

/** The kinds a step cycles through, before the basics are mixed in. */
function cycle(block: Block, step: Step, rng: Rng): string[] {
  // A filler, a lesson or a review has no thing of its own to teach: every
  // wave of it is a few of the things already taught, drawn afresh.
  if (block.pool && block.pool.length > 0) return several(rng, block.pool, POOL_MIX);
  const y = block.y ?? block.x;
  // Older things are the slick and the bulb too, which come anyway (§4):
  // a recall brings something else back when there is one.
  const older = block.z.filter((id) => id !== "slick" && id !== "bulb");
  const [z1 = y, z2 = z1] = several(rng, older.length > 0 ? older : block.z, 2);
  const b = pick(rng, block.basics) ?? y;
  // A pod hangs and waits to be taken; a wave of nothing else gives it
  // nothing to do (purge clears what falls), so a pod is never alone: each
  // one has two bodies after it.
  const isPod = (block.motifs.get(block.x) ?? []).some((m) => m.pods.length > 0);
  switch (step.mix) {
    case "x":
      return isPod ? [block.x, b, b] : [block.x];
    case "xy":
    case "xyLever":
      return [block.x, y];
    case "xb":
      return [block.x, b];
    // The owner, 19 October 2026: *mix in more often existing other enemy
    // types* — two older things in a recall, and in a peak one beside the
    // block before's, the new thing between each.
    case "xz":
      return [block.x, z1, block.x, z2];
    case "xyz":
      return [block.x, y, block.x, z1];
  }
}

/** A column for the next arrival: in the step's range, and on R3 far from the
 * one before it. */
function column(rng: Rng, step: Step, prev: number): number {
  for (let tries = 0; tries < 20; tries++) {
    const col = between(rng, step.cols);
    if (step.jump ? Math.abs(col - prev) >= 4 : col !== prev) return col;
  }
  return between(rng, step.cols);
}

/** A motif put down at a beat, by its anchor at a column. */
function put(motif: Motif, beat: number, col: number): Pick<Wave, "entries" | "pods"> {
  const shift = (c: number) => Math.max(0, Math.min(LAST_COL, c + col - motif.anchor));
  return {
    entries: motif.entries.map((e) => ({ ...e, beat: e.beat + beat, col: shift(e.col) })),
    pods: motif.pods.map((p) => ({ ...p, beat: p.beat + beat, col: shift(p.col) })),
  };
}

/** Whether a motif may land with a twin: a slick, a bulb or a rock. Two of
 * the block's new thing at once is a different wave from the one it teaches —
 * and two fences, or two magnets, is one AUTO never clears. */
function twinnable(motif: Motif): boolean {
  return (
    motif.pods.length === 0 &&
    motif.entries.every((e) => e.kind === undefined || e.kind.startsWith("meteor"))
  );
}

/** The other column of a pair landing together: the mirror, unless that is
 * too close to tell apart. */
function partner(col: number): number {
  const mirror = LAST_COL - col;
  return Math.abs(mirror - col) >= 3 ? mirror : col <= 5 ? col + 3 : col - 3;
}

/** How often a step that may still make its fast slide takes one when the
 * gap it drew is too short for the columns: otherwise the arrival waits. */
const SLIDE_CHANCE = 0.5;

/**
 * The beat the next arrival lands on, `cols` columns from the last one which
 * ended at `end`, given the beat it drew: later when the gap is too short to
 * slide across (`paceBeats`) — the owner: *when unsure, wait for the next
 * enemy* — unless the wave takes its one fast slide here, and never sooner
 * than a rest after a fast slide (`wave-pace.ts`).
 */
function paced(
  rng: Rng,
  pace: { slides: number; rest: boolean },
  end: number,
  drawn: number,
  cols: number,
): number {
  let beat = pace.rest ? Math.max(drawn, end + PACE_REST_BEATS) : drawn;
  pace.rest = false;
  if (beat - end >= paceBeats(cols)) return beat;
  if (pace.slides > 0 && next(rng) < SLIDE_CHANCE) {
    pace.slides--;
    pace.rest = true;
  } else beat = end + paceBeats(cols);
  return beat;
}

/** The step's wave, drawn once from `rng`. */
export function placeStep(block: Block, step: Step, rng: Rng): Pick<Wave, "entries" | "pods"> {
  const kinds = cycle(block, step, rng);
  const basicsFor: string[] = block.basics.filter((id) => id === "slick" || id === "bulb");
  const entries: WaveEntry[] = [];
  const pods: NonNullable<Wave["pods"]> = [];
  // The peak's gaps are the gap rule's, unless the step was eased wider
  // (`arcStep`).
  const lo = step.id === "R8" ? Math.max(gapRule(block.number), step.gaps[0] - 2) : step.gaps[0];
  let beat = 0;
  let end = 0;
  let prev = 5;
  const pace = { slides: fastSlidesAllowed(step, block.tutorial), rest: false };
  // `k` counts what is placed; `c` walks the cycle, and stands still while a
  // slick or a bulb is put in to keep them half of the wave — so the cycle's
  // own kinds all still come, only further apart.
  for (let k = 0, c = 0; ; k++) {
    let kind = kinds[c % kinds.length] ?? block.x;
    const basic = entries.filter(isBasic).length;
    const short = basic * 2 < entries.length + pods.length + 1;
    if (needsBasics(step) && short && !basicsFor.includes(kind) && basicsFor.length > 0) {
      kind = pick(rng, basicsFor) ?? kind;
    } else c++;
    const motif = pick(rng, block.motifs.get(kind) ?? []);
    if (!motif) break;
    const col = column(rng, step, prev);
    if (k > 0) beat = paced(rng, pace, end, beat, Math.abs(col - prev));
    if (beat + motif.length > step.span[1]) break;
    const placed = put(motif, beat, col);
    entries.push(...(placed.entries ?? []));
    pods.push(...(placed.pods ?? []));
    // R7's lever: one arrival in three lands with a twin across the field —
    // the second of each three, then the third, then the first.
    const room = entries.length + pods.length + motif.entries.length <= step.arrivals[1];
    if ((k + 2) % 3 < (step.twins ?? 0) && twinnable(motif) && room) {
      entries.push(...(put(motif, beat, partner(col)).entries ?? []));
    }
    if (entries.length + pods.length >= step.arrivals[1]) break;
    prev = col;
    end = beat + motif.length;
    beat = end + between(rng, [lo, Math.max(lo, step.gaps[1])]);
  }
  entries.sort((a, b) => a.beat - b.beat || a.col - b.col);
  // A pod after the last body hangs over a wave that is already over: drop it,
  // and let the checks say whether what is left still fits.
  const last = Math.max(-1, ...entries.map((e) => e.beat));
  for (let i = pods.length - 1; i >= 0; i--) if ((pods[i]?.beat ?? 0) >= last) pods.splice(i, 1);
  return pods.length > 0 ? { entries, pods } : { entries };
}
