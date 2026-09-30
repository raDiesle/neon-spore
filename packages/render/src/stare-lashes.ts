import { type EyeInk, ROOT_MUL } from "./eye.js";
import { rimBox, rimPoint } from "./eye-rim.js";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";
import type { StareEye } from "./stare-shape.js";

/**
 * **What THE STARE counts with, and what it has taken**: the lashes that are
 * its score, and the scars a hit leaves on the cowl.
 *
 * **The lashes are the score.** The owner, 29 September 2026: *do not use the
 * progress dots … make eye some bigger and we could use glowing eyelash each
 * to use for counting.* One lash a beat of the level's pattern, fanned under
 * the eye from corner to corner and read left to right: an open beat's lash
 * is long and lit in the eye's ink, a shut beat's short and dim. The lash of
 * the beat the eye is on burns white and longer still — the playhead — and
 * the ones already played go dark, so a pair with the sound off counts along
 * the fan the way the music counts the bar.
 *
 * **A scar a level.** Each level hit cuts one crack into the cowl, so the
 * fight's progress is on the boss rather than in a number.
 */

/**
 * The lashes stand on the lower rim, clear of the corners by this share of
 * its length at each end, rooted where `eye.ts` roots the eye's own fringe —
 * past the film, so a lash only ever travels away from the eye.
 */
const MARGIN = 0.1;
/** Lash lengths in socket heights: an open beat's, a shut beat's, and the extra on the one it is on. */
const LONG = 1.7;
const SHORT = 0.75;
const NOW = 0.45;

/**
 * The fan, for a pattern and the beat the eye is on (`-1` in the lead-in,
 * when every lash is waiting and none is lit white). `ink` is the ink the
 * pattern is played in — blue for a lesson, red for real — so the lead-in
 * already says which it will be. Each lash is laid on a dark stroke of the
 * sky first, so it reads over the gaze's own light.
 */
export function drawLashes(
  ctx: CanvasRenderingContext2D,
  e: StareEye,
  pattern: string,
  at: number,
  ink: EyeInk,
): void {
  const n = pattern.length;
  if (n === 0) return;
  const box = rimBox(e.rx, e.ry, ROOT_MUL);
  const open = new Path2D();
  const shut = new Path2D();
  const spent = new Path2D();
  const now = new Path2D();
  for (let i = 0; i < n; i++) {
    // Left to right: the lower rim runs from the right corner back to the
    // left (`rimPoint`), so the share across is turned round.
    const across = MARGIN + ((1 - 2 * MARGIN) * (i + 0.5)) / n;
    const p = rimPoint(box, 0.5 + 0.5 * (1 - across));
    const isOpen = pattern[i] === "x";
    const len = e.ry * ((isOpen ? LONG : SHORT) + (i === at ? NOW : 0));
    const path = i === at ? now : at >= 0 && i < at ? spent : isOpen ? open : shut;
    path.moveTo(e.cx + p.x, e.cy + p.y);
    path.lineTo(e.cx + p.x + p.nx * len, e.cy + p.y + p.ny * len);
  }
  const w = STROKE.outline * 2;
  const thin = STROKE.outline * 1.2;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.background;
  for (const [p, width] of [
    [shut, thin],
    [spent, thin],
    [open, w],
    [now, w * 1.3],
  ] as const) {
    ctx.lineWidth = width * 2.2;
    ctx.stroke(p);
  }
  ctx.restore();
  strokeGlow(ctx, shut, ink.hex, thin, 0.5, 0.7);
  strokeGlow(ctx, spent, PALETTE.dim, thin, 0.2, 0.45);
  strokeGlow(ctx, open, ink.rim, w, 1.8);
  strokeGlow(ctx, now, PALETTE.text, w * 1.3, 2.6);
}

/** Where the scars cross the cowl, as fractions of the socket from its middle: a start and a turn. */
const SCARS: readonly (readonly [number, number, number, number, number, number])[] = [
  [-0.95, -1.2, -0.7, -0.95, -0.8, -0.6],
  [0.6, -1.55, 0.85, -1.2, 0.7, -0.9],
  [-0.35, -1.65, -0.1, -1.35, -0.3, -1.05],
  [1.15, -0.85, 1.35, -0.55, 1.15, -0.2],
  [-1.3, -0.55, -1.15, -0.25, -1.4, 0.1],
];

/** One crack in the cowl for each level the pair has taken off it. */
export function drawScars(ctx: CanvasRenderingContext2D, e: StareEye, hits: number): void {
  const n = Math.min(hits, SCARS.length);
  if (n <= 0) return;
  const p = new Path2D();
  for (let i = 0; i < n; i++) {
    const [ax, ay, bx, by, cx, cy] = SCARS[i] as (typeof SCARS)[number];
    p.moveTo(e.cx + ax * e.rx, e.cy + ay * e.ry);
    p.lineTo(e.cx + bx * e.rx, e.cy + by * e.ry);
    p.lineTo(e.cx + cx * e.rx, e.cy + cy * e.ry);
  }
  ctx.save();
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = STROKE.outline * 2.2;
  ctx.lineJoin = "round";
  ctx.stroke(p);
  strokeGlow(ctx, p, PALETTE.redRim, STROKE.inner, 0.9, 0.8);
  ctx.restore();
}
