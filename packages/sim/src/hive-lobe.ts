import type { SimConfig } from "./config.js";
import { type HiveState, hiveNext, hiveSwelling, hiveTwins } from "./hive.js";
import type { Color } from "./types.js";

/**
 * **One lobe of THE HIVE's underside, and the two gestures it answers to.**
 *
 * `hive.ts` is the mass: where it is, when the next site opens, how many are
 * still unscarred. This file is the *second axis* — what one lobe is, which
 * is a different question with a different answer for every site at once,
 * and the one the two new thumbs are asked about (`hive-hand.ts`).
 *
 * It is here rather than there because the mass's clock and the lobe's state
 * are read by different callers: the clock by the step and the sheet, the
 * lobe by the thumb, the bolt and the picture. Keeping them in one file put
 * `hive.ts` 27 lines under its ceiling with the look's half of this lane
 * still unwritten, so the seam was cut while the diff was about it.
 */

/**
 * What one lobe of the underside is, and the gesture that answers it: a
 * lobe **swelling** is held to wring the colour out of it, a **wrung**
 * breach is sealed by either colour, an **open** one by its own alone, and
 * a **sealed** one is a scar that swallows a bolt like skin.
 *
 * A lobe that has not swelled yet has no name here: its picture is the
 * mass's own `hang` (`HIVE_PHASES`), which is what the underside looks like
 * everywhere nothing is happening.
 */
export const HIVE_LOBES = ["swelling", "wrung", "open", "sealed"] as const;
export type HiveLobe = (typeof HIVE_LOBES)[number];

/** No thumb on any lobe. A site index is never negative, so one number says both. */
export const NO_PINCH = -1;

/**
 * Whether site `i` is one of the lobes swelling at `beat` — the ones a thumb
 * may be held on.
 *
 * The pair that opens in twins swells in twins: from `hiveTwinFrom` both of
 * the next two are hanging low, and either may be wrung. **Never while the
 * mass is clenched**, because a clenched underside is drawn up out of a
 * thumb's reach, and that is the whole of what the clench costs them.
 */
export function hiveSwellingAt(s: HiveState, cfg: SimConfig, beat: number, i: number): boolean {
  if (!hiveSwelling(s, cfg, beat) || hiveClenched(s)) return false;
  const next = hiveNext(s);
  return i >= next && i < next + (hiveTwins(s, cfg) ? 2 : 1) && i < s.cols.length;
}

/** Whether the underside is clenched up out of reach: nothing spills and nothing seals. */
export function hiveClenched(s: HiveState): boolean {
  return s.phase === "clench";
}

/** Whether site `i` opened with its colour wrung out of it: either colour seals it. */
export function hiveWrungAt(s: HiveState, i: number): boolean {
  return s.wrung[i] === true;
}

/** Whether a bolt of `color` into site `i` seals it: its own colour, or any at all once wrung. */
export function hiveSealedBy(s: HiveState, i: number, color: Color): boolean {
  return hiveWrungAt(s, i) || s.colors[i] === color;
}

/** Which lobe the navigator's thumb is on, or `NO_PINCH`. */
export function hivePinched(s: HiveState): number {
  return s.pinch;
}

/** Whether that thumb has been there long enough to wring the colour out. */
export function hivePinchDone(s: HiveState, cfg: SimConfig, beat: number): boolean {
  return s.pinch !== NO_PINCH && beat - s.pinchBeat >= cfg.hivePinchBeats;
}

/** Whether the clench has been hauled down far enough to relax early. */
export function hiveHauled(s: HiveState, cfg: SimConfig): boolean {
  return s.haulMilli >= cfg.hiveHaulMilli;
}

/**
 * The beat a clench runs out on its own, or `-1` when nothing is clenched.
 * The picture counts down to it and the step relaxes on it.
 */
export function hiveClenchUntil(s: HiveState, cfg: SimConfig): number {
  return hiveClenched(s) ? s.phaseBeat + cfg.hiveClenchBeats : -1;
}

/** What one lobe is right now, or `null` for a site the underside has not raised yet. */
export function hiveLobeAt(s: HiveState, cfg: SimConfig, beat: number, i: number): HiveLobe | null {
  if (s.sealed[i] === true) return "sealed";
  if (i < s.opened) return hiveWrungAt(s, i) ? "wrung" : "open";
  return hiveSwellingAt(s, cfg, beat, i) ? "swelling" : null;
}
