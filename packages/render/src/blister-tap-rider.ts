import type { BlisterFrame } from "./blister-bodies.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

const TAU = Math.PI * 2;

/**
 * How much bigger than the blister's radius the body is drawn, so it stands
 * well clear of the yellow press in its middle (`press-drop.ts`, drawn at 0.7
 * of the radius, its call's rings out to about 1.3) — the owner, 15 October
 * 2026: *make sure the graphics are visible to be bigger than the tap (yellow)
 * button*.
 */
const GROW = 1.3;

/** Where the rider sits on the pad's rim, from the top, clear of the pips at
 * twelve, four and eight o'clock. */
const SEAT = (-125 * Math.PI) / 180;

/**
 * RIDER: THE VEER's arrangement, the owner's first thought — a round thing
 * and something sitting on it. The press is a pad, a dome come up out of the
 * pore with the button in its face, and a small amber slime rides on its
 * shoulder, its arms over the rim, bobbing on the beat. Knock the pad down and
 * the rider goes with it.
 */
export function drawRiderBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r * GROW;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  ctx.save();
  // The stalk, under the pad, down into the pore.
  const stalk = new Path2D();
  stalk.rect(x - r * 0.45, y, r * 0.9, f.poreY - y + r * 0.2);
  fill(ctx, stalk, PALETTE.hull, 0.45, r);
  const pad = new Path2D();
  pad.ellipse(x, y, r * 1.3, r * 1.22, 0, 0, TAU);
  const g = ctx.createRadialGradient(x, y - r * 0.5, r * 0.2, x, y, r * 1.35);
  g.addColorStop(0, rgba(PALETTE.hull, 0.7));
  g.addColorStop(1, PALETTE.redDark);
  ctx.fillStyle = g;
  ctx.fill(pad);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.stroke(pad);
  rider(ctx, x, y, r, b.time);
  ctx.restore();
}

function fill(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  hex: string,
  alpha: number,
  r: number,
): void {
  ctx.fillStyle = rgba(hex, alpha);
  ctx.fill(path);
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.6);
  ctx.stroke(path);
}

/** The rider: a lobed amber blob on the rim, leaning in, two eyes on the button. */
function rider(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number): void {
  const bob = Math.sin(time * 5) * r * 0.05;
  const cx = x + Math.cos(SEAT) * r * 1.62;
  const cy = y + Math.sin(SEAT) * r * 1.62 + bob;
  const rr = r * 0.66;
  // Arms reaching from the rider down over the rim, toward the middle, drawn
  // first so the body sits on them.
  const d = Math.atan2(y - cy, x - cx);
  for (const side of [-1, 1]) {
    const ax = cx + Math.cos(d) * rr * 0.75 + Math.cos(d + Math.PI / 2) * side * rr * 0.55;
    const ay = cy + Math.sin(d) * rr * 0.75 + Math.sin(d + Math.PI / 2) * side * rr * 0.55;
    ctx.beginPath();
    ctx.ellipse(ax, ay, rr * 0.42, rr * 0.2, d, 0, TAU);
    ctx.fillStyle = PALETTE.pod;
    ctx.fill();
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.strokeStyle = PALETTE.podDark;
    ctx.stroke();
  }
  const body = new Path2D();
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * TAU;
    const k = rr * (1 + 0.09 * Math.sin(t * 5 + time * 2));
    const px = cx + Math.cos(t) * k;
    const py = cy + Math.sin(t) * k * 0.9;
    if (i === 0) body.moveTo(px, py);
    else body.lineTo(px, py);
  }
  body.closePath();
  const g = ctx.createRadialGradient(cx - rr * 0.35, cy - rr * 0.4, rr * 0.1, cx, cy, rr * 1.1);
  g.addColorStop(0, PALETTE.podRim);
  g.addColorStop(0.5, PALETTE.pod);
  g.addColorStop(1, rgba(PALETTE.ember, 0.95));
  ctx.fillStyle = g;
  ctx.fill(body);
  ctx.lineWidth = Math.max(1.2, r * 0.07);
  ctx.strokeStyle = PALETTE.podDark;
  ctx.stroke(body);
  // Eyes turned toward the button.
  const look = Math.atan2(y - cy, x - cx);
  for (const side of [-1, 1]) {
    const ex = cx + side * rr * 0.38;
    const ey = cy - rr * 0.12;
    ctx.beginPath();
    ctx.arc(ex, ey, rr * 0.24, 0, TAU);
    ctx.fillStyle = PALETTE.text;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + Math.cos(look) * rr * 0.1, ey + Math.sin(look) * rr * 0.1, rr * 0.12, 0, TAU);
    ctx.fillStyle = PALETTE.background;
    ctx.fill();
  }
}
