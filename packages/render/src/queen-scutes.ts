import { LIGHT_HALF } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { litColour, litRound } from "./key-light.js";
import { PALETTE } from "./palette.js";
import type { ShellDraw } from "./queen-look.js";

/**
 * SCUTES — THE BULB QUEEN's shell as the game draws it since 11 September
 * 2026, when the owner decided `creature:queen` with "apply from 'versus' to
 * game CREATURE:QUEEN · SCUTES". Written as a VERSUS candidate against
 * `armour` (`queen-look.ts`, kept for the LIBRARY) and moved here whole;
 * `QUEEN_LOOK` points at it.
 *
 * SCUTES — the shell is seven overlapping plates, each one a ridge with a
 * near side, lapped from the wings in toward the middle, and they slide.
 *
 * Every plate is cut from her own contour — a band between two seams,
 * clipped to the silhouette — so the armour follows the body rather than
 * sitting on it. Each is filled as a rounded ridge: the shipped key ramp
 * read across the plate's own width (`litColour`), bright on the edge that
 * faces the light and dark on the one that faces away. Where a plate laps
 * the one outside it, its edge throws a soft shadow onto that plate and
 * wears a bevel — bright on the wing where the edge faces the key, dark on
 * the other — which is the thickness a flat fill cannot have. Over all of
 * them the shipped light (`litRound`) so she is one body and not seven. Then
 * the plates breathe apart and back, and a tilt runs across them from wing
 * to wing, so the shadows each edge throws widen and narrow on their own.
 */

/** The seams, as shares of her half-width. Seven plates, three each side of
 * the one over her middle. */
const SEAMS: readonly number[] = [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75];
/** How far the seams bow toward her middle, as a share of the half-width,
 * so the plates read as chevrons pointing in rather than as slats. */
const BOW = 0.12;
/** How much a plate slides under the next, as a share of the half-width. */
const LAP = 0.06;
/** The shadow the lapping edge throws, as a share of her half-height. */
const SHADE_W = 0.22;
/** The breath: the seams slide out and back, and a tilt runs wing to wing. */
const BREATH = 0.04;
const BREATH_SECONDS = 6;
const RIPPLE = 0.14;
const RIPPLE_HZ = 0.9;
const RIPPLE_LAG = 0.8;
/** Where on the ramp a plate's two edges land, either side of the
 * terminator and well short of both ends: the ridge is a gentle one, and
 * the dome across her whole back is `litRound`'s to say. Any wider and
 * seven bright edges read as a blind. */
const EDGE_LIT = 0.34;
const EDGE_DARK = 0.66;
/** The light is painted as a square of this many half-widths, because her
 * corners stand a fifth past `rx` and a sprite cut at `rx` leaves the wing
 * tips unlit. */
const REACH = 1.25;
const STONE = "#8A8F9C";
const SHADOW = "#0B1024";
const SHEEN = "#F4F1EA";

/** One seam's curve from top to bottom, bowed toward the middle. */
function seam(p: Path2D, x: number, h: number, bow: number, down: boolean): void {
  const y0 = down ? -h : h;
  const y1 = down ? h : -h;
  p.lineTo(x, y0);
  p.quadraticCurveTo(x + bow, 0, x, y1);
}

/**
 * The band between two seams — `left` and `right` in pixels, either one
 * `null` for a wing that runs off the contour — as one closed path.
 */
function band(left: number | null, right: number | null, h: number, rx: number): Path2D {
  const p = new Path2D();
  const l = left ?? -rx * 1.6;
  const r = right ?? rx * 1.6;
  p.moveTo(l, -h);
  if (right === null) p.lineTo(r, -h);
  else seam(p, r, h, -BOW * rx * Math.sign(r || 1), true);
  p.lineTo(l, h);
  if (left === null) p.lineTo(l, -h);
  else seam(p, l, h, -BOW * rx * Math.sign(l || -1), false);
  p.closePath();
  return p;
}

/** A plate filled as a ridge: the ramp across its own width, tilted by the
 * ripple, so its lit edge is the one nearer the key. */
function ridge(
  ctx: CanvasRenderingContext2D,
  region: Path2D,
  l: number,
  r: number,
  tilt: number,
): void {
  const g = ctx.createLinearGradient(l, 0, r, 0);
  const a = Math.max(0, Math.min(1, EDGE_LIT + tilt));
  const b = Math.max(0, Math.min(1, EDGE_DARK + tilt));
  g.addColorStop(0, litColour(STONE, a, LIGHT_HALF.rock));
  g.addColorStop(0.45, litColour(STONE, (a + b) / 2, LIGHT_HALF.rock));
  g.addColorStop(1, litColour(STONE, b, LIGHT_HALF.rock));
  ctx.fillStyle = g;
  ctx.fill(region);
}

/** One seam's curve as a path of its own, shifted `dx` across. */
function seamLine(x: number, dx: number, h: number, rx: number): Path2D {
  const bow = -BOW * rx * Math.sign(x || 1);
  const p = new Path2D();
  p.moveTo(x + dx, -h);
  p.quadraticCurveTo(x + dx + bow, 0, x + dx, h);
  return p;
}

/** The shadow a lapping edge throws onto the plate under it, thrown `out`
 * of the seam — drawn before the lapping plate, which then covers the half
 * of it that fell on the wrong side. */
function shade(
  ctx: CanvasRenderingContext2D,
  x: number,
  h: number,
  rx: number,
  ry: number,
  out: number,
) {
  const w = ry * SHADE_W;
  ctx.lineCap = "butt";
  ctx.strokeStyle = rgba(SHADOW, 0.24);
  ctx.lineWidth = w * 2;
  ctx.stroke(seamLine(x, (out * w) / 2, h, rx));
  ctx.strokeStyle = rgba(SHADOW, 0.3);
  ctx.lineWidth = w * 0.8;
  ctx.stroke(seamLine(x, (out * w) / 5, h, rx));
}

/** The lapping edge itself: bright where it faces the key, dark where it
 * faces away. */
function bevel(
  ctx: CanvasRenderingContext2D,
  x: number,
  h: number,
  rx: number,
  ry: number,
  lit: boolean,
) {
  ctx.strokeStyle = lit ? rgba(SHEEN, 0.5) : rgba(SHADOW, 0.6);
  ctx.lineWidth = Math.max(1, ry * 0.04);
  ctx.stroke(seamLine(x, 0, h, rx));
}

/** The plates from the wings in, each one lapping the one outside it. */
export function scutes(d: ShellDraw): void {
  const { ctx, path, rx, ry, time } = d;
  const h = ry * 1.6;
  const breath = 1 + BREATH * Math.sin((time * Math.PI * 2) / BREATH_SECONDS);
  const at = (i: number): number => SEAMS[i]! * rx * breath;
  const plates = SEAMS.length + 1;
  const mid = (plates - 1) / 2;
  // Outermost first, so each plate nearer the middle covers the lap of the
  // one outside it; the middle plate last, over both its neighbours.
  const order = Array.from({ length: plates }, (_, i) => i).sort(
    (a, b) => Math.abs(b - mid) - Math.abs(a - mid),
  );
  ctx.save();
  ctx.clip(path);
  ctx.fillStyle = STONE;
  ctx.fill(path);
  for (const i of order) {
    const towardMid = i < mid ? 1 : i > mid ? -1 : 0;
    const left = i === 0 ? null : at(i - 1);
    const right = i === plates - 1 ? null : at(i);
    // The plate runs `LAP` past its inner seam, under the next plate in.
    const l = left === null ? null : towardMid < 0 ? left - LAP * rx : left;
    const r = right === null ? null : towardMid > 0 ? right + LAP * rx : right;
    const region = band(l, r, h, rx);
    const tilt = RIPPLE * Math.sin(time * RIPPLE_HZ * Math.PI * 2 - i * RIPPLE_LAG);
    // The edges this plate shows are its outer seams, where it laps the
    // plate outside it: the shadow first, onto that plate, then the ridge
    // over the shadow's inner half, then the edge. On the left wing the edge
    // faces the key.
    const laps: [number, number, boolean][] = [];
    if (towardMid >= 0 && left !== null) laps.push([left, -1, true]);
    if (towardMid <= 0 && right !== null) laps.push([right, 1, false]);
    for (const [x, out] of laps) shade(ctx, x, h, rx, ry, out);
    ridge(ctx, region, l ?? -rx, r ?? rx, tilt);
    for (const [x, , lit] of laps) bevel(ctx, x, h, rx, ry, lit);
  }
  litRound(ctx, 0, 0, rx * REACH, LIGHT_HALF.rock);
  ctx.restore();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = Math.max(1, Math.min(rx, ry) * 0.06);
  ctx.stroke(path);
}
