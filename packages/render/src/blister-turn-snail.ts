import { blisterTurnShare, blisterTurnWayOf } from "@neon-spore/sim";
import type { BlisterFrame } from "./blister-bodies.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

const TAU = Math.PI * 2;

/** Points along the shell's spiral. */
const STEPS = 48;

/**
 * SNAIL, one of THE BLISTER's two TURN bodies (`drawTurnBody`): a snail up
 * out of the pore, all shell, its foot and two eye stalks on the lip. The spiral on the shell winds the way the turn runs — clockwise or
 * not, read off the shell before a thumb is on it — and turns with the knob,
 * as if the lever were winding the shell up.
 */
export function drawSnailBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const sign = blisterTurnWayOf(b.c) === "cw" ? 1 : -1;
  const spin = sign * blisterTurnShare(b.c) * TAU;
  ctx.save();
  // The foot along the lip, and its eye stalks on the side it faces.
  const foot = new Path2D();
  foot.ellipse(x - sign * r * 0.3, f.poreY - r * 0.05, r * 1.55, r * 0.32, 0, Math.PI, TAU);
  ctx.fillStyle = rgba(PALETTE.organ, 0.9);
  ctx.fill(foot);
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.strokeStyle = PALETTE.organRim;
  ctx.stroke(foot);
  for (const k of [0, 1])
    stalk(ctx, x - sign * r * (1.35 + k * 0.25), f.poreY - r * 0.2, r, -sign, k);
  const shell = new Path2D();
  shell.arc(x, y, r * 1.25, 0, TAU);
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.5, r * 0.1, x, y, r * 1.35);
  g.addColorStop(0, rgba(PALETTE.pod, 0.95));
  g.addColorStop(0.7, rgba(PALETTE.ember, 0.75));
  g.addColorStop(1, PALETTE.podDark);
  ctx.fillStyle = g;
  ctx.fill(shell);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.podRim, 0.9);
  ctx.stroke(shell);
  // The spiral: out from the middle, the way the turn runs, turned with it.
  ctx.beginPath();
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const a = spin + sign * t * Math.PI * 4.2;
    const rad = r * (0.12 + 1.05 * t);
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.16;
  ctx.strokeStyle = rgba(PALETTE.podDark, 0.85);
  ctx.stroke();
  ctx.restore();
}

/** One eye stalk, leaning out the way the foot faces, a dark eye on its end. */
function stalk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  side: number,
  k: number,
): void {
  const tx = x + side * r * (0.25 + k * 0.15);
  const ty = y - r * (0.75 - k * 0.12);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(tx, ty);
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.12;
  ctx.strokeStyle = PALETTE.organ;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(tx, ty, r * 0.12, 0, TAU);
  ctx.fillStyle = PALETTE.organRim;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(tx + side * r * 0.03, ty, r * 0.06, 0, TAU);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
}
