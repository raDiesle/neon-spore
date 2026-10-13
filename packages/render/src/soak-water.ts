import type { Point } from "@neon-spore/content";
import { centre, type GooBody, rimAt, smoothPath } from "./goo-body.js";
import { GOO } from "./goo-style.js";
import { PALETTE } from "./palette.js";

/**
 * **SOAK's water**: green water welling up under the thumb and spreading out
 * to the rim of the drop, the HOLD LAB's one look (the owner, 12 and 13
 * October 2026: *all should follow "hold look" of "soak" to be consistent*),
 * and every hold on the field's since 13 October 2026 (`soak-hold.ts`). The
 * owner, 11 October 2026: *water should come, but appearing from the center of
 * the middle, and the final success state should go to the very end of the
 * borders, not end too early somewhere in middle.*
 *
 * The front is laid on the drop's own rim (`rimAt`), the same share of the way
 * out along every angle — so it keeps the drop's lumps as it grows and touches
 * the rim all round at the very moment the hold is counted.
 *
 * **It wells up big and fast, then slows** — the owner, 12 October 2026: *the
 * starting animation of appearing water in middle is faster starting some
 * bigger area … after beginning it has to flow slower to align with 100%*. So
 * the front starts at `WELL` of the way out and eases out to the rim
 * (`soakReach`), still arriving exactly as the hold is counted.
 */

/** The colour progress is shown in: green while it fills, red as a failure drains it. */
export type Tone = "good" | "red";

/** The colour of `tone`, and its brighter edge. */
export function toneHex(tone: Tone): { hex: string; rim: string } {
  return tone === "red"
    ? { hex: PALETTE.red, rim: PALETTE.redRim }
    : { hex: PALETTE.good, rim: PALETTE.goodRim };
}

/** Points round the front: enough that a lump of the rim is a curve and not a corner. */
const SAMPLES = 40;
/** How far out the water is the moment it wells up, as a share of the rim. */
export const WELL = 0.32;

/** How far out the front is at `fill`: `WELL` at once, then fast and slowing, the rim at 1. */
export function soakReach(fill: number): number {
  if (fill <= 0) return 0;
  const u = Math.min(1, fill);
  return WELL + (1 - WELL) * (1 - (1 - u) ** 2.2);
}

/** The line `out` of the way from `drawn`'s centre to its rim along every angle,
 * rocking by `rock` of it: SOAK's front, and a terrace of THE PRESS LAB's STEPS. */
export function frontPath(drawn: GooBody, time: number, out: number, rock: number): Path2D {
  const c = centre(drawn);
  const pts: Point[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const a = (i / SAMPLES) * Math.PI * 2;
    const rim = rimAt(drawn, GOO, time, a);
    const k = out * (1 + rock * Math.sin(a * 5 + time * 7) - rock);
    pts.push({ x: c.x + rim.x * k, y: c.y + rim.y * k });
  }
  return smoothPath(pts);
}

/** SOAK's water `fill` of the way through, inside `drawn` (the caller clips to it). */
export function soakWater(
  ctx: CanvasRenderingContext2D,
  drawn: GooBody,
  time: number,
  fill: number,
  tone: Tone,
): void {
  if (fill <= 0.002) return;
  const c = centre(drawn);
  const out = soakReach(fill);
  // The front rocks while it travels and lies still on the rim when it arrives.
  const front = frontPath(drawn, time, out, 0.09 * (1 - fill) ** 0.7);
  const col = toneHex(tone);
  // The water: brightest where it wells up, deeper towards its front.
  const reach = drawn.r * 1.3 * out;
  const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, Math.max(0.5, reach));
  g.addColorStop(0, col.rim);
  g.addColorStop(0.35, col.hex);
  g.addColorStop(1, col.hex);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = g;
  ctx.fill(front);
  // Its front, lit: the line the eye follows out to the rim.
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = col.rim;
  ctx.lineWidth = Math.max(0.8, drawn.r * 0.08);
  ctx.stroke(front);
  // The spring at the middle, where the thumb is.
  const spring = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, drawn.r * 0.4);
  spring.addColorStop(0, "#FFFFFF");
  spring.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.35 * (0.6 + 0.4 * Math.sin(time * 9));
  ctx.fillStyle = spring;
  ctx.fillRect(c.x - drawn.r * 0.4, c.y - drawn.r * 0.4, drawn.r * 0.8, drawn.r * 0.8);
}
