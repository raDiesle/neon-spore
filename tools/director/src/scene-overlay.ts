import { beatsFromSeconds, REST } from "@neon-spore/content";
import { clearSurface, PALETTE, STROKE, strokeGlow } from "@neon-spore/render";
import { contourAt } from "@neon-spore/shape-sheet";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import type { Placed } from "./scene-art.js";

/**
 * **Drawing a scene's bodies**, once the placing next door has said where each
 * of them stands.
 *
 * Its own file beside `scene-art.ts`, split when that one reached the 250-line
 * ceiling, along the seam it already had. `scene-art.ts` decides *where*: the
 * fit, the scale a draft is drawn at, the half-height a label clears, one
 * `Placed` per body, and none of it touches a context. Here is *what a frame
 * looks like*: the own-motion applied exactly as `render/creatures.ts` applies
 * it, the ghost's thin dashed line, the glow, the label under it. The two are
 * asked different questions — a body in the wrong place is a fit problem and a
 * body swaying by the wrong rule is a comparison problem.
 *
 * `TINT` stays next door: it is read where a `Placed`'s colour is decided, and
 * by the time a body arrives here it carries one.
 */

/**
 * One frame of the overlay.
 *
 * The own-motion is applied exactly as `render/creatures.ts` applies it —
 * offsets in tiles multiplied by the frame's own tile, then rotation and
 * scale about the body's centre. A draft that swayed by a different rule here
 * would be a draft nobody could compare to the bulb standing next to it.
 */
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  placed: Placed[],
  t: number,
  dpr: number,
): void {
  // Before the scale, and in device pixels: a `clearRect` under a ratio
  // below one covers less than the surface and leaves the last frame
  // standing down the right edge (`render/surface-clear.ts`).
  clearSurface(ctx);
  ctx.save();
  ctx.scale(dpr, dpr);
  for (const p of placed) {
    // `t` is seconds, as it is everywhere a contour is sampled; a pose is
    // counted in beats, because the field's is (`content/own-motion.ts`).
    const pose = p.entry.motion?.poseAt(beatsFromSeconds(t, DEFAULT_CONFIG.bpm)) ?? REST;
    ctx.save();
    ctx.translate(p.centre.x + pose.dx * p.tile, p.centre.y + pose.dy * p.tile);
    ctx.rotate(p.turn + pose.rot);
    ctx.scale(p.scale * pose.sx, p.scale * pose.sy);
    ctx.translate(-p.mid.x, -p.mid.y);
    const path = new Path2D(contourAt(p.entry.subject, t));
    if (p.ghost) {
      // No glow and a thin line: a copy the other screen holds is not a thing
      // in this field, and drawing it as brightly as the body would say it is.
      ctx.globalAlpha = 0.34;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = STROKE.outline / p.scale;
      ctx.setLineDash([6 / p.scale, 5 / p.scale]);
      ctx.stroke(path);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    } else {
      strokeGlow(ctx, path, p.color, STROKE.outline / p.scale, 0.8);
    }
    ctx.restore();
    // Clear of the bottom of what was actually drawn, plus the gap a creature
    // used to get from `tile * 0.5` — that offset was the lane-wide body's
    // half-height and a tenth of a lane under it, and only the first half of
    // it was ever about the tile.
    if (p.label) label(ctx, p.centre.x, p.centre.y + p.halfHeight + p.tile * 0.1, p.label);
  }
  ctx.restore();
}

function label(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
  ctx.save();
  ctx.font = '9px ui-monospace, "IBM Plex Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(text, x, y + 4);
  ctx.restore();
}

/**
 * The marks live next door, in `scene-marks.ts`, and are re-exported here for
 * the reason they were re-exported from `scene-art.ts` before this split: a
 * caller asking for a scene's drawing asks one file for all of it. There is
 * one such caller now — `scene-panel.ts` — and it takes both names on one
 * line.
 */
export { drawMarks } from "./scene-marks.js";
