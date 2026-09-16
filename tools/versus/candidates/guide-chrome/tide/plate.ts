import { halo } from "../../../../../packages/render/src/glow.js";
import type { NavBox } from "../../../../../packages/render/src/guide-nav.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { drawBeads } from "../../../../../packages/render/src/nav-button.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { arrow } from "../word-button.js";

/**
 * TIDE's one body, and the shape every piece of its chrome is cut from: a
 * square with the corners taken off, not a blob.
 *
 * **Why it is not `navBlob`.** The owner read the five candidates and said of
 * RIBBON's box of words that he wanted *the shape of text box, which is not
 * rounded, but more square like with some rounding and some additional top
 * element inside* — and that the rounded buttons should be replaced with it.
 * So this is the shape, and the bar, the badge and the words are all cut from
 * it: `CORNER` of rounding on a rectangle, and a **crest** inset across the
 * top inside the rim.
 *
 * The crest is the "additional top element": a second, shallower plate lying
 * inside the body's top edge in the same colour, lit brighter than the body
 * under it. It is what stops a rectangle reading as a rectangle — the eye gets
 * a second edge to follow, and a button with one looks like a thing with a lid
 * rather than a filled box.
 */

/** The rounding on every corner of every plate. Square enough to read as cut. */
export const CORNER = 9;
/** How tall the crest is inside the top edge, and its inset from the rim. */
const CREST_H = 9;
const CREST_IN = 5;
/** The rounding on the crest's lower two corners — enough to not be a knife
 * edge, little enough that the crest reads as a lid and not as a second
 * button inside the first. */
const CREST_FOOT = 2;

export interface PlateSkin {
  /** The colour the rim, the crest and the words are in. */
  hex: string;
  /** 0 at rest, up to 1 when the plate is calling for a press. */
  glow: number;
  /** Dead plates are drawn but do not answer, and say so by going grey. */
  live: boolean;
  /** A mouse resting on it. Absent on a phone, which is most of the time. */
  hover: boolean;
}

/** The body: a cut square, a top-lit fill, a rim, and the crest inside the top. */
export function plate(ctx: CanvasRenderingContext2D, box: NavBox, s: PlateSkin): void {
  const hex = s.live ? s.hex : "#4A4270";
  const lift = s.live && (s.hover || s.glow > 0) ? 1 : 0;
  if (s.glow > 0) halo(ctx, box.x + box.w / 2, box.y + box.h / 2, box.w * 0.7, hex, 0.35 * s.glow);

  const body = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
  body.addColorStop(0, rgba(hex, 0.3 + 0.22 * lift + 0.2 * s.glow));
  body.addColorStop(0.5, rgba(hex, 0.13 + 0.1 * lift));
  body.addColorStop(1, "rgba(7,5,18,.97)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, CORNER);
  ctx.fill();
  ctx.strokeStyle = rgba(hex, 0.9);
  ctx.lineWidth = 2 + 1.2 * s.glow;
  ctx.stroke();
  crest(ctx, box, hex, 0.5 + 0.3 * lift + 0.2 * s.glow);
}

/**
 * The lid: a shallow plate inside the top edge, brighter than the body.
 *
 * Drawn as its own rounded rectangle rather than as a clipped strip, so the
 * gap between it and the rim is even the whole way round — a strip clipped to
 * the body's path would run right into the corners and read as a bevel.
 */
export function crest(
  ctx: CanvasRenderingContext2D,
  box: NavBox,
  hex: string,
  alpha: number,
): void {
  const x = box.x + CREST_IN;
  const w = box.w - CREST_IN * 2;
  if (w <= CORNER) return;
  const g = ctx.createLinearGradient(0, box.y + CREST_IN, 0, box.y + CREST_IN + CREST_H);
  g.addColorStop(0, rgba(hex, alpha));
  g.addColorStop(1, rgba(hex, alpha * 0.25));
  ctx.fillStyle = g;
  ctx.beginPath();
  // Four radii, clockwise from the top-left: the body's rounding less the
  // inset along the top, so the crest follows the corner it sits inside, and
  // nearly square at the foot, where its lower edge is a line across the
  // plate rather than a corner of anything.
  ctx.roundRect(x, box.y + CREST_IN, w, CREST_H, [
    CORNER - CREST_IN,
    CORNER - CREST_IN,
    CREST_FOOT,
    CREST_FOOT,
  ]);
  ctx.fill();
}

export interface WordPlate extends NavBox, PlateSkin {
  dpr: number;
  lip: SeatSkin["lip"];
}

/**
 * A plate with a word on it and the grown arrow beside the word — the shipped
 * bar's arrow, kept, because the owner's one firm ask of this bar was that
 * NEXT *say "Next" in text also* and never that the sign should go.
 *
 * The word sits below the crest rather than in the middle of the box: the
 * crest takes the top of the plate, so a word centred on the body would ride
 * high against it.
 */
export function wordPlate(
  ctx: CanvasRenderingContext2D,
  p: WordPlate,
  word: string,
  dir: 1 | -1,
  font: string,
  size: number,
): void {
  plate(ctx, p, p);
  const lit = p.live && (p.hover || p.glow > 0);
  ctx.font = font;
  ctx.fillStyle = p.live ? (lit ? "#FFF6E4" : p.hex) : "#3A3160";
  ctx.textAlign = "center";
  const cx = p.x + p.w / 2;
  const cy = p.y + (p.h + CREST_H) / 2;
  const tw = ctx.measureText(word).width;
  const r = size * (1 + 0.12 * p.glow);
  const shift = dir * (r + 4) * 0.5;
  ctx.fillText(word, cx - shift, cy + size * 0.55);
  arrow(ctx, cx + dir * (tw / 2 + 5 + r * 0.5) - shift, cy - size * 0.1, r, dir);
  if (p.live) drawBeads(ctx, cx + dir * (tw / 2 + 5) - shift, cy + r * 0.95, r);
  ctx.textAlign = "left";
}
