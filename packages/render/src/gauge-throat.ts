import { KEY } from "@neon-spore/content";
import type { Dial } from "./gauge.js";
import { RIM, rimLoop } from "./gauge-alien.js";
import { rgba } from "./hex.js";
import { splinePath } from "./spline.js";

/**
 * **THE GAUGE's throat**: the open mouth had nothing in it but the sky, so it
 * read as a hole punched in a flat sheet. The owner, 7 October 2026: *more
 * details and 3d depth*. Now it is a gullet: lit on the wall just inside the
 * lip, falling away to black round the pivot, with rings of gristle stepping
 * down it — each smaller, dimmer and closer to the next than the one before,
 * which is what a tunnel does as it goes away from you.
 *
 * Rings and never spokes: a line from the pivot to the rim is the cannon's aim
 * (`gauge-cannon.ts`), and nothing else in the mouth may look like one. Dark
 * mauve and never red or cyan, which are only ever the wound.
 */

const DEEP = "#030207";
const GULLET = "#1A0A1C";
const WALL = "#3C1532";
const GRISTLE = "#6A2E58";

/** How far down each ring sits, as a share of the rim, and how bright. */
const RINGS: readonly (readonly [number, number])[] = [
  [0.86, 0.5],
  [0.7, 0.36],
  [0.56, 0.24],
  [0.45, 0.15],
];

/** The inside of the mouth. Before the teeth, the tongue and the cannon. */
export function drawGaugeThroat(ctx: CanvasRenderingContext2D, dial: Dial): void {
  const rim = dial.r * (dial.rim ?? RIM);
  const mouth = splinePath(rimLoop(dial, 1), true);
  ctx.save();
  ctx.clip(mouth);
  // The far wall takes the light — it faces back toward the key — so the deep
  // of the gullet sits a little toward the light's side of the pivot.
  const dx = dial.cx + KEY.x * rim * 0.12;
  const dy = dial.cy + KEY.y * rim * 0.12;
  const g = ctx.createRadialGradient(dx, dy, 0, dial.cx, dial.cy, rim * 1.02);
  g.addColorStop(0, DEEP);
  g.addColorStop(0.42, DEEP);
  g.addColorStop(0.72, GULLET);
  g.addColorStop(0.93, WALL);
  g.addColorStop(1, GULLET);
  ctx.fillStyle = g;
  ctx.fillRect(dial.cx - rim * 1.1, dial.cy - rim * 1.1, rim * 2.2, rim * 2.2);

  ctx.lineJoin = "round";
  for (const [k, alpha] of RINGS) {
    const ring = splinePath(rimLoop(dial, k), true);
    // Each ring a fold: shadow under it, lit edge on it.
    ctx.strokeStyle = rgba(DEEP, 0.8);
    ctx.lineWidth = Math.max(1.5, rim * 0.05 * k);
    ctx.stroke(ring);
    ctx.save();
    ctx.translate(KEY.x * 1.5 * k, KEY.y * 1.5 * k);
    ctx.strokeStyle = rgba(GRISTLE, alpha);
    ctx.lineWidth = Math.max(1, rim * 0.016 * k);
    ctx.stroke(ring);
    ctx.restore();
  }
  ctx.restore();
}
