import type { WaveEntry } from "@neon-spore/content";
import {
  type BlisterGesture,
  type BlisterLength,
  blisterLengthOf,
  DEFAULT_CONFIG,
  gestureBlows,
  gestureLengthMilli,
  gestureUpBeats,
} from "@neon-spore/sim";

/**
 * **A blister's three numbers on one cell** — beats up, blows, one blow's
 * length — each absent for its gesture's default (`sim/blister-numbers.ts`).
 * The owner, 16 October 2026: *let me able to configure the
 * timings/length/number of action required for each control.* Beside
 * `entry-fields-blister.ts`, for its size.
 *
 * Every row offers DEFAULT first, which writes no field: a blister left there
 * follows the gesture's default wherever TUNING or the game moves it. The
 * chip names the game's own default (`DEFAULT_CONFIG`), which is what the
 * wave will meet once it ships.
 */

/** A row's choice: a number, or `undefined` for the gesture's default. */
export type BlisterNumberChoice = number | undefined;

export const UP_BEATS_CHOICES: readonly BlisterNumberChoice[] = [
  undefined,
  2,
  3,
  4,
  5,
  6,
  8,
  10,
  12,
  16,
];
export const BLOWS_CHOICES: readonly BlisterNumberChoice[] = [undefined, 1, 2, 3, 4, 5, 6, 8];

/** A length's choices in its own thousandths: halves of a beat, a tile or a turn. */
const LENGTHS: Record<BlisterLength, readonly number[]> = {
  beat: [500, 1000, 1500, 2000, 3000, 4000],
  tile: [1000, 1500, 2000, 2500, 3000, 4000],
  turn: [500, 1000, 1500, 2000, 3000],
};

export function lengthChoices(gesture: BlisterGesture): readonly BlisterNumberChoice[] {
  const unit = blisterLengthOf(gesture);
  return unit === undefined ? [] : [undefined, ...LENGTHS[unit]];
}

export function setUpBeats(entry: WaveEntry, n: BlisterNumberChoice): void {
  entry.upBeats = n;
}

export function setBlows(entry: WaveEntry, n: BlisterNumberChoice): void {
  entry.blows = n;
}

export function setLengthMilli(entry: WaveEntry, n: BlisterNumberChoice): void {
  entry.lengthMilli = n;
}

/** UP's chip, DEFAULT naming the gesture's. */
export function upBeatsLabel(gesture: BlisterGesture, n: BlisterNumberChoice): string {
  return n === undefined ? `DEFAULT ${gestureUpBeats(DEFAULT_CONFIG, gesture)}` : String(n);
}

/** BLOWS' chip, DEFAULT naming the gesture's. */
export function blowsLabel(gesture: BlisterGesture, n: BlisterNumberChoice): string {
  return n === undefined ? `DEFAULT ${gestureBlows(DEFAULT_CONFIG, gesture)}` : String(n);
}

/** The chip for a length, in its unit: `2 TILES`, `1.5 BEATS`, `1 TURN`. */
export function lengthLabel(gesture: BlisterGesture, milli: number): string {
  const unit = blisterLengthOf(gesture) ?? "tile";
  const n = milli / 1000;
  return `${n} ${unit.toUpperCase()}${n === 1 ? "" : "S"}`;
}

/** LENGTH's chip, DEFAULT naming the gesture's. */
export function lengthChoiceLabel(gesture: BlisterGesture, n: BlisterNumberChoice): string {
  return n === undefined
    ? `DEFAULT ${lengthLabel(gesture, gestureLengthMilli(DEFAULT_CONFIG, gesture))}`
    : lengthLabel(gesture, n);
}
