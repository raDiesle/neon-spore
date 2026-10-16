import type { Pod } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawDueRing } from "./pod-due-ring.js";

/**
 * **What a pod's options look like** (`sim/pod-options.ts`), laid over the pod
 * the game already draws rather than drawn instead of it: a pod is still the
 * amber lamp, and each option is one thing added to it that says the one
 * sentence the pair has to say about it.
 *
 * - **Coloured**: a cage of six bars round it in its colour, turning slowly —
 *   the shot that opens it is that colour.
 * - **Heavy**: a double rim and two iron bands across it in rock grey, drawn
 *   moored and loose alike — it is the same weight all the way down.
 * - **Swinging**: a thread up to a knot two and a half tiles above where it
 *   swings from, so the line leans the way it is going.
 *
 * Nothing is stored; every one of these is read off the pod each frame.
 */

const CAGE_BARS = 6;

/** The cage and the bands, over a pod already drawn at `x, y` with radius `r`. */
export function drawPodDress(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  p: Pod,
  x: number,
  y: number,
  r: number,
  t: number,
): void {
  if (p.heavy) drawBands(ctx, l, x, y, r);
  if (p.tint !== undefined && !p.loose) drawCage(ctx, l, x, y, r, p.tint, t);
}

function drawCage(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  tint: "red" | "cyan",
  t: number,
): void {
  const hex = tint === "red" ? PALETTE.red : PALETTE.cyan;
  const cage = r * 1.45;
  const turn = t * 0.5;
  const gap = (Math.PI * 2) / CAGE_BARS;
  const path = new Path2D();
  for (let i = 0; i < CAGE_BARS; i++) {
    const a = turn + i * gap;
    path.moveTo(x + Math.cos(a) * cage, y + Math.sin(a) * cage);
    path.arc(x, y, cage, a, a + gap * 0.62);
  }
  halo(ctx, x, y, cage * 1.3, hex, 0.18);
  strokeGlow(ctx, path, hex, l.tile * 0.075, 1.3, 1);
}

function drawBands(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
): void {
  const rim = new Path2D();
  rim.arc(x, y, r * 1.18, 0, Math.PI * 2);
  const bands = new Path2D();
  for (const k of [-0.35, 0.35]) {
    const dy = r * k;
    const half = Math.sqrt(1 - k * k) * r * 1.18;
    bands.moveTo(x - half, y + dy);
    bands.lineTo(x + half, y + dy);
  }
  strokeGlow(ctx, rim, PALETTE.rock, l.tile * 0.07, 0.9, 1);
  strokeGlow(ctx, bands, PALETTE.rock, l.tile * 0.06, 0.8, 1);
}

/** Rows above where a swinging pod hangs that its thread is knotted. */
const KNOT_ROWS = 2.5;

/** The threads of every swinging pod still hanging, drawn under the pods. */
export function drawSwingThreads(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  pods: readonly Pod[],
): void {
  for (const p of pods) {
    if (p.swingMilli === undefined || p.loose) continue;
    const kx = tileCX(l, p.swingMilli / 1000);
    const ky = tileCY(l, Math.max(-0.4, p.rowMilli / 1000 - KNOT_ROWS));
    const px = tileCX(l, p.colMilli / 1000);
    const py = tileCY(l, p.rowMilli / 1000);
    const thread = new Path2D();
    thread.moveTo(kx, ky);
    thread.lineTo(px, py);
    strokeGlow(ctx, thread, PALETTE.pod, l.tile * 0.05, 1.1, 0.9);
    halo(ctx, kx, ky, l.tile * 0.16, PALETTE.podRim, 0.6);
  }
}

/**
 * A heavy pod in the maw's grip: squashed into the mouth, banded, and wearing
 * the clock's own ring for the beats the second press has left — the ring a
 * pair already reads as "how long". `body` is `drawPodBody`, handed in by
 * `pods.ts` so the two files do not import each other.
 */
export function drawGripped(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  t: number,
  beatsLeft: number,
  time: number,
  body: (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number) => void,
): void {
  // Sat on the lips rather than at the hull row's centre, which is under the
  // skin the ship draws over it.
  const sy = y - l.tile * GRIP_LIFT_TILES;
  ctx.save();
  ctx.translate(x, sy);
  ctx.scale(1.25, 0.7);
  body(ctx, 0, 0, r, t * 3);
  ctx.restore();
  drawBands(ctx, l, x, sy, r);
  drawDueRing(ctx, x, sy, r * 1.6, beatsLeft, time);
}

/** How far above the hull row's centre a gripped pod is drawn, in tiles. */
const GRIP_LIFT_TILES = 0.6;
