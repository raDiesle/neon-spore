import type { EyeInk } from "./eye.js";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";
import { browPoint } from "./stare-level-look.js";
import type { StareEye } from "./stare-shape.js";

/**
 * **What THE STARE counts with, and what it has taken**: the lashes that are
 * its score, and the scars a level leaves on the cowl.
 *
 * **The lashes are the score.** The owner, 29 September 2026: *do not use the
 * progress dots … make eye some bigger and we could use glowing eyelash each
 * to use for counting.* One lash a beat of the level's pattern, fanned over
 * the eye from corner to corner and read left to right: an open beat's lash
 * is long and lit in the eye's ink, a shut beat's short and dim. The lash of
 * the beat the eye is on burns white and longer still — the playhead — and
 * the ones already played go dark, so a pair with the sound off counts along
 * the fan the way the music counts the bar.
 *
 * **Above the eye, and the only lashes it has**, since 2 October 2026 — the
 * owner, *the lashes to indicate state should be above eyes to replace other
 * lashes*. They stand on the brow's edge (`stare-level-look.ts`), where the
 * ball's own upper fringe used to be, and the lashes the charge asks to be
 * pulled stand in the same place (`stare-lash-pull.ts`).
 *
 * **A scar a level.** Each level survived cuts one crack into the cowl, so
 * the fight's progress is on the boss rather than in a number.
 */

/** The fan stands clear of the brow's ends by this share of its length at each end. */
const MARGIN = 0.12;
/** Lash lengths in socket heights: an open beat's, a shut beat's, and the extra on the one it is on. */
const LONG = 1.25;
const SHORT = 0.55;
const NOW = 0.35;

/**
 * The fan, for a pattern and the beat the eye is on (`-1` in the lead-in,
 * when every lash is waiting and none is lit white). `ink` is the ink the
 * pattern is played in — blue for a lesson, the level's colour for real — so
 * the lead-in already says which it will be. Each lash is laid on a dark
 * stroke of the sky first, so it reads over the gaze's own light.
 */
export function drawLashes(
  ctx: CanvasRenderingContext2D,
  e: StareEye,
  pattern: string,
  at: number,
  ink: EyeInk,
  anger: number,
): void {
  const n = pattern.length;
  if (n === 0) return;
  const open = new Path2D();
  const shut = new Path2D();
  const spent = new Path2D();
  const now = new Path2D();
  for (let i = 0; i < n; i++) {
    const p = browPoint(e, anger, MARGIN + ((1 - 2 * MARGIN) * (i + 0.5)) / n);
    const isOpen = pattern[i] === "x";
    const len = e.ry * ((isOpen ? LONG : SHORT) + (i === at ? NOW : 0));
    const path = i === at ? now : at >= 0 && i < at ? spent : isOpen ? open : shut;
    path.moveTo(p.x, p.y);
    path.lineTo(p.x + p.nx * len, p.y + p.ny * len);
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

/** One crack in the cowl for each level the pair has survived. */
export function drawScars(ctx: CanvasRenderingContext2D, e: StareEye, levels: number): void {
  const n = Math.min(levels, SCARS.length);
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
