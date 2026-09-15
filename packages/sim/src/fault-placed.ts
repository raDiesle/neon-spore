import { faultStep } from "./fault-clock.js";
import type { Malfunction, MalfunctionKind } from "./malfunction.js";
import type { World } from "./world.js";

/**
 * **A FAULT IS A PENCIL ON THE MAP**: a kind, the beat it enters the wave on,
 * and the number of beats it holds.
 *
 * The owner asked for this on 14 September 2026, in one sentence: *all
 * malfunctions are not attached to the wave, but a pencil to be placed on the
 * map, so I can define when it enters the wave (what beat row) and when it
 * ends.* Until then a wave carried exactly one fault, for the whole of itself,
 * written as a field beside its boss — and only THE HANDOVER could say when,
 * because only THE HANDOVER had ever needed to.
 *
 * So the fault joins the arrivals: it is placed on a beat row the way a rock
 * is, a wave may carry several, and the same kind may be placed twice with
 * quiet in between. What that buys an author is the thing a whole-wave fault
 * could not say — *the gun runs away for eight beats in the middle of this,
 * and the pair has the first eight and the last eight to set up for it.*
 *
 * **Overlapping placements are allowed and every one of them is in force.**
 * Nothing here picks a winner: `faultsNow` answers a list, `faultSwallows`
 * asks it whether *any* of them eats this press, and `stepMalfunction` runs
 * each. Two faults at once is a wave nobody has authored yet and may be a bad
 * wave, but a rule that silently dropped the second would be a pencil an
 * author could place and never see.
 *
 * Split from `malfunction.ts` rather than added to it: that file is what a
 * fault *does*, this is *when*, and the second one is what every fault now has
 * in common.
 */

/**
 * A fault with its rows on it, as the world holds it.
 *
 * `beats` is resolved here rather than left optional: `startWave` takes the
 * list already settled, so nothing downstream carries a second copy of what a
 * missing number meant — the same reason a wave's queue arrives built.
 */
export type PlacedFault = Malfunction & {
  /** The fault's own first beat, counted the way an arrival's `beat` is. */
  at: number;
  /** How many beats it holds. `TO_THE_END` for the rest of the wave. */
  beats: number;
};

/**
 * A fault placed with no end: on from `at` until the wave is over.
 *
 * Zero rather than a large number, so it is a value a hash can push and an
 * author can read as *no end written* rather than as an arbitrary ceiling. It
 * is what every wave that used to carry a whole-wave fault is written with.
 */
export const TO_THE_END = 0;

/** Whether a placement covers a given beat of the wave. */
export function faultCovers(f: PlacedFault, step: number): boolean {
  if (step < f.at) return false;
  return f.beats === TO_THE_END || step < f.at + f.beats;
}

/**
 * Every fault in force on this beat, in the order the wave places them.
 *
 * `faultStep` and not `waveBeat`: the fault's own clock is the wave's beat less
 * one, so an author writing `at: 0` means the first beat of the wave — the same
 * number an arrival on beat 0 means (`fault-clock.ts`).
 */
export function faultsNow(world: World): readonly PlacedFault[] {
  const step = faultStep(world);
  return world.faults.filter((f) => faultCovers(f, step));
}

/**
 * The fault of one kind in force now, or null.
 *
 * The one question four of the five faults ask about themselves — *is THE
 * CODEX on this wave*, *is THE CHOKE* — and it is a different question now
 * that it has an answer that changes mid-wave. Asked here so every one of them
 * asks it the same way.
 */
export function faultOn(world: World, kind: MalfunctionKind): PlacedFault | null {
  return faultsNow(world).find((f) => f.kind === kind) ?? null;
}

/** Whether a wave carries a fault of this kind **anywhere in it**, in force or
 * not yet. For a panel or a picture that is a fact about the wave rather than
 * about the beat. */
export function faultInWave(world: World, kind: MalfunctionKind): boolean {
  return world.faults.some((f) => f.kind === kind);
}

/**
 * The window this kind is in, or the next one coming — and null when the wave
 * carries none at all.
 *
 * THE HANDOVER's countdown is why it exists: the plate on the band says how
 * many beats until the panels change, which means looking forward to a
 * placement that has not started yet. `to` is the beat after the last one it
 * holds, and `TO_THE_END`'s window has no end, which is written as a `to` of
 * `Number.POSITIVE_INFINITY` — a comparison rather than a number anybody
 * stores.
 */
export function faultWindow(
  world: World,
  kind: MalfunctionKind,
): { from: number; to: number } | null {
  const step = faultStep(world);
  const ours = world.faults.filter((f) => f.kind === kind);
  if (ours.length === 0) return null;
  const ending = (f: PlacedFault): number =>
    f.beats === TO_THE_END ? Number.POSITIVE_INFINITY : f.at + f.beats;
  // The one covering this beat, and failing that the first one still to come —
  // and failing that the last one, so a countdown past the final window reads
  // as over rather than as none at all.
  const here = ours.find((f) => faultCovers(f, step));
  const next = ours.find((f) => f.at > step);
  const pick = here ?? next ?? ours[ours.length - 1];
  if (!pick) return null;
  return { from: pick.at, to: ending(pick) };
}
