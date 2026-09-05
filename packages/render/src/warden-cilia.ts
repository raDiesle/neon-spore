import type { Point, WardenOpening } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";
import { inOpening, turn } from "./warden-skin.js";

/**
 * THE WARDEN's fringe: the half of CILIATE that stands **outside** the rim.
 *
 * Its own file because the line between it and `warden-skin.ts` is the body's
 * own edge, and everything follows from which side of that edge a thing is on.
 * Inside it, a mark is clipped to the material, may be covered by the plates,
 * and must never stand over the hole. Outside it, nothing is clipped, nothing
 * covers it, and what matters instead is that it does not grow across the way
 * in underneath — the slot the shot comes up, which the player reads off the
 * silhouette and not off the fill rule.
 */

/**
 * The cilia: one short hair off every point of the body's own contour, combing
 * the field around it.
 *
 * **Rooted on the sampled contour rather than on a radius worked out again
 * here.** The edge already wobbles on the wall clock, and a fringe computed
 * from its own copy of the lobing would breathe a frame out of step with the
 * skin it grows from — visible as a rim that separates from its own hair. So
 * the points the body was drawn from are the points the hairs stand on, which
 * is the rule CLAUDE.md states as *called, not re-derived*.
 *
 * They bend rather than spike: each hair leaves along the outward normal and is
 * bent sideways by a wave running round the ring, so the whole fringe combs one
 * way and then the other, the way a real one does in water. One `Path2D` and
 * one glow for all of them.
 */
export function drawWardenCilia(
  ctx: CanvasRenderingContext2D,
  outer: readonly Point[],
  cx: number,
  cy: number,
  r: number,
  time: number,
  openness: number,
  cut: WardenOpening | null,
): void {
  const hairs = new Path2D();
  const n = outer.length;
  // **Two hairs per sampled point, and short.** The first draft put one long
  // one on each of the forty and the body came back a cactus: at that spacing
  // and that length a hair is a *spine*, which is a thing that hurts you, and
  // this one has to be a thing that is alive in water. Half the length and
  // twice the count is the difference between the two, and it costs nothing —
  // the whole fringe is still one path and one glow.
  const len = r * 0.075;
  for (let i = 0; i < n * 2; i++) {
    const j = i >> 1;
    const p = outer[j] as Point;
    const q = outer[(j + 1) % n] as Point;
    // Every other hair stands halfway between two sampled points, which is
    // still *on* the drawn edge: the contour is smoothed through those points,
    // and the chord between two neighbours a ninth of a turn apart is within a
    // fraction of a pixel of it.
    const f = i % 2 === 0 ? 0 : 0.5;
    const x = p.x + (q.x - p.x) * f;
    const y = p.y + (q.y - p.y) * f;
    const a = turn(x, y, cx, cy);
    if (inOpening(a, cut)) continue;
    const ox = Math.cos(a);
    const oy = Math.sin(a);
    // The comb: a wave travelling round the ring rather than every hair
    // flicking on its own clock, so the fringe reads as one surface moving in
    // water instead of eighty independent twitches.
    const sway = Math.sin(time * 1.9 + i * 0.31) * 0.75;
    // Long, short, long, and never the same two in a row: an even fringe reads
    // as a gear, which is `eye.ts`'s argument about its own lashes.
    const grow = len * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.17))) * (1 + openness * 0.25);
    hairs.moveTo(x, y);
    hairs.quadraticCurveTo(
      x + ox * grow * 0.55 - oy * sway * grow * 0.5,
      y + oy * grow * 0.55 + ox * sway * grow * 0.5,
      x + ox * grow - oy * sway * grow,
      y + oy * grow + ox * sway * grow,
    );
  }
  strokeGlow(ctx, hairs, PALETTE.eyeFluid, STROKE.inner * 0.5, 0.3 + openness * 0.3);
}
