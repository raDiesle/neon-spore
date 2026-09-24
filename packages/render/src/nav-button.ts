import { blobPoints } from "@neon-spore/content";
import { bakedCache } from "./baked.js";
import { halo } from "./glow.js";
import { drawLobeGloss, drawLobeSocket } from "./lobe-shell.js";
import type { SeatSkin } from "./seat-skin.js";
import { splinePath } from "./spline.js";

/**
 * One button on a guide's bar: a grown body in a wet socket, with a sign on it
 * instead of a word.
 *
 * **It is the panel's own button, stretched wide.** They were flat plates with
 * a stroke round them, and the owner said so twice — *make the buttons look
 * attractive like the control set*, then *boring background colour, slime
 * missing*. A control on the game's own screen sits in a wet socket, carries a
 * film of gloss and is fed by the ship; so does this one. The whole button is
 * drawn inside a horizontal stretch, which turns the round socket and gloss
 * the panel bakes into the long ones a wide button needs, at no extra cost.
 * **One outline, not two:** the socket's own lip ring read as a second border
 * — *they have two borders, remove the outer one* — so the pool is drawn
 * without it (`lobe-shell.ts`).
 *
 * **A sign rather than a word.** BACK, REPLAY and NEXT were set in type, and he
 * asked for symbols that fit the game: *alien and slime if possible*. So the
 * arrows are grown from curves with a concave back and a blunt head, each with
 * a bead of slime hanging off it, and the loop has a bulb on its point.
 *
 * Its own file beside `guide-nav.ts`: that decides where the buttons are and
 * what the bar looks like, this decides what one of them looks like. The body
 * without its sign is `drawNavBody`, for a button that carries a word instead
 * (`lost-screen.ts`).
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
  const made = splinePath(blobPoints(0, 0, w / 2, h / 2, LOBES, DEPTH, 0.02, 0, SEED, 48), true);
  paths.set(key, made);
  return made;
}

/** Which sign a button carries. */
export type NavSign = "back" | "replay" | "next";

/** A button with nothing on its face yet. */
export interface NavBody {
  x: number;
  y: number;
  w: number;
  h: number;
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

export interface NavPaint extends NavBody {
  sign: NavSign;
}

/**
 * One button. A spent one is still drawn: a gap would move the other two, and a
 * thumb that has learned where NEXT is should find it there on every page.
 */
export function drawNavButton(ctx: CanvasRenderingContext2D, p: NavPaint): void {
  drawNavBody(ctx, p);
  sign(ctx, p, p.x + p.w / 2, p.y + p.h / 2, p.live && (p.hover ?? false));
}

/** The socket, the tissue and the gloss, with nothing on the face. */
export function drawNavBody(ctx: CanvasRenderingContext2D, p: NavBody): void {
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
  if (p.live) drawBeads(ctx, cx + size * 0.1, cy + size * 1.05, size);
}

/**
 * The bead that makes a sign the game's own rather than a font's: one drop
 * hanging off the shape at `(x, y)`, and a smaller one already let go beneath
 * it, in whatever `fillStyle` the sign was drawn in.
 */
export function drawBeads(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  for (const [dy, r, a] of [
    [0, 0.15, 0.72],
    [0.45, 0.09, 0.4],
  ] as const) {
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(x, y + size * dy, size * r, 0, Math.PI * 2);
    ctx.fill();
  }
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
export function loopSign(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
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

/** `#RRGGBB` at an alpha, for a gradient that has to carry a button's colour. */
function tint(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
