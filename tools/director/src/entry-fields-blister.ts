import type { WaveEntry } from "@neon-spore/content";
import {
  type BlisterBy,
  type BlisterGesture,
  type BlisterWay,
  DEFAULT_CONFIG,
} from "@neon-spore/sim";

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

export type { BlisterGesture, BlisterWay };

/**
 * The gestures a blister is knocked down by: TAP, HOLD and SWIPE. THE
 * BLISTER's lanes 6 and 7 each add theirs to the simulation's
 * `BlisterGesture` and here, with a WAY where it has one (`docs/queue.md`).
 */
export const BLISTER_GESTURES: readonly BlisterGesture[] = ["tap", "hold", "swipe"];

/** The ways a SWIPE may be authored to go, in the order the chips read. */
const SWIPE_WAYS: readonly BlisterWay[] = ["left", "right", "up", "down"];

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

/** The ways a gesture may go: SWIPE's four, none for TAP or HOLD, so the row is not offered. */
export function blisterWaysOf(gesture: BlisterGesture): readonly BlisterWay[] {
  return gesture === "swipe" ? SWIPE_WAYS : [];
}

/** Which way it goes. Unset is right, which `blisterWayOf` in the simulation reads. */
export function blisterWayOfEntry(entry: WaveEntry): BlisterWay {
  return entry.way ?? "right";
}

/** Set the way, right written as no field. */
export function setBlisterWay(entry: WaveEntry, way: BlisterWay): void {
  entry.way = way === "right" ? undefined : way;
}

/** BY's chips, said the way `seatLabel` says a seat on THE MINE's SEES row. */
export function byLabel(by: BlisterBy): string {
  return by === "both" ? "BOTH" : by === 1 ? "P1" : "P2";
}

/** A way's chip: the arrow the field's track points with. */
export function wayLabel(way: BlisterWay): string {
  return WAY_ARROWS[way];
}

const WAY_ARROWS: Record<BlisterWay, string> = {
  left: "←",
  right: "→",
  up: "↑",
  down: "↓",
  cw: "⟳",
  ccw: "⟲",
};

/** A gesture's chip, in the word the field's own help writes. */
export function gestureLabel(gesture: BlisterGesture): string {
  return gesture.toUpperCase();
}
