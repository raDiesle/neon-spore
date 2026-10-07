import { KEY } from "@neon-spore/content";
import { LAMPREY_TEETH } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { type LampreyPose, lampreyToothAt } from "./lamprey-shape.js";
import { PALETTE } from "./palette.js";

/**
 * **THE LAMPREY's sucker, in detail**: the fleshy fringe of papillae round
 * the lip, the gloss along its rim, the ribs down the throat and the gums the
 * teeth stand in. None of it is a tooth or a socket, so the gaps in the ring
 * still count its health by eye (`lamprey-draw.ts`).
 *
 * **It moves on the beat**: while the mouth is bitten into a tile the fringe
 * pulls in all together once a beat, sucking; anywhere else a ripple runs
 * round it. The throat swallows, its ribs drawn inward a beat at a time.
 */

/** The papillae round the lip, and their size in mouth radii. */
const PAPILLAE = 26;
const PAPILLA = 0.085;

/**
 * The fringe: a bump per papilla just outside the lip, its shadow under it.
 * Drawn before the lip, which covers each bump's inner half.
 */
export function drawLampreyFringe(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  wave: number,
  sucking: boolean,
  drop: number,
): void {
  const fringe = new Path2D();
  for (let k = 0; k < PAPILLAE; k++) {
    const a = (k * Math.PI * 2) / PAPILLAE;
    const pulse = sucking
      ? 0.5 + 0.5 * Math.sin(wave * 2.5)
      : 0.5 + 0.5 * Math.sin(wave * 2 - k * 0.9);
    const r = p.r * PAPILLA * (0.75 + 0.5 * pulse);
    const reach = p.r * (0.98 + 0.04 * pulse);
    const x = p.x + reach * Math.cos(a);
    const y = p.y + reach * p.tilt * Math.sin(a);
    fringe.moveTo(x + r, y);
    fringe.ellipse(x, y, r, r * (0.5 + 0.5 * p.tilt), 0, 0, Math.PI * 2);
  }
  ctx.save();
  ctx.translate(0, drop);
  ctx.fillStyle = PALETTE.lampreyHideDark;
  ctx.fill(fringe);
  ctx.restore();
  ctx.fillStyle = PALETTE.lampreyFin;
  ctx.fill(fringe);
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.7);
  ctx.stroke(fringe);
}

/** The gloss on the lip: a crescent on the side the key light reaches. */
export function drawLampreyLipGloss(ctx: CanvasRenderingContext2D, p: LampreyPose): void {
  const toward = Math.atan2(KEY.y, KEY.x);
  ctx.lineCap = "round";
  ctx.lineWidth = p.r * 0.07;
  ctx.strokeStyle = "rgba(255,255,240,0.3)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, p.r * 0.91, p.r * 0.91 * p.tilt, 0, toward - 0.75, toward + 0.75);
  ctx.stroke();
  ctx.lineWidth = p.r * 0.03;
  ctx.strokeStyle = "rgba(255,255,240,0.55)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, p.r * 0.91, p.r * 0.91 * p.tilt, 0, toward - 0.35, toward + 0.25);
  ctx.stroke();
}

/** The throat's ribs, in mouth radii from the lip inward. */
const RIBS = [0.68, 0.5, 0.34, 0.2] as const;

/**
 * The ribs down the throat inside the mouth's black: rings drawn in toward
 * the middle a beat at a time, fainter the deeper they are, so the mouth has
 * a depth and swallows.
 */
export function drawLampreyThroat(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  wave: number,
): void {
  // A swallow: every rib slides a step inward over a beat, and the first fades in behind it.
  const k = (((wave / (Math.PI * 0.8)) % 1) + 1) % 1;
  ctx.lineWidth = p.r * 0.045;
  RIBS.forEach((reach, i) => {
    const next = RIBS[i + 1] ?? reach * 0.6;
    const at = reach + (next - reach) * k;
    const fade = i === 0 ? k : 1;
    ctx.strokeStyle = rgba(PALETTE.lampreyThroat, (0.55 - i * 0.12) * fade);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + p.r * 0.04, p.r * at, p.r * at * p.tilt, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
}

/** The gums: a swelling of wet meat at the root of each tooth still in. */
export function drawLampreyGums(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  isIn: (t: number) => boolean,
): void {
  const gums = new Path2D();
  const r = p.r * 0.11;
  for (let t = 0; t < LAMPREY_TEETH; t++) {
    if (!isIn(t)) continue;
    const at = lampreyToothAt(p, t, 0.87);
    gums.moveTo(at.x + r, at.y);
    gums.ellipse(at.x, at.y, r, r * (0.4 + 0.6 * p.tilt), 0, 0, Math.PI * 2);
  }
  ctx.fillStyle = PALETTE.lampreyGum;
  ctx.fill(gums);
}
