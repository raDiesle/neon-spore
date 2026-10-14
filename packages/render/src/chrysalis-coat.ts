import {
  BASTION_PLATES_A_SIDE,
  bastionTrackLen,
  type ChrysalisState,
  chrysalisGone,
  chrysalisLitStep,
  chrysalisQuillOf,
  chrysalisRubsOf,
  chrysalisTrackOf,
  type SimConfig,
} from "@neon-spore/sim";
import type { ChrysalisPose } from "./chrysalis-pose.js";
import {
  type At,
  CHRYSALIS_SKIN_TILES,
  CHRYSALIS_TALL,
  chrysalisHidePath,
  chrysalisPulledOut,
  QUILL_ROOT,
  QUILL_TIP,
  quillAt,
  quillWay,
} from "./chrysalis-shape.js";
import { halo, strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE CHRYSALIS's two outer skins** (§11.63): the slime coat and the quills.
 *
 * **The slime** is a wet translucent coat over the whole cocoon, its left
 * half the pilot's and its right the navigator's, each glistening and
 * dripping from its belly. **A half thins with every turn of the rub** — its
 * coat paler, its drips shorter — so a half nearly clear reads nearly clear;
 * a half under a rubbing thumb has a gleam running over it; a half wiped is
 * gone and the hide shows.
 *
 * **The quills** are bone spines, four down each side, rooted in the hide
 * and standing out past the slime. With the quills lit they bristle on the
 * beat. **A quill being pulled stands out along its track by as much as the
 * thumb has it** — straight out or round a curve, as THE BASTION's slab —
 * a wet string of hide stretched from its socket, thinner the nearer it is
 * to ripping. A quill ripped leaves its socket raw.
 */

/** How much coat each half wears: 1 whole, 0 wiped. */
export function slimeLeft(s: ChrysalisState, i: 0 | 1, lit: boolean): number {
  if (!lit) return 1;
  if (chrysalisGone(s, i)) return 0;
  return 1 - 0.75 * Math.min(1, s.rubbed[i] / chrysalisRubsOf(s));
}

export function drawChrysalisSlime(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: ChrysalisState,
  p: ChrysalisPose,
  lit: boolean,
  time: number,
): void {
  const c = p.c;
  const r = CHRYSALIS_SKIN_TILES.slime * l.tile;
  const coat = chrysalisHidePath(c, {
    r,
    breathe: p.breathe * 0.6,
    bloat: p.bloat,
    squeeze: p.squeeze,
    time: time + 1.7,
  });
  for (const i of [0, 1] as const) {
    const left = slimeLeft(s, i, lit);
    if (left <= 0) continue;
    const side = i === 0 ? -1 : 1;
    ctx.save();
    ctx.beginPath();
    ctx.rect(i === 0 ? c.x - r * 2 : c.x, c.y - r * 2, r * 2, r * 4);
    ctx.clip();
    ctx.fillStyle = rgba(PALETTE.chrysalisSlime, 0.1 + 0.22 * left);
    ctx.fill(coat);
    strokeGlowFaded(ctx, coat, PALETTE.chrysalisSlime, STROKE.outline, 1.2, left);
    drawSheen(ctx, l, c, r, side, left);
    if (lit && s.rubAt[i] >= 0) drawGleam(ctx, l, c, r, side, time);
    ctx.restore();
    drawDrips(ctx, l, c, r, side, left, time);
  }
}

/** Two wet highlights high on a half. */
function drawSheen(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  r: number,
  side: number,
  left: number,
): void {
  ctx.strokeStyle = rgba(PALETTE.chrysalisSheen, 0.65 * left);
  ctx.lineCap = "round";
  for (const [k, w] of [
    [0.72, 0.22],
    [0.55, 0.12],
  ] as const) {
    ctx.lineWidth = l.tile * w * 0.5;
    ctx.beginPath();
    const a0 = side < 0 ? -2.5 : -0.9;
    ctx.ellipse(c.x, c.y, r * k, r * k * CHRYSALIS_TALL, 0, a0, a0 + 0.5);
    ctx.stroke();
  }
}

/** A gleam sweeping over the half a thumb is rubbing. */
function drawGleam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  r: number,
  side: number,
  time: number,
): void {
  const x = c.x + side * r * (0.5 + 0.35 * Math.sin(time * 9));
  halo(ctx, x, c.y, l.tile * 1.4, PALETTE.chrysalisSheen, 0.45);
}

/** Slime hanging off a half's belly in drips that stretch and draw back. */
function drawDrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  r: number,
  side: number,
  left: number,
  time: number,
): void {
  ctx.fillStyle = rgba(PALETTE.chrysalisSlime, 0.35 + 0.4 * left);
  for (let j = 0; j < 3; j++) {
    const across = 0.22 + 0.24 * j;
    const x = c.x + side * r * across;
    const y = c.y + r * CHRYSALIS_TALL * Math.sqrt(1 - across * across) * (1 - 0.06 * j) - 2;
    const long = l.tile * left * (0.35 + 0.6 * (0.5 + 0.5 * Math.sin(time * 0.9 + j * 2.1)));
    const w = l.tile * 0.13;
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.quadraticCurveTo(x - w * 0.3, y + long * 0.6, x - w, y + long);
    ctx.arc(x, y + long, w, Math.PI, 0, true);
    ctx.quadraticCurveTo(x + w * 0.3, y + long * 0.6, x + w, y);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawChrysalisQuills(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: ChrysalisState,
  p: ChrysalisPose,
): void {
  const lit = chrysalisLitStep(s)?.skin === "quills";
  for (let i = 0; i < BASTION_PLATES_A_SIDE * 2; i++) {
    if (lit && chrysalisGone(s, i)) {
      drawSocket(ctx, l, quillAt(l, p.c, i, QUILL_ROOT + 0.5), 1);
      continue;
    }
    const seat = i < BASTION_PLATES_A_SIDE ? 0 : 1;
    const pulled = lit && chrysalisQuillOf(s, seat) === i ? s.pullMilli[seat] : 0;
    const off = chrysalisPulledOut(cfg, s, i, pulled);
    const ox = (off.x / 1000) * l.tile;
    const oy = (off.y / 1000) * l.tile;
    if (pulled > 0) {
      const near = pulled / Math.max(1, bastionTrackLen(cfg, chrysalisTrackOf(s, i)));
      const socket = quillAt(l, p.c, i, QUILL_ROOT + 0.5);
      drawSocket(ctx, l, socket, near);
      ctx.strokeStyle = rgba(PALETTE.chrysalisSpore, 0.7);
      ctx.lineWidth = l.tile * 0.16 * (1 - 0.8 * near);
      ctx.beginPath();
      ctx.moveTo(socket.x, socket.y);
      ctx.lineTo(socket.x + ox, socket.y + oy);
      ctx.stroke();
    }
    drawQuill(ctx, l, p.c, i, ox, oy, lit ? p.pulse * 0.15 : 0, 1);
  }
}

/** One spine, stood `ox`, `oy` out from where it grows: what a ripped one flies as, too. */
export function drawQuill(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  i: number,
  ox: number,
  oy: number,
  bristle: number,
  alpha: number,
): void {
  const w = quillWay(i);
  const root = quillAt(l, c, i, QUILL_ROOT);
  const tip = quillAt(l, c, i, QUILL_TIP + bristle);
  const half = l.tile * 0.17;
  const n = { x: -w.y * half, y: w.x * half };
  const bend = (i % 2 === 0 ? 1 : -1) * l.tile * 0.12;
  const spine = new Path2D();
  spine.moveTo(root.x + n.x + ox, root.y + n.y + oy);
  spine.quadraticCurveTo(
    (root.x + tip.x) / 2 + n.x * 0.4 - w.y * bend + ox,
    (root.y + tip.y) / 2 + n.y * 0.4 + w.x * bend + oy,
    tip.x + ox,
    tip.y + oy,
  );
  spine.quadraticCurveTo(
    (root.x + tip.x) / 2 - n.x * 0.4 - w.y * bend + ox,
    (root.y + tip.y) / 2 - n.y * 0.4 + w.x * bend + oy,
    root.x - n.x + ox,
    root.y - n.y + oy,
  );
  spine.closePath();
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = PALETTE.chrysalisQuill;
  ctx.fill(spine);
  ctx.clip(spine);
  ctx.fillStyle = PALETTE.chrysalisQuillRoot;
  ctx.beginPath();
  ctx.arc(root.x + ox, root.y + oy, l.tile * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha *= alpha;
  strokeGlowFaded(ctx, spine, PALETTE.chrysalisSheen, STROKE.inner, 0.7);
  ctx.restore();
}

/** The raw hole a quill leaves: dark, wet and glowing the hotter the nearer it is to ripping. */
function drawSocket(ctx: CanvasRenderingContext2D, l: Layout, at: At, heat: number): void {
  ctx.fillStyle = PALETTE.chrysalisHideDark;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, l.tile * 0.2, l.tile * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  halo(ctx, at.x, at.y, l.tile * (0.3 + 0.4 * heat), PALETTE.chrysalisSpore, 0.3 + 0.5 * heat);
}
