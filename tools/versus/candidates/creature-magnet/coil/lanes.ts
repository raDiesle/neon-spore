import type { MagnetShape } from "../../../../../packages/content/src/index.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import type { MagnetDraw } from "../../../../../packages/render/src/magnet.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import { magnetPoleColor } from "../../../../../packages/sim/src/magnet.js";
import { poleTip } from "./geometry.js";

/** Where an intake lane starts and ends, in body radii from the centre. It
 * reaches past the arch on both sides — that overhang is most of what makes a
 * twenty-eight-pixel body readable, because it is drawn size the contour is
 * not allowed to spend. */
const LANE_OUT = 1.66;
const LANE_IN = 1.02;

/**
 * The two intake lanes: the one thing here that is not on the shipped body.
 *
 * `sim/magnet.ts` says a shot reaches a pole only if it arrived **sideways**,
 * and today's picture never says the word: it has an opening at the *bottom*,
 * which is the one bearing the rule refuses. So each pole gets a level rail
 * running out past the arch in its own colour, with two chevrons on it
 * pointing in — *from your left, red*, drawn.
 *
 * They are chevrons and not bolts on purpose. A bullet in this game is a
 * bright head with a tail behind it (`bullets.ts`); a hollow V on a thin rail
 * has no head, so a lane cannot be misread as a shot already arriving. And
 * they are drawn before the hang, level: the lane is the bolt's path, and a
 * path does not lean because the body hanging on it does.
 */
export function lanes(d: MagnetDraw, r: number, s: MagnetShape, haze: (h: string) => string): void {
  const { ctx, c } = d;
  for (const left of [true, false]) {
    const color = magnetPoleColor(c, left);
    if (color === null) continue;
    const hex = haze(color === "red" ? PALETTE.red : PALETTE.cyan);
    // Travel, as a sign: the left pole's lane runs to the right, and its far
    // end is the side the shot is coming from.
    const t = left ? 1 : -1;
    const { y } = poleTip(r, left, s);
    const from = -t * r * LANE_OUT;
    const to = -t * r * LANE_IN;
    const rail = new Path2D();
    rail.moveTo(from, y);
    rail.lineTo(to, y);
    strokeGlow(ctx, rail, hex, STROKE.inner, 0.5);
    const arm = r * 0.17;
    for (let i = 0; i < 2; i++) {
      const at = from + (to - from) * (0.34 + i * 0.36);
      const v = new Path2D();
      v.moveTo(at - t * arm, y - arm);
      v.lineTo(at, y);
      v.lineTo(at - t * arm, y + arm);
      strokeGlow(ctx, v, hex, STROKE.inner, 0.75);
    }
  }
}
