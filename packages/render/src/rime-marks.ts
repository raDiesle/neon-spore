import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import {
  rimeCorePath,
  rimeCoreR,
  rimeHalfPath,
  rimeInnerPath,
  rimeLensPath,
} from "./rime-shape.js";
import { seamColour } from "./seam-marks.js";

/**
 * **THE RIME's marks**: the three things that say what a step asks — the lit
 * half, which is *wipe this side clear*; the surge crawling in from the rim,
 * which is *shield under the lens*; and the lit core, which is *shoot here, in
 * this colour*. Cut from `rime-draw.ts` the day it was written, along the line
 * its second half will grow on — the cue words and the flakes come here.
 *
 * A step's colour is THE SEAM's (`seamColour`), called rather than copied a
 * fourth time: its cannon's, or white for a step either answers.
 */

/** The lit half's outline, glowing white on its beat: a wipe is one seat's, and neither colour is its answer. */
export function drawRimeLitHalf(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  beatPhase: number,
): void {
  const pulse = 0.8 + 0.2 * Math.cos(beatPhase * Math.PI * 2);
  const half = rimeHalfPath(l, side);
  strokeGlow(ctx, half, PALETTE.hullRim, STROKE.outline, pulse, 0.7);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9 * pulse);
  ctx.stroke(half);
}

/**
 * A surge, `surge` of the way in: frost crawling in over the whole pane from
 * its rim, thicker as the shield step runs out, with the pane's edge lit
 * white — the shield is asked of both seats at once.
 */
export function drawRimeSurge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  surge: number,
  beatPhase: number,
): void {
  const lens = rimeLensPath(l);
  const inner = rimeInnerPath(l, 1 - 0.8 * surge);
  const ring = new Path2D();
  ring.addPath(lens);
  ring.addPath(inner);
  ctx.fillStyle = rgba(PALETTE.rimeFrost, 0.55 + 0.35 * surge);
  ctx.fill(ring, "evenodd");
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rimeFrostDeep, 0.8);
  ctx.stroke(inner);
  const pulse = 0.8 + 0.2 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlow(ctx, lens, PALETTE.hullRim, STROKE.outline, pulse, 0.7);
}

/**
 * The core at the heart of the pane: dark glass while the frost is over it,
 * catching the light once it is bare, and lit in the step's colour while a
 * shot is owed — brighter for every hit it has taken, with a ring round it
 * closing as the step's beats run out.
 */
export function drawRimeCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  size: number,
  bright: number,
  bare: boolean,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  const core = rimeCorePath(l, size);
  if (lit === null) {
    ctx.fillStyle = rgba(bare ? PALETTE.rock : PALETTE.rockDark, bare ? 0.5 : 0.9);
    ctx.fill(core);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, bare ? 0.85 : 0.35);
    ctx.stroke(core);
    return;
  }
  const { body, rim } = seamColour(lit.color);
  ctx.fillStyle = rgba(body, bright * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
  ctx.fill(core);
  strokeGlow(ctx, core, rim, STROKE.inner, 0.8 + bright);
  const ring = new Path2D();
  ring.arc(0, 0, rimeCoreR(l) * 1.45, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}
