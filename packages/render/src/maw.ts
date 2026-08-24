import { openSmoothPath, type Point } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import type { HullMood } from "./hull.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * Swallowing a pod, in two movements.
 *
 * **The chew.** The membrane on either side of the maw comes apart: the edge
 * stops being a line and becomes a run of broken pieces that crawl inwards,
 * amber where the pod is being taken through. It is the ship digesting, and it
 * has to happen *at the sides of the opening* rather than at the opening
 * itself, because a mouth that only glows has swallowed nothing.
 *
 * **The charge.** Then the whole ship lights from inside for a moment, the way
 * a jellyfish does when something bright passes through it, and goes out again.
 * That flash is the receipt: player 1 knows the catch counted without reading a
 * number, which is what a HUD figure could never do at the speed this happens.
 *
 * Both are pure appearance and neither is ever read back — the world knows only
 * that a pod was taken (`podTaken`).
 */

/** How far to either side of the maw the skin comes apart, in tiles. */
const CHEW_TILES = 2.4;
/** Pieces the broken stretch is drawn in. Fewer reads as a dashed line. */
const CHEW_STEPS = 30;

export function drawChew(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  mood: HullMood,
  time: number,
  cannonX: number,
  surface: (x: number) => Point,
): void {
  if (mood.chew <= 0.01) return;
  const half = l.tile * CHEW_TILES;
  const from = cannonX - half;
  const to = cannonX + half;

  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < CHEW_STEPS; i++) {
    // Every second piece is left out, and which one moves — so the gaps travel
    // towards the mouth instead of sitting still like a dashed border.
    const phase = Math.sin(time * 9 + i * 1.7);
    if (phase < -0.15) continue;
    const a = from + ((to - from) * i) / CHEW_STEPS;
    const b = from + ((to - from) * (i + 0.7)) / CHEW_STEPS;
    const pts: Point[] = [surface(a), surface((a + b) / 2), surface(b)];
    // Nearest the mouth is brightest and most eaten.
    const near = 1 - Math.abs((a + b) / 2 - cannonX) / half;
    const heat = Math.max(0, near) * mood.chew;
    const piece = new Path2D(openSmoothPath(pts));
    ctx.globalAlpha = 0.25 + 0.75 * heat;
    strokeGlow(ctx, piece, heat > 0.5 ? PALETTE.podRim : PALETTE.ember, 1.4 + 3.4 * heat, 0.9);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * The flash. Additive over the filled body, brightest along the top edge where
 * the membrane is thinnest, so the ship reads as lit from inside rather than
 * painted over — the same rule the rest of the hull's light follows.
 */
export function drawCharge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  mood: HullMood,
  filled: Path2D,
  body: Path2D,
): void {
  if (mood.charge <= 0.01) return;
  const a = mood.charge;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createLinearGradient(0, l.hullY - l.tile, 0, l.bandTop);
  g.addColorStop(0, PALETTE.podRim);
  g.addColorStop(0.35, PALETTE.pod);
  g.addColorStop(1, "#00000000");
  ctx.globalAlpha = 0.75 * a;
  ctx.fillStyle = g;
  ctx.fill(filled);
  ctx.globalAlpha = 1;
  ctx.restore();

  strokeGlow(ctx, body, PALETTE.podRim, 1.8 + 4 * a, a);
}
