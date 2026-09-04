import { blobPath } from "@neon-spore/content";
import { halo } from "./glow.js";
import { drawLobeGloss, drawLobeSocket } from "./lobe-shell.js";
import { PALETTE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * One button on a guide's bar, and the contour every one of them is cut from.
 *
 * **It is the panel's own button, stretched wide.** They were flat plates with
 * a stroke round them, and the owner said so twice — *make the buttons look
 * attractive like the control set*, and then *the BACK and NEXT buttons still
 * do not look like the cool design of the rest of the buttons: boring
 * background colour, slime missing*. He is right that a second look for a
 * second kind of button is the wrong answer: the picture above this bar is the
 * game's own screen, and a control on it sits in a wet socket, carries a film
 * of gloss and is fed by the ship (`lobe-shell.ts`, `band-slime.ts`). So does
 * this one. The whole button is drawn inside a horizontal stretch, which turns
 * the round socket and the round gloss the panel bakes into the long ones a
 * word needs, at no extra cost — they are the same two sprites.
 *
 * Its own file beside `guide-nav.ts` for the split that file always wanted:
 * next door decides where the three buttons are and what the bar says around
 * them, and this decides what one of them looks like.
 */

/** The contour every button on the bar is cut from — three lobes, shallow. */
const LOBES = 3;
const DEPTH = 0.05;
const SEED = 2207;

const paths = new Map<string, Path2D>();

/** The contour, cached: the bar redraws every frame and the shape never moves. */
export function navBlob(w: number, h: number): Path2D {
  const key = `${Math.round(w)}x${Math.round(h)}`;
  const held = paths.get(key);
  if (held) return held;
  if (paths.size > 8) paths.clear();
  const made = new Path2D(blobPath(0, 0, w / 2, h / 2, LOBES, DEPTH, 0.02, 0, SEED, 48));
  paths.set(key, made);
  return made;
}

export interface NavPaint {
  x: number;
  y: number;
  w: number;
  h: number;
  /** The word on it, and whether pressing it answers anything. */
  text: string;
  live: boolean;
  /** Its own colour, and how hard it is asking to be pressed, 0..1. */
  hex: string;
  glow: number;
  /** The screen it is drawn on, for the baked socket and gloss. */
  dpr: number;
  /** The light in this seat's tissue, so the socket is the ship's own colour. */
  lip: SeatSkin["lip"];
  /** Whether it carries the circular arrow REPLAY is named by. */
  loop?: boolean;
}

/**
 * One button. A spent one is still drawn: a gap would move the other two, and a
 * thumb that has learned where NEXT is should find it there on every page.
 */
export function drawNavButton(ctx: CanvasRenderingContext2D, p: NavPaint): void {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  const r = p.h / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(p.w / p.h, 1);
  drawLobeSocket(ctx, 0, 0, r, p.dpr, p.lip);
  if (p.glow > 0) halo(ctx, 0, 0, r * 1.7, p.hex, 0.5 * p.glow);
  // Tissue rather than a plate: lit from the seam above, darkest at the belly,
  // and carrying its own colour instead of the one flat purple every button on
  // this bar used to share.
  const body = ctx.createLinearGradient(0, -r, 0, r);
  body.addColorStop(0, p.live ? tint(p.hex, 0.34) : "rgba(30,23,58,.92)");
  body.addColorStop(0.55, p.live ? tint(p.hex, 0.16) : "rgba(20,15,42,.92)");
  body.addColorStop(1, p.live ? "rgba(14,9,32,.96)" : "rgba(13,9,28,.92)");
  ctx.fillStyle = body;
  const path = navBlob(p.h, p.h);
  ctx.fill(path);
  ctx.strokeStyle = p.live ? p.hex : "#2A2348";
  ctx.lineWidth = p.live ? 2 : 1;
  ctx.globalAlpha = p.live ? 0.6 + 0.4 * p.glow : 1;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
  drawLobeGloss(ctx, 0, 0, r, p.dpr);
  ctx.restore();

  // The type shrinks with the button, so a six-letter word still fits inside
  // the contour on a 240-point screen instead of running out of both ends.
  const size = Math.max(10, Math.min(14, Math.round(p.w / 7.6)));
  ctx.textAlign = "center";
  ctx.font = `700 ${size}px "Courier New",monospace`;
  ctx.fillStyle = p.live ? PALETTE.text : PALETTE.dim;
  const shift = p.loop ? 6 : 0;
  ctx.fillText(p.text, cx + shift, cy + size * 0.36);
  if (p.loop) {
    loopGlyph(ctx, cx + shift - ctx.measureText(p.text).width / 2 - 9, cy, 5.5, p.hex, p.live);
  }
  ctx.textAlign = "left";
}

/**
 * What feeds a button from the bar's own membrane: a neck of slime running out
 * of the edge above and reaching down to the socket, thickening and thinning on
 * its own clock. The panel's answer to the same sentence, one layer up —
 * nothing down here sits on the ship, everything is fed by it
 * (`band-slime.ts`).
 */
export function drawNavFeeder(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  to: number,
  hex: string,
  phase: number,
): void {
  const reach = to - top;
  if (reach <= 2) return;
  const swell = 0.55 + 0.45 * Math.sin(phase);
  const w = 2.2 + 1.8 * swell;
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.moveTo(x - w, top);
  ctx.quadraticCurveTo(x - w * 0.35, top + reach * 0.6, x, to);
  ctx.quadraticCurveTo(x + w * 0.35, top + reach * 0.6, x + w, top);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** A circle with a gap and an arrowhead: play this again. */
function loopGlyph(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hex: string,
  live: boolean,
): void {
  ctx.strokeStyle = live ? hex : "#2A2348";
  ctx.fillStyle = live ? hex : "#2A2348";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI * 0.5, Math.PI * 1.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - r - 3.2);
  ctx.lineTo(x + 4.6, y - r);
  ctx.lineTo(x, y - r + 3.2);
  ctx.closePath();
  ctx.fill();
}

/** `#RRGGBB` at an alpha, for a gradient that has to carry a button's colour. */
function tint(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
