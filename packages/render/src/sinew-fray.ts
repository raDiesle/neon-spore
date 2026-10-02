import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { Point } from "./sinew-shape.js";
import { splinePath } from "./spline.js";

/**
 * **The hold, counted on the fibre it is counting down to.** While the sum
 * sits in the zone, the next fibre to part frays: it lights from the
 * tendon's violet toward the zone's green, shivers harder, and comes apart
 * into strands that open wider beat by beat, with hairs springing out of it,
 * until on the last beat it is a bundle of threads glowing white and the
 * next frame it is two stubs (`sinew-fibres.ts`).
 *
 * The owner's ask of 2 October 2026: *make the visual of waiting time for
 * lock in more interesting and related to the concept and visual of the boss
 * instead of the boring dots counting down.* The count is the same count —
 * `sinewHoldBeats`, read off `holdBeat` and the phase, both seats — drawn as
 * the thing it is about to do.
 */

/** Strands a fraying fibre comes apart into, and how far they open at the last, in tiles. */
const STRANDS = 3;
const OPEN = 0.3;
/** How hard it shivers at the last, in tiles, and how fast. */
const SHIVER = 0.06;
const SHIVER_HZ = 23;
/** Hairs springing out of it at the last, and their length in tiles. */
const HAIRS = 12;
const HAIR = 0.22;
const SEGMENTS = 10;

/**
 * One run of a fibre fraying, `k` 0 (the hold just begun) to 1 (the fibre
 * about to part). `a` and `b` are its ends; `side` which way its hairs lean.
 */
export function drawFray(
  ctx: CanvasRenderingContext2D,
  a: Point,
  b: Point,
  k: number,
  tile: number,
  time: number,
  seed: number,
): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const shiver = Math.sin(time * SHIVER_HZ + seed) * SHIVER * tile * k;
  const hex = k < 0.75 ? mixHex(PALETTE.hull, PALETTE.good, k / 0.75) : PALETTE.goodRim;
  const width = tile * 0.06 * (1.1 - 0.4 * k);
  ctx.save();
  ctx.lineCap = "round";
  for (let st = 0; st < STRANDS; st++) {
    const lane = STRANDS <= 1 ? 0 : st / (STRANDS - 1) - 0.5;
    const pts: Point[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const belly = Math.sin(t * Math.PI);
      const off = lane * OPEN * tile * k * belly * 2 + shiver * belly;
      pts.push({ x: a.x + dx * t + nx * off, y: a.y + dy * t + ny * off });
    }
    strokeGlow(ctx, splinePath(pts, false), hex, width, 0.8 + 1.2 * k);
  }
  // Hairs: short threads standing out of it, more the nearer it is to parting.
  const hairs = Math.floor(HAIRS * k);
  ctx.strokeStyle = hex;
  ctx.lineWidth = Math.max(0.6, tile * 0.015);
  ctx.globalAlpha = 0.85;
  for (let h = 0; h < hairs; h++) {
    const t = 0.12 + ((h * 0.618 + seed * 0.13) % 1) * 0.76;
    const lean = h % 2 === 0 ? 1 : -1;
    const sway = Math.sin(time * 9 + h * 1.7) * 0.3;
    const px = a.x + dx * t;
    const py = a.y + dy * t;
    const reach = HAIR * tile * (0.5 + 0.5 * k);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(
      px + (nx * lean + (dx / len) * sway) * reach,
      py + (ny * lean + (dy / len) * sway) * reach,
    );
    ctx.stroke();
  }
  ctx.restore();
}
