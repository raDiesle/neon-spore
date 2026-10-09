/**
 * The resting tail sweeps on one slow swing, never stopping: from up to the
 * right of the rear, where it ships, over the middle to up to the left, and
 * back. A lash takes it over wherever it is (`instar-tail.ts`), so the fork
 * is always over its marks.
 */

/** Seconds for a sweep to the left and back: six, the length the pair replays its pose over. */
const PERIOD = 6;

export function pendulumLean(time: number): number {
  // Begun from the middle, swinging left, so the first frame is not the shipped one.
  return -Math.sin((2 * Math.PI * time) / PERIOD);
}
