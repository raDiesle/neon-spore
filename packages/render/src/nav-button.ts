import { blobPath } from "@neon-spore/content";
import { bakedCache } from "./baked.js";
import { halo } from "./glow.js";
import { drawLobeGloss, drawLobeSocket } from "./lobe-shell.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * One button on a guide's bar: a grown body in a wet socket, with a sign on it
 * instead of a word.
 *
 * **It is the panel's own button, stretched wide.** They were flat plates with
 * a stroke round them, and the owner said so twice — *make the buttons look
 * attractive like the control set*, and then *they still don't look like the
 * cool design of the rest of the buttons: boring background colour, slime
 * missing*. The picture above this bar is the game's own screen, and a control
 * on it sits in a wet socket, carries a film of gloss and is fed by the ship.
 * So does this one. The whole button is drawn inside a horizontal stretch,
 * which turns the round socket and the round gloss the panel bakes into the
 * long ones a wide button needs, at no extra cost.
 *
 * **One outline, not two.** The socket's own lip ring sat outside the button's
 * stroke and read as a second border — *they have two borders, remove the outer
 * one* — so the pool is drawn without it (`lobe-shell.ts`).
 *
 * **A sign rather than a word.** BACK, REPLAY and NEXT were set in type, and he
 * asked for symbols that fit the game: *alien and slime if possible*. So the
 * arrows are grown from curves with a concave back and a blunt head, each with
 * a bead of slime hanging off it, and the loop has a bulb on its point. Nothing
 * on this bar is a glyph out of a font any more.
 *
 * Its own file beside `guide-nav.ts` for the split that file always wanted:
 * next door decides where the buttons are and what the bar around them looks
 * like, and this decides what one of them looks like.
 */

/** The contour every button on the bar is cut from — three lobes, shallow. */
const LOBES = 3;
const DEPTH = 0.05;
const SEED = 2207;

const paths = bakedCache<string, Path2D>();

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

/** Which sign a button carries. */
export type NavSign = "back" | "replay" | "next";

export interface NavPaint {
  x: number;
  y: number;
  w: number;
  h: number;
  sign: NavSign;
  /** Whether pressing it answers anything. */
  live: boolean;
  /** Its own colour, and how hard it is asking to be pressed, 0..1. */
  hex: string;
  glow: number;
  /** Whether a mouse is resting on it. */
  hover?: boolean;
  /** The screen it is drawn on, for the baked socket and gloss. */
  dpr: number;
  /** The light in this seat's tissue, so the socket is the ship's own colour. */
  lip: SeatSkin["lip"];
}

/**
 * One button. A spent one is still drawn: a gap would move the other two, and a
 * thumb that has learned where NEXT is should find it there on every page.
 */
export function drawNavButton(ctx: CanvasRenderingContext2D, p: NavPaint): void {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  const r = p.h / 2;
  const lit = p.live && (p.hover ?? false);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(p.w / p.h, 1);
  drawLobeSocket(ctx, 0, 0, r, p.dpr, p.lip, false);
  if (p.glow > 0) halo(ctx, 0, 0, r * 2.1, p.hex, 0.62 * p.glow);
  if (lit) halo(ctx, 0, 0, r * 1.7, p.hex, 0.34);
  // Tissue rather than a plate: lit from the seam above, darkest at the belly,
  // and carrying its own colour instead of one flat purple for all three.
  const strength = p.live ? 0.34 + 0.3 * p.glow + (lit ? 0.22 : 0) : 0;
  const body = ctx.createLinearGradient(0, -r, 0, r);
  body.addColorStop(0, p.live ? tint(p.hex, strength) : "rgba(30,23,58,.92)");
  body.addColorStop(0.55, p.live ? tint(p.hex, strength * 0.48) : "rgba(20,15,42,.92)");
  body.addColorStop(1, p.live ? "rgba(14,9,32,.96)" : "rgba(13,9,28,.92)");
  ctx.fillStyle = body;
  const path = navBlob(p.h, p.h);
  ctx.fill(path);
  ctx.strokeStyle = p.live ? p.hex : "#2A2348";
  ctx.lineWidth = p.live ? 2 + 1.4 * p.glow : 1;
  ctx.globalAlpha = p.live ? 0.6 + 0.4 * Math.max(p.glow, lit ? 1 : 0) : 1;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
  drawLobeGloss(ctx, 0, 0, r, p.dpr);
  ctx.restore();

  sign(ctx, p, cx, cy, lit);
}

/** The sign on the face, unstretched — a sign is a shape and not a letter. */
function sign(
  ctx: CanvasRenderingContext2D,
  p: NavPaint,
  cx: number,
  cy: number,
  lit: boolean,
): void {
  const size = Math.max(9, Math.min(14, p.h * 0.28)) * (1 + 0.1 * p.glow);
  ctx.fillStyle = p.live ? (lit || p.glow > 0 ? "#F4ECFF" : p.hex) : "#3A3160";
  ctx.strokeStyle = ctx.fillStyle;
  if (p.sign === "replay") loopSign(ctx, cx, cy, size);
  else arrowSign(ctx, cx, cy, size, p.sign === "next" ? 1 : -1);
  // The bead that makes it the game's own sign rather than a font's: one drop
  // hanging off the shape, and a smaller one already let go beneath it.
  if (!p.live) return;
  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.arc(cx + size * 0.1, cy + size * 1.05, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(cx + size * 0.1, cy + size * 1.5, size * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * A grown arrow: a blunt head, a concave back, no straight edge anywhere.
 * `dir` is the way it points — `1` right for NEXT, `-1` left for BACK — so the
 * head is the far end of it and the notch is the near one.
 */
function arrowSign(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  dir: 1 | -1,
): void {
  ctx.beginPath();
  ctx.moveTo(x - dir * r * 0.5, y - r);
  ctx.quadraticCurveTo(x + dir * r * 0.3, y - r * 0.4, x + dir * r * 0.8, y);
  ctx.quadraticCurveTo(x + dir * r * 0.3, y + r * 0.4, x - dir * r * 0.5, y + r);
  ctx.quadraticCurveTo(x + dir * r * 0.06, y, x - dir * r * 0.5, y - r);
  ctx.closePath();
  ctx.fill();
}

/** Where the loop's line begins and ends. The gap between them is the top. */
const LOOP_FROM = -Math.PI * 0.42;
const LOOP_TO = Math.PI * 1.16;

/**
 * A ring with a gap in the top of it and a head on one end: play this again.
 *
 * **The head is tangent to the line, and it was not.** It used to be an
 * upright blob dropped at the end of the arc wherever that end happened to
 * be, so the one shape on this bar whose job is to say *which way round*
 * pointed nowhere: *the arrow on the line is incorrect, not an arrow
 * positioned correct*. Now the end point and the direction come from one
 * angle — move the gap and the head follows it round without being told.
 */
function loopSign(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  const rr = r * 0.74;
  ctx.lineWidth = Math.max(1.6, r * 0.22);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y, rr, LOOP_FROM, LOOP_TO);
  ctx.stroke();
  ctx.lineCap = "butt";
  // Counter-clockwise, so the travel at `LOOP_FROM` is the angle decreasing:
  // the tangent there is (sin a, -cos a), and the head points along it into
  // the gap rather than back down its own line.
  ctx.save();
  ctx.translate(x + rr * Math.cos(LOOP_FROM), y + rr * Math.sin(LOOP_FROM));
  ctx.rotate(Math.atan2(-Math.cos(LOOP_FROM), Math.sin(LOOP_FROM)));
  loopHead(ctx, r * 0.5);
  ctx.restore();
}

/**
 * The head itself, pointing along its own +x and sitting astride the origin so
 * the line runs into the notch rather than stopping short of it. The arrow's
 * own grammar one function up: a blunt point, a concave back, no straight edge.
 */
function loopHead(ctx: CanvasRenderingContext2D, s: number): void {
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, -s * 0.78);
  ctx.quadraticCurveTo(s * 0.3, -s * 0.32, s * 0.9, 0);
  ctx.quadraticCurveTo(s * 0.3, s * 0.32, -s * 0.5, s * 0.78);
  ctx.quadraticCurveTo(-s * 0.12, 0, -s * 0.5, -s * 0.78);
  ctx.closePath();
  ctx.fill();
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
  const w = 2.6 + 2.2 * swell;
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.moveTo(x - w, top);
  ctx.quadraticCurveTo(x - w * 0.35, top + reach * 0.6, x, to);
  ctx.quadraticCurveTo(x + w * 0.35, top + reach * 0.6, x + w, top);
  ctx.closePath();
  ctx.fill();
  // A bead that has let go and is on its way down the neck.
  const fall = (Math.sin(phase * 0.7) + 1) / 2;
  ctx.globalAlpha = 0.3 * (1 - fall);
  ctx.beginPath();
  ctx.arc(x, top + reach * (0.2 + 0.85 * fall), w * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** `#RRGGBB` at an alpha, for a gradient that has to carry a button's colour. */
function tint(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
