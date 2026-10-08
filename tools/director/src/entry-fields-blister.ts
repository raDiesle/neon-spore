import type { WaveEntry } from "@neon-spore/content";
import { type BlisterBy, type BlisterGesture, DEFAULT_CONFIG } from "@neon-spore/sim";

/**
 * **THE BLISTER's per-arrival facts**: whose hand knocks it down, how many
 * blows it takes, by which gesture, and which way that gesture goes
 * (`docs/spec/blister.md`, *The director's settings*). THE MINE's
 * arrangement (`entry-fields-mine.ts`): BY is the wave's split rather than
 * the kind's, because the same body handed to each seat in turn is the same
 * problem said the other way round.
 *
 * Every default is written as no field at all, for `setBeadCount`'s reason:
 * a blister left where the panel opened it serialises exactly as it always
 * did.
 */

/** Whose hand may knock one down: the pilot, the navigator, or either. */
export const BLISTER_BYS: readonly BlisterBy[] = [1, 2, "both"];

/** How many blows one may be authored to take. */
export const BLISTER_COUNTS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export type { BlisterGesture };

/**
 * The gestures a blister is knocked down by: TAP and HOLD. THE BLISTER's
 * lanes 5 to 7 each add theirs to the simulation's `BlisterGesture` and here,
 * with a WAY where it has one (`docs/queue.md`).
 */
export const BLISTER_GESTURES: readonly BlisterGesture[] = ["tap", "hold"];

/** Whether this entry is a blister, and so has these rows to set. */
export function hasBlisterFields(entry: WaveEntry): boolean {
  return entry.kind === "blister";
}

/** Whose hand counts. Unset is the navigator's, which `blisterOnSpawn` reads. */
export function blisterByOf(entry: WaveEntry): BlisterBy {
  return entry.by ?? 2;
}

/** Set whose hand counts, the navigator written as no field. */
export function setBlisterBy(entry: WaveEntry, by: BlisterBy): void {
  entry.by = by === 2 ? undefined : by;
}

/** How many blows it takes. Unset is the simulation's own `blisterBlows`. */
export function blisterCountOf(entry: WaveEntry): number {
  return entry.count ?? DEFAULT_CONFIG.blisterBlows;
}

/** Set the blows, the simulation's default written as no field. */
export function setBlisterCount(entry: WaveEntry, count: number): void {
  entry.count = count === DEFAULT_CONFIG.blisterBlows ? undefined : count;
}

/** The gesture it is knocked down by. Unset is TAP, which `blisterOnSpawn` reads. */
export function blisterGestureOf(entry: WaveEntry): BlisterGesture {
  return entry.gesture ?? "tap";
}

/** Set the gesture, TAP written as no field. */
export function setBlisterGesture(entry: WaveEntry, gesture: BlisterGesture): void {
  entry.gesture = gesture === "tap" ? undefined : gesture;
}

/** The ways a gesture may go: none for TAP or HOLD, so the row is not offered. */
export function blisterWaysOf(_gesture: BlisterGesture): readonly string[] {
  return [];
}

/** BY's chips, said the way `seatLabel` says a seat on THE MINE's SEES row. */
export function byLabel(by: BlisterBy): string {
  return by === "both" ? "BOTH" : by === 1 ? "P1" : "P2";
}

/** A gesture's chip, in the word the field's own help writes. */
export function gestureLabel(gesture: BlisterGesture): string {
  return gesture.toUpperCase();
}
