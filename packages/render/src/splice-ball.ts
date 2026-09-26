import { blobPoints } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE SPLICE's numbers, as something to collect**: a living spore pod — a
 * see-through membrane with hairs waving round it, veins in it, and a nucleus
 * that beats with the digit in it — a power-up, because getting it down the
 * right straw is the prize (the owner, 25 September 2026: *more natural, alien,
 * living*).
 *
 * The amber is the pod's, which is what a pickup already is in this game, so
 * the ball reads as *take this* before its number is read. A ball already fed
 * is a green ghost of one — still there, because the order is what the
 * navigator is reading, and spent.
 *
 * Nothing here is held between frames: the wobble, the hairs and the beat run
 * off the beat the caller hands in.
 */

export interface BallLook {
  /** 0 to 1: the rumble of a ball about to be taken — shaken and stretched. */
  shake: number;
  /** How opaque, for a ball seen through a pipe's wall. */
  alpha: number;
}

const STILL: BallLook = { shake: 0, alpha: 1 };

/** How far the membrane's own specular drifts off its resting spot, as a
 * share of `r`, and how fast. The membrane's own silhouette already wobbles
 * on `b*0.5` and the nucleus's on `b*0.8` (`blobPoints` below); each
 * highlight gets its own rate, distinct from both, so neither ever locks
 * into step with the body it is meant to be lighting
 * (`docs/style-guide.md`'s "Depth on a body that already ships"). */
const MEMBRANE_LIT_WOBBLE = 0.05;
const MEMBRANE_LIT_WOBBLE_RATE = 0.7;
const NUCLEUS_LIT_WOBBLE = 0.05;
const NUCLEUS_LIT_WOBBLE_RATE = 1.1;

/** Hairs round a pod's rim, each waving on its own phase. */
function drawCilia(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  b: number,
  seed: number,
  shake: number,
): void {
  const n = 14;
  ctx.strokeStyle = rgba(PALETTE.pod, 0.8);
  ctx.lineWidth = Math.max(0.8, r * 0.07);
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + seed;
    const wave = Math.sin(b * Math.PI * (1 + shake * 3) + i * 1.3) * (0.35 + shake * 0.4);
    const len = r * (0.3 + 0.08 * Math.sin(i * 2.7 + seed));
    const bx = x + Math.cos(a) * r * 0.95;
    const by = y + Math.sin(a) * r * 0.95;
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a + wave) * len, by + Math.sin(a + wave) * len);
  }
  ctx.stroke();
}

export function drawSlimeBall(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r: number,
  b: number,
  seed: number,
  label: string,
  look: BallLook = STILL,
): void {
  const jig = look.shake * r * 0.16;
  const x = x0 + Math.sin(b * 41 + seed) * jig;
  const y = y0 + Math.cos(b * 53 + seed) * jig * 0.6;
  const stretch = 1 + look.shake * 0.18;
  ctx.globalAlpha = look.alpha;

  // A heartbeat: a quick double swell on each beat, the nucleus leading it.
  const f = (((b + seed * 0.13) % 1) + 1) % 1;
  const beatSwell = Math.max(0, Math.sin(f * Math.PI * 4)) * (f < 0.5 ? 1 : 0);
  const halo = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.9);
  halo.addColorStop(0, rgba(PALETTE.pod, 0.28 + 0.12 * beatSwell + 0.2 * look.shake));
  halo.addColorStop(1, rgba(PALETTE.pod, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
  ctx.fill();

  drawCilia(ctx, x, y, r, b, seed, look.shake);

  // The drip first, so the membrane sits over its root.
  const drip = (b * 0.4 + seed * 0.31) % 1;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.25, y + r * 0.8);
  ctx.quadraticCurveTo(x, y + r * (1.15 + 0.4 * drip), x + r * 0.25, y + r * 0.8);
  ctx.fillStyle = rgba(PALETTE.ember, 0.8);
  ctx.fill();

  // The membrane: see-through, so what is alive in it shows.
  const skin = splinePath(
    blobPoints(x, y, r / Math.sqrt(stretch), r * stretch, 4, 0.04, 0.05, b * 0.5, seed, 28),
    true,
  );
  const mWobble = MEMBRANE_LIT_WOBBLE * Math.sin(b * MEMBRANE_LIT_WOBBLE_RATE);
  const fill = ctx.createRadialGradient(
    x - r * (0.3 + mWobble),
    y - r * (0.35 + mWobble * 0.8),
    r * 0.1,
    x,
    y,
    r * 1.05,
  );
  fill.addColorStop(0, rgba(PALETTE.podRim, 0.3));
  fill.addColorStop(0.6, rgba(PALETTE.pod, 0.14));
  fill.addColorStop(1, rgba(PALETTE.ember, 0.55));
  ctx.fillStyle = fill;
  ctx.fill(skin);
  ctx.strokeStyle = rgba(PALETTE.pod, 0.9);
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.stroke(skin);

  // Veins from the membrane in to the nucleus.
  ctx.strokeStyle = rgba(PALETTE.ember, 0.95);
  ctx.lineWidth = Math.max(0.8, r * 0.06);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = seed * 1.7 + i * 1.6;
    const bend = a + 0.5;
    ctx.moveTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9);
    ctx.quadraticCurveTo(
      x + Math.cos(bend) * r * 0.75,
      y + Math.sin(bend) * r * 0.75,
      x + Math.cos(a + 0.9) * r * 0.55,
      y + Math.sin(a + 0.9) * r * 0.55,
    );
  }
  ctx.stroke();

  // The nucleus, beating, with the number in it.
  const nr = r * (0.55 + 0.08 * beatSwell);
  const nucleus = splinePath(blobPoints(x, y, nr, nr, 3, 0.06, 0.04, b * 0.8, seed + 2, 20), true);
  const nWobble = NUCLEUS_LIT_WOBBLE * Math.sin(b * NUCLEUS_LIT_WOBBLE_RATE);
  const core = ctx.createRadialGradient(
    x - nr * (0.3 + nWobble),
    y - nr * (0.3 + nWobble * 0.8),
    0,
    x,
    y,
    nr,
  );
  core.addColorStop(0, PALETTE.podRim);
  core.addColorStop(0.5, PALETTE.pod);
  core.addColorStop(1, PALETTE.ember);
  ctx.fillStyle = core;
  ctx.fill(nucleus);
  ctx.strokeStyle = rgba(PALETTE.podDark, 0.35);
  ctx.lineWidth = Math.max(0.8, r * 0.04);
  ctx.stroke(nucleus);

  // A wet glint on the membrane.
  ctx.fillStyle = rgba(PALETTE.text, 0.75);
  ctx.beginPath();
  ctx.ellipse(x - r * 0.5, y - r * 0.5, r * 0.18, r * 0.08, -0.7, 0, Math.PI * 2);
  ctx.fill();

  const size = Math.max(9, Math.round(r * 1.05));
  ctx.font = `800 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.podDark;
  ctx.fillText(label, x, y + r * 0.05);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 1;
}

/** A ball already fed: a green ghost with its number, no longer to be had. */
export function drawSpentBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  label: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.good, 0.12);
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.good, 0.7);
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.stroke();
  const size = Math.max(9, Math.round(r * 1.05));
  ctx.font = `700 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.good;
  ctx.fillText(label, x, y);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

/**
 * Air rushing into a straw's top end round the ball it is about to take:
 * streaks drawn in from a ring toward the ball, faster and brighter as `amount`
 * goes from 0 to 1. The rumble's other half — a ball shaking for no reason
 * would be a ball that is broken.
 */
export function drawAirRush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  b: number,
  amount: number,
): void {
  if (amount <= 0) return;
  const streaks = 9;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, r * 0.1);
  for (let i = 0; i < streaks; i++) {
    const a = (i / streaks) * Math.PI * 2 + i * 0.7;
    // Each streak slides inward on its own phase and starts over outside.
    const f = (b * (1.5 + amount * 2) + i * 0.37) % 1;
    const outer = r * (3.1 - f * 1.6);
    const inner = Math.max(r * 1.15, outer - r * (0.7 + amount * 0.5));
    ctx.strokeStyle = rgba(PALETTE.podRim, amount * 0.7 * (1 - f * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
    ctx.lineTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
}
