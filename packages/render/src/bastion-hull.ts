import { facet, LIGHT_HALF, pin } from "@neon-spore/content";
import type { At } from "./bastion-shape.js";
import { halo, strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE BASTION's inner hull and its core** (§11.62): the last shell, a flat
 * battleship-grey ball cut by a dark trench round its middle, panelled by the
 * lines of latitude and longitude a turned ball shows, with hatches set into
 * its upper face — and the ports in its lower face, the way down to the core.
 *
 * **A port is shown to the navigator alone** (`showsBastionPort`): the open
 * one a recessed well with the core's light at the bottom of it, the ones to
 * come shut irises. A port already shot is a blown crater on both screens:
 * that is a receipt, not a clue.
 */

/** A port as the hull draws it: where, and what it is now. */
export interface PortMark extends At {
  state: "open" | "shut" | "blown";
}

/** Hatches on the hull's upper face: longitude, latitude in radians (up negative), and size in hull radii. */
const HATCHES: readonly (readonly [number, number, number])[] = [
  [0.3, -0.55, 0.16],
  [-0.9, -0.35, 0.12],
  [1.4, -0.25, 0.14],
  [2.4, -0.5, 0.12],
  [-2.0, -0.6, 0.15],
  [3.0, -0.2, 0.13],
];

/** Meridians round the hull, and how fast they turn, in radians a second. */
const MERIDIANS = 6;
const HULL_SPIN = 0.12;

export function drawBastionHull(
  ctx: CanvasRenderingContext2D,
  c: At,
  r: number,
  time: number,
  ports: readonly PortMark[],
  pulse: number,
): void {
  const body = new Path2D();
  body.arc(c.x, c.y, r, 0, Math.PI * 2);
  ctx.save();
  ctx.fillStyle = PALETTE.bastionHull;
  ctx.fill(body);
  ctx.clip(body);
  litRound(ctx, c.x, c.y, r, LIGHT_HALF.rock);
  const spin = time * HULL_SPIN;
  ctx.strokeStyle = rgba(PALETTE.bastionHullDark, 0.75);
  ctx.lineWidth = STROKE.inner;
  // The panel lines: meridians turning with the ball, and two parallels.
  for (let k = 0; k < MERIDIANS; k++) {
    const phi = spin + (k * Math.PI) / MERIDIANS;
    const w = Math.abs(Math.sin(phi)) * r;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, Math.max(0.5, w), r, 0, -Math.PI / 2, Math.PI / 2, Math.cos(phi) < 0);
    ctx.stroke();
  }
  for (const lat of [-0.5, 0.45]) {
    ctx.beginPath();
    const rr = r * Math.cos(Math.asin(lat));
    ctx.ellipse(c.x, c.y + lat * r, rr, rr * 0.3, 0, 0, Math.PI);
    ctx.stroke();
  }
  for (const [lon, lat, size] of HATCHES) drawHatch(ctx, c, r, lon, lat, size, spin);
  drawTrench(ctx, c, r);
  ctx.restore();
  for (const p of ports) drawPort(ctx, p, r, pulse);
  strokeGlowFaded(ctx, body, PALETTE.bastionEdge, STROKE.inner, 0.6);
}

/** The trench round the middle: a dark channel, its far wall lit. */
function drawTrench(ctx: CanvasRenderingContext2D, c: At, r: number): void {
  const y = c.y + r * 0.08;
  ctx.lineWidth = r * 0.11;
  ctx.strokeStyle = PALETTE.bastionHullDark;
  ctx.beginPath();
  ctx.ellipse(c.x, y, r, r * 0.3, 0, 0, Math.PI);
  ctx.stroke();
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.bastionEdge, 0.55);
  ctx.beginPath();
  ctx.ellipse(c.x, y - r * 0.05, r, r * 0.3, 0, 0, Math.PI);
  ctx.stroke();
}

/**
 * A hatch placed on the turning surface (`content/surface.ts`): narrowed by
 * the tangent plane's own map as it goes round, and gone on the far side.
 */
function drawHatch(
  ctx: CanvasRenderingContext2D,
  c: At,
  r: number,
  lon: number,
  lat: number,
  size: number,
  spin: number,
): void {
  const f = facet(pin(lon, lat, r), spin);
  if (!f.near) return;
  const w = size * r * f.sx;
  const h = size * r * 0.6 * f.sy;
  const x = c.x + f.x;
  const y = c.y + f.y;
  ctx.fillStyle = PALETTE.bastionHullDark;
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.fillStyle = rgba(PALETTE.bastionEdge, 0.15 + 0.35 * f.lit);
  ctx.fillRect(x - w / 2, y - h / 2, w, h * 0.18);
}

function drawPort(ctx: CanvasRenderingContext2D, p: PortMark, r: number, pulse: number): void {
  const w = r * 0.17;
  const h = w * 0.62;
  const well = new Path2D();
  well.ellipse(p.x, p.y, w, h, 0, 0, Math.PI * 2);
  if (p.state === "blown") {
    ctx.fillStyle = "#000";
    ctx.fill(well);
    halo(ctx, p.x, p.y, w * 1.6, PALETTE.bastionLight, 0.5);
    strokeGlowFaded(ctx, well, PALETTE.bastionLight, STROKE.inner, 0.8);
    return;
  }
  ctx.fillStyle = PALETTE.bastionHullDark;
  ctx.fill(well);
  if (p.state === "shut") {
    // An iris: six blades meeting in the middle.
    ctx.strokeStyle = rgba(PALETTE.bastionEdge, 0.5);
    ctx.lineWidth = STROKE.inner;
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(a) * w, p.y + Math.sin(a) * h);
      ctx.stroke();
    }
    strokeGlowFaded(ctx, well, PALETTE.bastionEdge, STROKE.inner, 0.4);
    return;
  }
  // Open: the core's light down the well, breathing on the beat.
  const glow = new Path2D();
  glow.ellipse(p.x, p.y + h * 0.15, w * 0.55, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.bastionCore;
  ctx.fill(glow);
  halo(ctx, p.x, p.y, w * (2.4 + pulse), PALETTE.bastionLight, 0.8);
  strokeGlowFaded(ctx, well, PALETTE.bastionLight, STROKE.outline, 1.2 + pulse);
}

/**
 * The core: a white-hot ball under every shell, seen only through the cage
 * or once the hull is off; blowing, it swells and goes out in a flash.
 */
export function drawBastionCore(
  ctx: CanvasRenderingContext2D,
  c: At,
  r: number,
  blow: number,
  pulse: number,
): void {
  if (blow >= 1) return;
  const swell = r * (1 + 0.6 * blow + 0.06 * pulse);
  const fade = blow > 0.6 ? 1 - (blow - 0.6) / 0.4 : 1;
  halo(ctx, c.x, c.y, swell * 2.6, PALETTE.bastionLight, 0.7 * fade);
  const ball = new Path2D();
  ball.arc(c.x, c.y, swell, 0, Math.PI * 2);
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.fillStyle = PALETTE.bastionCore;
  ctx.fill(ball);
  strokeGlowFaded(ctx, ball, PALETTE.bastionLight, STROKE.outline, 1.5);
  ctx.restore();
  if (blow > 0.4) halo(ctx, c.x, c.y, swell * 5 * blow, PALETTE.bastionCore, fade);
}
