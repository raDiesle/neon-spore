import { blobPoints, POD } from "@neon-spore/content";
import { GAUGE_FULL } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { aimAt, along } from "./gauge-claw.js";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE GAUGE's pod: where the band is, drawn as the thing this game already
 * spends on "here, this is the thing" (`gauge-claw.ts` has why). Its own file
 * beside the claw's because the one claim the picture makes is about it —
 * **its width is the span** — and because the claw brings one home in its
 * hand on a call that lands (`gauge-catch.ts`), which is this same body.
 */

/** How far out the pod stands, as a share of the radius — `gaugeBandMid`'s. */
export const POD_REACH = 0.81;

/**
 * The half-width the pod is drawn at, in pixels: `R·tan θ`, θ the span's own
 * angle about the pivot. Exported because it is the one claim this picture
 * makes that a test can hold (`gauge-claw.test.ts`).
 */
export function podHalfWidth(dial: Dial, spanMilli: number): number {
  const theta = Math.min(Math.PI * 0.45, (spanMilli / GAUGE_FULL) * Math.PI);
  return dial.r * POD_REACH * Math.tan(theta);
}

/**
 * The pod, standing still at the mark, its width across the claw's sweep. The
 * contour is the moored pod's (`POD`, `pods.ts`) held at one instant so the
 * width it is judged by does not breathe, and scaled on its own widest point
 * rather than on `rx`: the lobes stand past the ellipse, and a pod scaled on
 * the ellipse would be wider than the call it is standing for. No mark in the
 * middle — this is not a cargo of any kind, only where the claw has to be.
 *
 * `grow` is how far into being it is: a band a call has just spent stands
 * somewhere new, and it swells there while the claw is bringing the old one
 * home. It is only ever below 1 inside the rest between two calls, so no call
 * is judged against a pod drawn narrower than its span.
 */
export function drawGaugePod(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  markMilli: number,
  spanMilli: number,
  glow: number,
  grow = 1,
): void {
  if (grow <= 0) return;
  const w = podHalfWidth(dial, spanMilli) * grow;
  const at = dial.r * POD_REACH;
  const d = along(markMilli);

  halo(ctx, dial.cx + d.x * at, dial.cy + d.y * at, w * 2.2, PALETTE.pod, 0.12 + 0.1 * glow);
  ctx.save();
  aimAt(ctx, dial, markMilli);
  ctx.translate(0, -at);
  drawPodBody(ctx, w, glow);
  ctx.restore();
}

/**
 * The pod's own body at the origin of whatever frame it is standing in, its
 * widest point `w` either side. The pod at the mark and the pod in the hand on
 * the way home are this one drawing (`gauge-catch.ts`).
 */
export function drawPodBody(ctx: CanvasRenderingContext2D, w: number, glow: number): void {
  const outline = blobPoints(0, 0, POD.rx, POD.ry, POD.lobes, POD.depth, 0, 0, POD.seed);
  const widest = Math.max(...outline.map((p) => Math.abs(p.x)));
  const scale = w / widest;
  const path = splinePath(outline, true);
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  strokeGlow(ctx, path, PALETTE.pod, Math.max(1.5, w * 0.12) / scale, 0.8 + 0.4 * glow);
  ctx.globalAlpha = 0.45 + 0.55 * glow;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(0, 0, widest * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
