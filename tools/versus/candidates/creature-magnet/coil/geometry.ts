import type { MagnetShape } from "../../../../../packages/content/src/index.js";

/**
 * The two bearings this candidate measures from, and the one point both of its
 * files need — kept here so neither `paint.ts` nor `lanes.ts` owns it and the
 * other copies it.
 *
 * `magnet.ts` keeps its own `poleTip` module-private, so a candidate cannot
 * call it. The arithmetic is the shape's, not the simulation's: it is the
 * midpoint of the band at the bearing `gapTurn` puts a pole at.
 */
export const TURN = Math.PI * 2;
export const DOWN = Math.PI / 2;

/** The tip of one pole, in body-local pixels — where its light hangs. */
export function poleTip(r: number, left: boolean, s: MagnetShape): { x: number; y: number } {
  const a = DOWN + (left ? 1 : -1) * s.gapTurn * TURN;
  const mid = r * (s.outer + s.inner) * 0.5;
  return { x: Math.cos(a) * mid, y: Math.sin(a) * mid };
}
