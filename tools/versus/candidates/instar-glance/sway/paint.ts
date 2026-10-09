import { bodyLife } from "../../../../../packages/render/src/motion-life.js";

/**
 * The head turns on one slow sine: from its rest, turned a third toward the
 * left, round past the middle to look to the right, and back. Only the snout
 * swings — the two eyes are held where the marks are (`instar-turn.ts`) —
 * so the near cheek opens, the far one squeezes and goes dark, and the horns
 * grow and shrink with their halves.
 */

/** How far the snout swings either way from the middle of its range, in head radii. */
const REACH = 0.19;
/** Where the middle of that range is, off the shipped turn: past the rest, toward the right. */
const MIDDLE = 0.05;
/** Seconds for a look to the left, to the right and back: six, the length the pair replays its pose over, so the page shows the whole of it and loops without a jump. */
const PERIOD = 6;

export function swayGlance(time: number): number {
  return (MIDDLE + REACH * Math.sin((2 * Math.PI * time) / PERIOD)) * bodyLife();
}

export function swayRoll(): number {
  return 0;
}
