import { type LeadState, leadPassing, midCol, type SimConfig } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { showsLeadCol, showsLeadLean } from "./view-role-clocks.js";

/**
 * **Where THE LEAD is**, in field pixels: the ridge it paces along above
 * row 0, the foot of the stalk on this screen, the stalk's length by what is
 * left of it, and the angle the stalk is *asked* to stand at.
 *
 * Its own file for THE SURGE's reason (`surge-shape.ts`): the drawer stands
 * the body on these (`lead-draw.ts`), the transients throw their bursts at
 * them (`lead-fx.ts`), and a ridge placed in two files would be a body drawn
 * on one line and its receipts thrown at another.
 *
 * **The foot is where the split is.** The navigator's screen puts it in the
 * body's own column, because she is shown the column; the pilot's puts it in
 * the middle of the field, every frame, whatever the column is, because he
 * is shown the lean and nothing else — on his screen the stalk is a *readout*
 * standing in one place and tilting, not a body walking (`view-role-clocks.ts`,
 * `docs/spec/bosses.md` §11.29). `test` is both: the stalk at its column,
 * leaning.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * The ridge's top above row 0, in tiles, and how thick it is; a segment's
 * length. The three together put the tip of a full stalk 1.85 tiles above
 * the grid, under the HUD's pills rather than through them — THE TASTER's fan
 * stands 1.34 above it for the same reason (`taster-draw.ts`).
 */
const RIDGE_RISE = 0.65;
const RIDGE_THICK = 0.38;
const SEG_TILES = 0.24;
/** The lean: how far off upright the stalk stands for the way it goes, in
 * radians, and how far it lies over on the last pass. */
const LEAN_ANGLE = 0.55;
const PASS_ANGLE = 1.2;

/** The ridge's line: its top, its underside and the middle between them. */
export function leadRidgeY(l: Layout): { top: number; bottom: number; mid: number } {
  const top = l.gridTop - l.tile * RIDGE_RISE;
  const bottom = top + l.tile * RIDGE_THICK;
  return { top, bottom, mid: (top + bottom) * 0.5 };
}

/** The column the stalk stands in on this screen: the body's own where the column is shown, the middle where it is not. */
export function leadFootCol(cfg: SimConfig, s: LeadState, role: Layout["role"]): number {
  return showsLeadCol(role) ? s.col : midCol(cfg);
}

/** The foot of the stalk: on the ridge's top, in this screen's column. */
export function leadFoot(l: Layout, cfg: SimConfig, s: LeadState): Point {
  return { x: tileCX(l, leadFootCol(cfg, s, l.role)), y: leadRidgeY(l).top };
}

/** How long the stalk is, in pixels: one segment's length per segment left. */
export function leadStalkLength(l: Layout, s: LeadState): number {
  return Math.max(0, s.segments) * SEG_TILES * l.tile;
}

/**
 * The angle the stalk is asked to stand at on this screen, in radians off
 * upright, positive to the right. The lean only where the lean is shown;
 * lying over the way it goes on the last pass on every screen — the pass is
 * three columns a beat and the column is on the navigator's screen already,
 * so a stalk lying flat tells her nothing her own readout does not. The
 * spring that gets it there is `lead-fx.ts`'s.
 *
 * **The still leans too, and only because the simulation says it does.**
 * `settleLean` has always put the pass's way into `s.lean` on the last beat
 * of the still, and §11.29 has always said the lean gives that pass away;
 * the angle was pinned upright through every still, so the one beat of
 * warning the fight promises the pilot was never drawn. It is the same field
 * and the same lean, read where it is written. A held stalk leans from the
 * beat the navigator takes it (`sim/lead-step.ts`), which is what her hand
 * gives him in exchange for the time it buys her.
 */
export function leadAskedAngle(s: LeadState, role: Layout["role"]): number {
  if (leadPassing(s)) return s.dir * PASS_ANGLE;
  if (!showsLeadLean(role)) return 0;
  return s.lean * LEAN_ANGLE;
}

/** Where a point `along` pixels up a stalk standing at `angle` from `foot` is. */
export function leadAlong(foot: Point, angle: number, along: number): Point {
  return { x: foot.x + Math.sin(angle) * along, y: foot.y - Math.cos(angle) * along };
}

/** The ridge, left to right, as a closed shape: a flat top the stalk stands on and a slow swell along its underside. */
export function leadRidgePath(l: Layout, time: number): Path2D {
  const { top, bottom } = leadRidgeY(l);
  const left = l.gridLeft;
  const right = l.gridLeft + l.cols * l.tile;
  const p = new Path2D();
  p.moveTo(left, top);
  p.lineTo(right, top);
  const steps = 10;
  for (let i = steps; i >= 0; i--) {
    const x = left + ((right - left) * i) / steps;
    p.lineTo(x, bottom + Math.sin(time * 0.6 + i * 0.9) * l.tile * 0.05);
  }
  p.closePath();
  return p;
}
