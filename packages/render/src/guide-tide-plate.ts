import { halo } from "./glow.js";
import type { NavBox } from "./guide-nav.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import { drawBeads } from "./nav-button.js";
import type { SeatSkin } from "./seat-skin.js";

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
/**
 * How deep the crest hangs inside the top edge, at its shallowest, and how far
 * in from the rim it sits.
 *
 * It was a flat 9 until 16 September 2026, when the owner asked for less of it:
 * *the top line, maybe not so much height, and more interesting, maybe
 * something alien organic.* Six is the floor and `CREST_SWELL` is what the
 * lobes add, so the deepest point of the wave lands at seven and a half — still
 * shorter than the lid it replaces, at every point of it.
 */
export const CREST_H = 4.5;
const CREST_IN = 5;
/**
 * How far the lobes swell either side of that floor.
 *
 * Two and a half on four and a half puts the edge between two and seven, so
 * the deepest point of the wave is still shorter than the flat lid it replaced
 * and the shallowest is a third of it. It was 1.5 for an afternoon, and 1.5 on
 * a badge 220 wide is a straight line with a wobble in it — which is the
 * rounded rectangle again, drawn more slowly.
 */
const CREST_SWELL = 2.5;
/** How wide one lobe is, across. A plate gets as many as it has room for, so a
 * badge is not one long swell and BACK is not a single bump. */
const LOBE_W = 55;

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
 * The lid, and it is a meniscus rather than a shelf: a shallow pool of light
 * inside the top edge whose lower edge rises and falls in lobes, with the
 * brighter line along that edge a liquid has and a gradient does not.
 *
 * **The owner asked for this by name** on 16 September 2026, of the shape a
 * rounded rectangle made: *the top line, maybe not so much height, and more
 * interesting, maybe something alien organic.* A second rectangle inside the
 * first says machined, which is the one thing this game's furniture is not —
 * everything a finger or an eye goes to here is grown. So the top of the crest
 * still follows the corners it sits inside, because that is what makes the
 * plate read as a thing with a lid, and the bottom of it is the same surface
 * the band's own top is made of (`guide-tide-membrane.ts`): two sines at
 * frequencies that do not divide each other, so the edge does not repeat
 * across a plate the width of a phone. How many lobes a plate gets is its own
 * width over `LOBE_W`, so the badge swells four or five times and BACK twice —
 * one lobe stretched to fit is a bump, and eight squeezed in is a serration.
 *
 * **It does not move, and each plate's is its own.** The phase comes off the
 * box rather than off a clock: six plates drawn from one shape with one edge
 * between them read as six copies, and six with the lobes falling differently
 * read as six of a kind. A clock here would be a seventh thing breathing on a
 * page whose job is to point at one thing — `guide-tide.ts` already names the
 * band's lobes as the part to watch — and it would cost a path per plate per
 * frame instead of per plate.
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
  const top = box.y + CREST_IN;
  // The body's rounding less the inset, so the crest follows the corner it
  // sits inside rather than cutting across it.
  const r = Math.max(0, CORNER - CREST_IN);
  // A plate's own place on the row, which is the same on every frame.
  const phase = sinHash(Math.round(box.x), Math.round(box.w)) * Math.PI * 2;
  const cycles = Math.max(2, Math.round(w / LOBE_W));
  const steps = Math.max(12, cycles * 8);
  const foot = (t: number): number =>
    top +
    CREST_H +
    CREST_SWELL *
      (0.62 * Math.sin(t * Math.PI * 2 * cycles + phase) +
        0.38 * Math.sin(t * Math.PI * 2 * cycles * 2.3 + phase * 1.7));

  const lid = new Path2D();
  lid.moveTo(x + r, top);
  lid.lineTo(x + w - r, top);
  lid.quadraticCurveTo(x + w, top, x + w, top + r);
  lid.lineTo(x + w, foot(1));
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    lid.lineTo(x + t * w, foot(t));
  }
  lid.lineTo(x, top + r);
  lid.quadraticCurveTo(x, top, x + r, top);
  lid.closePath();

  const g = ctx.createLinearGradient(0, top, 0, top + CREST_H + CREST_SWELL);
  g.addColorStop(0, rgba(hex, alpha));
  g.addColorStop(1, rgba(hex, alpha * 0.2));
  ctx.fillStyle = g;
  ctx.fill(lid);

  // The meniscus: the lower edge alone, brighter than the pool above it. It is
  // the whole of why this reads as something held rather than as a bevel.
  const line = new Path2D();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (i === 0) line.moveTo(x, foot(0));
    else line.lineTo(x + t * w, foot(t));
  }
  ctx.strokeStyle = rgba(hex, Math.min(1, alpha * 1.5));
  ctx.lineWidth = 1.2;
  ctx.stroke(line);
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

/**
 * A grown arrow: blunt head, concave back, no straight edge.
 *
 * It came across from the slot's shared word-button.ts when TIDE was taken,
 * because it is the only thing TIDE ever used from that file and the file went
 * with the four candidates that lost. The shape is the bar's own from before
 * the vote — the owner's one firm ask of this bar was that NEXT *say "Next" in
 * text also*, never that the sign should go.
 */
export function arrow(
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
