import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

const TAU = Math.PI * 2;

/**
 * How much bigger than the blister's radius the body is drawn, so it stands
 * well clear of the yellow press in its middle (`press-drop.ts`, drawn at 0.7
 * of the radius, its call's rings out to about 1.3) — the owner, 15 October
 * 2026: *make sure the graphics are visible to be bigger than the tap (yellow)
 * button*.
 */
export const GROW = 1.5;

/** The socket's radius over the blister's: just outside the press's drop. */
const SOCKET = 0.95;

/**
 * MOLE: the button is the creature's face. A round head comes up out of the
 * pore, more than three times as wide as the yellow press, so the press sits
 * in the middle of it like a snout; two eyes look out over it, and two paws grip the lip.
 * The pip at twelve lands on its brow. Tapping it is hitting the mole.
 */
export function drawMoleBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r * GROW;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const head = new Path2D();
  head.ellipse(x, y + r * 0.12, r * 1.62, r * 1.55, 0, 0, TAU);
  ctx.save();
  slime(ctx, head, x, y, r * 1.6, r);
  // The socket the press sits in: a darker ring just outside the yellow drop,
  // so the drop reads as set into the face rather than laid on it.
  ctx.beginPath();
  ctx.arc(x, y, f.r * SOCKET, 0, TAU);
  ctx.fillStyle = rgba(PALETTE.background, 0.5);
  ctx.fill();
  ctx.lineWidth = f.r * 0.12;
  ctx.strokeStyle = rgba(PALETTE.background, 0.55);
  ctx.stroke();
  for (const side of [-1, 1] as const) eye(ctx, x + side * r * 0.66, y - r * 1.12, r, side, b.time);
  for (const side of [-1, 1] as const) paw(ctx, x + side * r * 1.25, f.poreY - r * 0.12, r, side);
  ctx.restore();
}

/** A body's fill: lit violet at the crown going to the dark of the field, and a rim. */
function slime(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  x: number,
  y: number,
  reach: number,
  r: number,
): void {
  const g = ctx.createRadialGradient(
    x - reach * 0.3,
    y - reach * 0.45,
    reach * 0.1,
    x,
    y,
    reach * 1.1,
  );
  g.addColorStop(0, rgba(PALETTE.hull, 0.95));
  g.addColorStop(0.55, rgba(PALETTE.hull, 0.55));
  g.addColorStop(1, PALETTE.redDark);
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.stroke(path);
}

/** One eye, white with a dark pupil looking down at the button, and a glint. */
function eye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  side: number,
  time: number,
): void {
  const blink = Math.max(0.12, Math.min(1, Math.abs(Math.sin(time * 0.9 + side * 0.2)) * 6));
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.27, r * 0.32 * blink, 0, 0, TAU);
  ctx.fillStyle = PALETTE.text;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.strokeStyle = PALETTE.redDark;
  ctx.stroke();
  if (blink < 0.5) return;
  ctx.beginPath();
  ctx.arc(x - side * r * 0.06, y + r * 0.1, r * 0.14, 0, TAU);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - side * r * 0.1, y + r * 0.03, r * 0.05, 0, TAU);
  ctx.fillStyle = PALETTE.text;
  ctx.fill();
}

/** A paw on the pore's lip: three toes, the outer one turned out. */
function paw(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, side: number): void {
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(
      x + side * (i - 1) * r * 0.2,
      y - Math.abs(i - 1) * r * 0.05,
      r * 0.13,
      r * 0.18,
      side * (i - 1) * 0.4,
      0,
      TAU,
    );
    ctx.fillStyle = rgba(PALETTE.hull, 0.9);
    ctx.fill();
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
    ctx.stroke();
  }
}
