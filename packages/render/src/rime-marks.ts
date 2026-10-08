import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawLitCore } from "./lit-core.js";
import { PALETTE, STROKE } from "./palette.js";
import type { RimeFx } from "./rime-fx.js";
import {
  rimeCorePath,
  rimeCoreR,
  rimeHalfPath,
  rimeInnerPath,
  rimeLensPath,
} from "./rime-shape.js";

/**
 * **THE RIME's marks**: the three things that say what a step asks — the lit
 * half, which is *wipe this side clear*; the surge crawling in from the rim,
 * which is *shield under the lens*; and the lit core, which is *shoot here, in
 * this colour*. Cut from `rime-draw.ts` the day it was written, along the line
 * its second half grew on — the flashes `rime-fx.ts` keeps come here too.
 *
 * A step's colour is `stepColour`'s, called rather than copied: its
 * cannon's, or white for a step either answers.
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
  ctx.fillStyle = rgba(bare ? PALETTE.rock : PALETTE.rockDark, bare ? 0.5 : 0.9);
  ctx.fill(core);
  if (lit !== null) {
    // Lit for its step, from inside, and nothing past its edge (`lit-core.ts`).
    drawLitCore(
      ctx,
      core,
      lit,
      beatPhase,
      { x: 0, y: 0, r: rimeCoreR(l) * size },
      rimeCoreR(l) * 1.45,
      bright,
    );
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, bare ? 0.85 : 0.35);
  ctx.stroke(core);
}

/**
 * What `rime-fx.ts` keeps between frames, laid over the pane: a half's rim
 * flashing white as it comes clear, the pale film flashing back over a half
 * that frosts solid again, and the core hit's flash — a ring in the core's
 * colour, wider for every hit. The shatter's flash is the whole lens, pale.
 */
export function drawRimeFlashes(ctx: CanvasRenderingContext2D, l: Layout, fx: RimeFx): void {
  for (const side of [0, 1] as const) {
    const half = rimeHalfPath(l, side);
    if (fx.film(side) > 0) {
      ctx.fillStyle = rgba(PALETTE.rimeFrost, 0.6 * fx.film(side));
      ctx.fill(half);
    }
    if (fx.cleared(side) > 0)
      strokeGlow(ctx, half, PALETTE.rimeFrost, STROKE.outline, fx.cleared(side));
    if (fx.shaved(side) > 0) {
      ctx.fillStyle = rgba(PALETTE.hullRim, 0.18 * fx.shaved(side));
      ctx.fill(half);
      strokeGlow(ctx, half, PALETTE.hullRim, STROKE.inner, 1.4 * fx.shaved(side));
    }
  }
  const flash = fx.flash;
  if (flash.now > 0) {
    const ring = new Path2D();
    ring.arc(0, 0, rimeCoreR(l) * (1.6 + 0.4 * flash.hits + 0.6 * (1 - flash.now)), 0, Math.PI * 2);
    strokeGlow(ctx, ring, flash.hex, STROKE.outline, flash.now);
  }
  if (fx.shattered > 0) {
    ctx.fillStyle = rgba(PALETTE.rimeFrost, 0.5 * fx.shattered);
    ctx.fill(rimeLensPath(l));
  }
}
