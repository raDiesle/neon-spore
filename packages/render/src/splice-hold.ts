import { blobPoints } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { spliceOrifice } from "./splice-eater.js";
import { splinePath } from "./spline.js";

/**
 * **Where THE SPLICE is fought**: the inside of a living ship. The owner asked
 * for it on 25 September 2026: the pipes looked like they were hanging in
 * space, and they should look like part of an alien vessel that is alive.
 *
 * So the field gets a hold: a wall of flesh up each edge, ribbed; ribs across
 * the ceiling with the orifice the eater comes out of (`splice-eater.ts`); and
 * veins on the back wall that brighten on the beat, the ship's own pulse.
 *
 * **It is a back, and it stays one.** Everything is dim, low in contrast and
 * away from the columns the pipes and the numbers stand in, so the straws the
 * navigator traces stay the brightest lines on the screen. Nothing in it moves
 * with the clock — the orifice breathes on the beat on both screens, and a
 * pulse that quickened as time ran out would hand the countdown to the pilot.
 * The hull, drawn after the field, covers where the walls meet it.
 */

/** A wall's depth in tiles, and the fixed shape of its inner edge. */
const WALL = 0.42;
const VEINS: readonly [number, number, number, number, number, number][] = [
  [0, 0.28, 0.2, 0.33, 0.34, 0.45],
  [0, 0.62, 0.16, 0.58, 0.3, 0.66],
  [1, 0.4, 0.82, 0.44, 0.7, 0.36],
  [1, 0.72, 0.86, 0.66, 0.74, 0.78],
  [0.5, 0.05, 0.44, 0.16, 0.38, 0.24],
];

function wallX(l: Layout, side: number, y: number, b: number): number {
  const d =
    l.tile * (WALL + 0.12 * Math.sin(y / (l.tile * 0.8) + side * 2) + 0.03 * Math.sin(b * Math.PI));
  return side === 0 ? d : l.width - d;
}

function drawWall(ctx: CanvasRenderingContext2D, l: Layout, side: number, b: number): void {
  const edge = side === 0 ? 0 : l.width;
  const step = l.tile * 0.25;
  ctx.beginPath();
  ctx.moveTo(edge, 0);
  for (let y = 0; y <= l.hullY + step; y += step) ctx.lineTo(wallX(l, side, y, b), y);
  ctx.lineTo(edge, l.hullY + step);
  ctx.closePath();
  const inner = side === 0 ? l.tile * (WALL + 0.2) : l.width - l.tile * (WALL + 0.2);
  const g = ctx.createLinearGradient(edge, 0, inner, 0);
  g.addColorStop(0, PALETTE.sheenDeep);
  g.addColorStop(0.7, rgba(PALETTE.hull, 0.28));
  g.addColorStop(1, rgba(PALETTE.sheenMid, 0.4));
  ctx.fillStyle = g;
  ctx.fill();
  // Ribs: short arcs out of the wall every tile and a half.
  ctx.strokeStyle = rgba(PALETTE.sheenMid, 0.28);
  ctx.lineWidth = Math.max(1, l.tile * 0.07);
  ctx.beginPath();
  for (let y = l.tile * 1.2; y < l.hullY - l.tile; y += l.tile * 1.5) {
    const x = wallX(l, side, y, b);
    ctx.moveTo(edge, y - l.tile * 0.3);
    ctx.quadraticCurveTo(x, y, edge, y + l.tile * 0.3);
  }
  ctx.stroke();
}

export function drawHold(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: number,
  flash: number,
): void {
  const t = l.tile;
  const o = spliceOrifice(l, cfg);

  // Veins on the back wall, pulsing on the beat.
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, t * 0.06);
  ctx.strokeStyle = rgba(PALETTE.sheenWarm, 0.07 + 0.06 * flash);
  ctx.beginPath();
  for (const [x0, y0, cx, cy, x1, y1] of VEINS) {
    ctx.moveTo(l.width * x0, l.hullY * y0);
    ctx.quadraticCurveTo(l.width * cx, l.hullY * cy, l.width * x1, l.hullY * y1);
  }
  ctx.stroke();

  // The ceiling: a dark vault with two ribs across it, bowing down.
  const vault = ctx.createLinearGradient(0, 0, 0, o.y + t * 0.6);
  vault.addColorStop(0, rgba(PALETTE.sheenDeep, 0.95));
  vault.addColorStop(1, rgba(PALETTE.sheenDeep, 0));
  ctx.fillStyle = vault;
  ctx.fillRect(0, 0, l.width, o.y + t * 0.6);
  ctx.strokeStyle = rgba(PALETTE.sheenMid, 0.22);
  ctx.lineWidth = Math.max(1.5, t * 0.14);
  ctx.beginPath();
  for (const dy of [-0.9, 0.1]) {
    ctx.moveTo(0, o.y + t * (dy - 0.3));
    ctx.quadraticCurveTo(l.width / 2, o.y + t * (dy + 0.7), l.width, o.y + t * (dy - 0.3));
  }
  ctx.stroke();

  drawWall(ctx, l, 0, b);
  drawWall(ctx, l, 1, b);

  // The orifice, seen from under: a puckered ring, dark in its middle.
  const breath = 1 + 0.06 * Math.sin(b * Math.PI);
  const ring = splinePath(
    blobPoints(o.x, o.y, t * 0.62 * breath, t * 0.3 * breath, 7, 0.12, 0.05, b * 0.3, 5.3, 28),
    true,
  );
  const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, t * 0.66);
  g.addColorStop(0, PALETTE.background);
  g.addColorStop(0.55, PALETTE.sheenDeep);
  g.addColorStop(1, rgba(PALETTE.sheenMid, 0.75));
  ctx.fillStyle = g;
  ctx.fill(ring);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.35);
  ctx.lineWidth = Math.max(1, t * 0.05);
  ctx.stroke(ring);
  ctx.lineWidth = 1;
}
