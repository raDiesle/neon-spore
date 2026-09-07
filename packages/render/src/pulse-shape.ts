import type { PulseLane } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";

/**
 * What an arrow in THE PULSE is made of: its hue, its heading and its contour.
 *
 * Split out of `pulse-arrow.ts` on that file's 250-line ceiling, and the seam
 * is a real one rather than a page break. Everything here answers *what shape
 * is an arrow in this lane* and nothing here paints one; next door are the
 * three paintings of it — the body falling, the empty one on the line, and the
 * flat mark on the button it lands on — and `pulse-drop.ts` is a fourth. Four
 * callers of one contour is exactly the re-derivation CLAUDE.md bans, so the
 * contour lives on its own and every one of them calls it.
 */

/** The four hues, in `PULSE_LANES`' order. */
export const LANE_COLOR: Record<PulseLane, string> = {
  left: PALETTE.hull,
  down: PALETTE.cyan,
  up: PALETTE.pod,
  right: PALETTE.red,
};

export const LANE_RIM: Record<PulseLane, string> = {
  left: PALETTE.hullRim,
  down: PALETTE.cyanRim,
  up: PALETTE.podRim,
  right: PALETTE.redRim,
};

export const pulseLaneColor = (lane: PulseLane): string => LANE_COLOR[lane];
export const pulseLaneRim = (lane: PulseLane): string => LANE_RIM[lane];

/** How far round the nose points: 0 is up, and the four are quarters of a turn. */
export const LANE_TURN: Record<PulseLane, number> = {
  up: 0,
  right: Math.PI / 2,
  down: Math.PI,
  left: -Math.PI / 2,
};

/**
 * The contour, drawn around the origin with the nose pointing up, at radius 1.
 *
 * **A head and a shaft, and the first draft had neither.** It was written as
 * six points round a blob with one of them pulled out into a nose, on the
 * argument that everything in this game is a body — and the first frame of it
 * said the argument was wrong: four kites, none of which pointed anywhere. An
 * arrow is read by its *barbs*, the two corners that stand out sideways behind
 * the point, and a contour with no waist has none. So this is the arcade's own
 * silhouette — a wide head, a step in at the shoulders, a shaft, and a notch
 * cut up into the tail — with every corner rounded and the whole thing
 * breathing, which is what keeps it a body rather than a glyph.
 *
 * `squash` is the breath: over 1 it is taller and thinner, under 1 flatter and
 * wider, so the same shape stretches towards the line it is falling at rather
 * than simply growing.
 */
export function arrowPath(r: number, squash: number): Path2D {
  const p = new Path2D();
  const ry = r * squash;
  const rx = r / squash;
  // The waist: how far in the shaft is from the barbs, and where it starts.
  const wx = rx * 0.4;
  const wy = ry * 0.1;
  p.moveTo(0, -ry);
  // Down the right side of the head to the barb, with the edge bowed a little
  // so the head reads as grown rather than cut.
  p.quadraticCurveTo(rx * 0.72, -ry * 0.38, rx, wy);
  // Round the barb and in to the shaft.
  p.quadraticCurveTo(rx * 0.86, wy + ry * 0.16, wx, wy + ry * 0.12);
  p.lineTo(wx, ry * 0.92);
  // The notch: the tail is cut up into rather than left flat, which is what
  // stops the shaft reading as a stalk.
  p.quadraticCurveTo(wx * 0.5, ry * 0.98, 0, ry * 0.62);
  p.quadraticCurveTo(-wx * 0.5, ry * 0.98, -wx, ry * 0.92);
  p.lineTo(-wx, wy + ry * 0.12);
  p.quadraticCurveTo(-rx * 0.86, wy + ry * 0.16, -rx, wy);
  p.quadraticCurveTo(-rx * 0.72, -ry * 0.38, 0, -ry);
  p.closePath();
  return p;
}
