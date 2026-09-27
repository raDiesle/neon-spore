import { blobPoints } from "@neon-spore/content";
import { drawHurt } from "./boss-hurt.js";
import { halo, strokeGlow } from "./glow.js";
import type { Figure } from "./nettle-figure.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE NETTLE's own body, drawn.** Split out of `nettle-draw.ts` at the
 * 250-line ceiling: this file owns every path and fill, and knows nothing of
 * `World` or `SceneState` — it takes a `Figure` and a fade and draws it.
 *
 * Face-on (`f.side` toward 0) shows the bell's crown: the two stinging arms,
 * the rim eyespots, the brood sac and its spores. Turned (`f.side` toward 1)
 * shows the underside: the iris of the mouth, the globs held at the
 * curtain's rim, the oral-arm curtain itself. The two groups crossfade by
 * `f.side` the same way THE INSTAR's front and profile do
 * (`instar-draw.ts`) — one body, read from two sides.
 *
 * **Colour follows THE INSTAR's own rule**: a neutral body, so nothing here
 * reads as *load this* (`palette.ts`'s comments on `red`/`cyan`), with one
 * warm accent — `ember` — spent on the parts that light up: the eyespots and
 * the core. Everything else is `rock`/`rockDark`/`dim`, the same neutrals
 * THE INSTAR's own skin is built from.
 */

/** Lobes on the bell's own contour — enough to read as grown, not stamped. */
const BELL_LOBES = 7;
/** The bell's height over its width, and how far a lobe stands out of it. */
const BELL_SQUASH = 0.82;
const BELL_LOBE_DEPTH = 0.1;
/** The oral-arm curtain: where its strands hang from and how far, in bell radii. */
const FRILL_TOP = 0.5;
const FRILL_LONG = 0.6;
const FRILL_WIDE = 1.4;

/** Where a stinging arm leaves the rim and where its tip is, drawn out `extend`. */
function armEnds(cx: number, cy: number, r: number, side: -1 | 1, extend: number) {
  const start = { x: cx + side * r * 0.85, y: cy + r * 0.4 };
  const end = { x: cx + side * r * (0.85 + 0.5 * extend), y: cy + r * (0.4 + 0.9 * extend) };
  return { start, end };
}

/**
 * **The points THE NETTLE's body reaches this frame** — the bell's four sides,
 * lobes and all, both arms' tips and the curtain's foot — for a caller that
 * must stand clear of the whole body rather than the bell (THE SLOW's aim,
 * `slow-boss-aim-d.ts`). Read off the same figures the drawers below use.
 */
export function nettleReach(
  cx: number,
  cy: number,
  r: number,
  f: Figure,
): { x: number; y: number }[] {
  const w = r * (1 + BELL_LOBE_DEPTH);
  const h = r * BELL_SQUASH * (1 + BELL_LOBE_DEPTH);
  const foot = cy + r * (FRILL_TOP + FRILL_LONG * f.frill);
  const half = (r * FRILL_WIDE) / 2;
  return [
    { x: cx - w, y: cy },
    { x: cx + w, y: cy },
    { x: cx, y: cy - h },
    { x: cx, y: cy + h },
    armEnds(cx, cy, r, -1, f.armL).end,
    armEnds(cx, cy, r, 1, f.armR).end,
    { x: cx - half, y: foot },
    { x: cx + half, y: foot },
  ];
}

export function drawNettleBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  f: Figure,
  time: number,
  fade: number,
  /** The blow the bell took, 0..1 (`boss-hurt.ts`): a red wash over it. */
  hurt = 0,
): void {
  drawBell(ctx, cx, cy, r, time, fade, hurt);
  drawCore(ctx, cx, cy, r, f, fade);
  const top = fade * (1 - f.side);
  if (top > 0.01) drawCrown(ctx, cx, cy, r, f, top);
  const under = fade * f.side;
  if (under > 0.01) drawUnderside(ctx, cx, cy, r, f, under);
}

/** The bell itself: a grown blob, not a circle, washed red while it is hurt. */
function drawBell(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  time: number,
  fade: number,
  hurt: number,
): void {
  const p = splinePath(
    blobPoints(cx, cy, r, r * BELL_SQUASH, BELL_LOBES, BELL_LOBE_DEPTH, 0.025, time, 11, 40),
    true,
  );
  ctx.globalAlpha = fade;
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(p);
  ctx.globalAlpha = 1;
  strokeGlow(ctx, p, PALETTE.dim, STROKE.outline, 1, fade);
  drawHurt(ctx, p, hurt * fade);
}

/** The core, burning inside the bell — the one warm accent, brightest at `core`. */
function drawCore(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  f: Figure,
  fade: number,
): void {
  if (f.coreGlow <= 0) return;
  const rad = r * (0.2 + 0.35 * f.coreOpen);
  halo(ctx, cx, cy, rad, PALETTE.ember, f.coreGlow * fade);
}

/** Face-on: the two stinging arms, the rim eyespots, the brood sac and spores. */
function drawCrown(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  f: Figure,
  alpha: number,
): void {
  for (const side of [-1, 1] as const) {
    const arm = side < 0 ? f.armL : f.armR;
    if (arm > 0) drawArm(ctx, cx, cy, r, side, arm, alpha);
    const spot = side < 0 ? f.spotL : f.spotR;
    if (spot > 0) {
      const p = { x: cx + side * r * 0.55, y: cy - r * 0.35 };
      halo(ctx, p.x, p.y, r * 0.12, PALETTE.ember, spot * alpha);
    }
  }
  if (f.sac > 0) {
    const p = new Path2D();
    p.arc(cx, cy + r * 0.6, r * 0.22 * f.sac, 0, Math.PI * 2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PALETTE.rock;
    ctx.fill(p);
    ctx.globalAlpha = 1;
    for (const side of [-1, 1] as const) {
      const spore = side < 0 ? f.sporeL : f.sporeR;
      if (spore <= 0) continue;
      const sp = new Path2D();
      sp.arc(cx + side * r * 0.32, cy + r * 0.66, r * 0.1 * spore, 0, Math.PI * 2);
      ctx.globalAlpha = spore * alpha;
      ctx.fillStyle = PALETTE.rock;
      ctx.fill(sp);
      ctx.globalAlpha = 1;
    }
  }
}

/** One stinging arm, drawn out from the rim by how far it is stung. */
function drawArm(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  side: -1 | 1,
  extend: number,
  alpha: number,
): void {
  const { start, end } = armEnds(cx, cy, r, side, extend);
  const mid = { x: (start.x + end.x) / 2 + side * r * 0.15 * extend, y: (start.y + end.y) / 2 };
  const p = new Path2D();
  p.moveTo(start.x, start.y);
  p.quadraticCurveTo(mid.x, mid.y, end.x, end.y);
  strokeGlow(ctx, p, PALETTE.dim, STROKE.outline * 1.4, 1, alpha);
}

/** Turned: the iris, the held globs, the oral-arm curtain. */
function drawUnderside(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  f: Figure,
  alpha: number,
): void {
  if (f.mouth > 0) {
    const p = new Path2D();
    p.arc(cx, cy + r * 0.15, r * 0.32 * f.mouth, 0, Math.PI * 2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PALETTE.background;
    ctx.fill(p);
    ctx.globalAlpha = 1;
    strokeGlow(ctx, p, PALETTE.emberRim, STROKE.inner, 0.6, alpha);
  }
  const globs: [number, number][] = [
    [-0.4, f.globL],
    [0, f.globM],
    [0.4, f.globR],
  ];
  for (const [x, glob] of globs) {
    if (glob <= 0) continue;
    const p = new Path2D();
    p.arc(cx + x * r, cy + r * 0.55, r * 0.09 * glob, 0, Math.PI * 2);
    ctx.globalAlpha = glob * alpha;
    ctx.fillStyle = PALETTE.rock;
    ctx.fill(p);
    ctx.globalAlpha = 1;
  }
  if (f.frill > 0) {
    const strands = 6;
    for (let i = 0; i < strands; i++) {
      const t = i / (strands - 1) - 0.5;
      const x = cx + t * r * FRILL_WIDE;
      const p = new Path2D();
      p.moveTo(x, cy + r * FRILL_TOP);
      p.lineTo(x, cy + r * (FRILL_TOP + FRILL_LONG * f.frill));
      strokeGlow(ctx, p, PALETTE.dim, STROKE.inner, 0.8, alpha * f.frill);
    }
  }
}
