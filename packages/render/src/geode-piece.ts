import { colorTrio } from "./creature-tint.js";
import type { HuskBox, PieceBox } from "./geode-place.js";
import { type At, crackPoints, piecePoints, polyPath } from "./geode-shape.js";
import { halo } from "./glow.js";
import { signedHash, sinHash } from "./hash.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **One piece of THE GEODE**: a faceted rock, its crack, the crystal showing
 * through its pores — and, once the beam has gone down it, the two halves it
 * broke into, turned apart so the crystal of the cut faces shows.
 *
 * **The shape is THE CAIRN** (`tools/shape-sheet/src/drafts/collected.ts`):
 * rocks in one outline with the seams left to count. Each piece is a
 * squared-off contour of flat facets rather than lobes, inset from its
 * neighbours so the dark seam between two is a count the pair can read: the
 * stone's health is how many pieces it is in.
 */

/** What this screen is shown of a piece (`view-role-clocks-c.ts`). */
export interface PieceLook {
  /** The crack's line: the navigator's. */
  crack: boolean;
  /** The crystal's colour: the pilot's. */
  crystal: boolean;
  /** Whether the level is lit, so its cracks and colours are up at all. */
  lit: boolean;
  tile: number;
  time: number;
  /** 0..1 on the beat, for the crack's throb. */
  beatPhase: number;
}

/** How the halves of a cut piece stand apart: open sideways, turned out, dropped, faded. */
export interface Flight {
  open: number;
  rot: number;
  drop: number;
  alpha: number;
  /** 0..1 of the cut faces turned toward the pair. */
  turn: number;
}

/** The body: a dark slab under facets lit from the upper left, an inner table, a rim. */
function paintBody(
  ctx: CanvasRenderingContext2D,
  pts: readonly At[],
  tile: number,
  hex: string,
): void {
  const cx = pts.reduce((s, q) => s + q.x, 0) / pts.length;
  const cy = pts.reduce((s, q) => s + q.y, 0) / pts.length;
  const ic = { x: cx - tile * 0.12, y: cy - tile * 0.15 };
  const inner = pts.map((q) => ({ x: ic.x + (q.x - cx) * 0.55, y: ic.y + (q.y - cy) * 0.55 }));
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length] as At;
    const ia = inner[i] as At;
    const ib = inner[(i + 1) % pts.length] as At;
    const nx = b.y - a.y;
    const ny = -(b.x - a.x);
    const lit = (-0.5 * nx - 0.85 * ny) / (Math.hypot(nx, ny) || 1);
    ctx.fillStyle = mixHex(hex, PALETTE.background, 0.55 - 0.3 * lit);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(ib.x, ib.y);
    ctx.lineTo(ia.x, ia.y);
    ctx.closePath();
    ctx.fill();
  });
  ctx.fillStyle = mixHex(hex, PALETTE.background, 0.4);
  ctx.fill(polyPath(inner));
  ctx.strokeStyle = rgba(mixHex(hex, PALETTE.background, 0.75), 0.95);
  ctx.lineWidth = Math.max(1.5, tile * 0.07);
  ctx.lineJoin = "round";
  ctx.stroke(polyPath(pts));
}

/** What a piece is made of on this screen: rock, or a crystal heart in the colour only the pilot sees. */
function bodyHex(b: PieceBox, look: PieceLook): string {
  if (!b.heart) return PALETTE.rock;
  return look.crystal && look.lit ? colorTrio(b.color).hex : PALETTE.sparkDim;
}

/** The crystal showing through pores in the rock, spread over the whole piece so they say no column. */
function drawPores(ctx: CanvasRenderingContext2D, b: PieceBox, look: PieceLook): void {
  const t = look.tile;
  const colour = look.crystal && look.lit;
  const trio = colorTrio(b.color);
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  const n = Math.max(3, Math.round((b.x1 - b.x0) / (t * 1.1)));
  for (let k = 0; k < n; k++) {
    const x = cx + signedHash(b.seed, k, 2) * (b.x1 - b.x0) * 0.36;
    const y = cy + signedHash(b.seed, k, 3) * (b.y1 - b.y0) * 0.3;
    const r = t * (0.08 + 0.07 * sinHash(b.seed, k, 4));
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.3);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r * 1.3);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fillStyle = colour ? trio.hex : PALETTE.rockDark;
    ctx.fill();
    ctx.strokeStyle = rgba(colour ? trio.rim : PALETTE.sparkDim, 0.8);
    ctx.lineWidth = Math.max(1, t * 0.03);
    ctx.stroke();
    if (colour) halo(ctx, x, y, r * 3, trio.hex, 0.35 + 0.15 * Math.sin(look.time * 3 + k));
  }
}

/** The crack's line, white-hot and throbbing on the beat: where the beam must go down. */
function drawCrack(ctx: CanvasRenderingContext2D, b: PieceBox, look: PieceLook): void {
  const t = look.tile;
  const pts = crackPoints(b, t);
  const line = new Path2D();
  for (const [i, q] of pts.entries()) {
    if (i === 0) line.moveTo(q.x, q.y);
    else line.lineTo(q.x, q.y);
  }
  const throb = 0.5 + 0.5 * Math.cos(look.beatPhase * Math.PI * 2);
  ctx.lineJoin = "miter";
  ctx.strokeStyle = rgba(PALETTE.text, 0.18 + 0.2 * throb);
  ctx.lineWidth = t * 0.28;
  ctx.stroke(line);
  ctx.strokeStyle = rgba(PALETTE.text, 0.95);
  ctx.lineWidth = Math.max(1.5, t * 0.07);
  ctx.stroke(line);
}

/** A whole piece, clipped to its own facets: body, pores, and the crack where this screen shows it. */
export function drawWholePiece(
  ctx: CanvasRenderingContext2D,
  b: PieceBox,
  look: PieceLook,
): Path2D {
  const pts = piecePoints(b, look.tile, b.heart);
  const path = polyPath(pts);
  paintBody(ctx, pts, look.tile, bodyHex(b, look));
  ctx.save();
  ctx.clip(path);
  if (!b.heart) drawPores(ctx, b, look);
  if (look.crack && look.lit) drawCrack(ctx, b, look);
  ctx.restore();
  return path;
}

/**
 * A cut piece: its two halves either side of the crack's jagged line, each
 * turned out about its foot by `f`, with the cut face of crystal in the gap —
 * in the colour it was cut in, on both screens, since the beam has said it.
 */
export function drawCutPiece(
  ctx: CanvasRenderingContext2D,
  b: PieceBox,
  look: PieceLook,
  f: Flight,
): void {
  const t = look.tile;
  const pts = piecePoints(b, t, b.heart);
  const crack = crackPoints(b, t);
  const trio = colorTrio(b.color);
  for (const side of [-1, 1]) {
    const far = side > 0 ? b.x1 + t : b.x0 - t;
    const half = [...crack, { x: far, y: b.y1 + t }, { x: far, y: b.y0 - t }];
    ctx.save();
    ctx.globalAlpha *= f.alpha;
    ctx.translate(b.crackX + side * f.open, b.y1 + f.drop);
    ctx.rotate(side * f.rot);
    ctx.scale(1 - 0.15 * f.turn, 1);
    ctx.translate(-b.crackX, -b.y1);
    ctx.save();
    ctx.clip(polyPath(half));
    paintBody(ctx, pts, t, b.heart ? trio.hex : PALETTE.rock);
    if (!b.heart) drawPores(ctx, b, { ...look, crystal: true, lit: true });
    ctx.restore();
    // The cut face, turned toward the pair as the half turns away.
    const w = t * (0.08 + 0.22 * f.turn);
    const face = [...crack, ...crack.map((q) => ({ x: q.x - side * w, y: q.y })).reverse()];
    const g = ctx.createLinearGradient(b.crackX, b.y0, b.crackX - side * w, b.y1);
    g.addColorStop(0, trio.rim);
    g.addColorStop(1, trio.hex);
    ctx.fillStyle = g;
    ctx.fill(polyPath(face));
    ctx.strokeStyle = rgba(PALETTE.text, 0.7);
    ctx.lineWidth = Math.max(1, t * 0.03);
    for (let k = 1; k < crack.length - 1; k += 2) {
      const q = crack[k] as At;
      ctx.beginPath();
      ctx.moveTo(q.x, q.y);
      ctx.lineTo(q.x - side * w, q.y + t * 0.12);
      ctx.stroke();
    }
    ctx.restore();
  }
  const glow = f.alpha * (0.25 + 0.5 * Math.max(0, 1 - b.cut));
  halo(ctx, b.crackX, (b.y0 + b.y1) / 2, t * 1.4, trio.hex, glow);
}

/** The rind the heart was cut out of: a hollow of stone lined with grey crystal, falling away at the last. */
export function drawHusk(
  ctx: CanvasRenderingContext2D,
  h: HuskBox,
  tile: number,
  f: Flight,
): Path2D {
  const pts = piecePoints(h, tile);
  ctx.save();
  ctx.globalAlpha *= f.alpha;
  ctx.translate(0, f.drop);
  paintBody(ctx, pts, tile, PALETTE.rock);
  const cx = (h.x0 + h.x1) / 2;
  const cy = (h.y0 + h.y1) / 2;
  const hollow = pts.map((q) => ({ x: cx + (q.x - cx) * 0.6, y: cy + (q.y - cy) * 0.6 }));
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(polyPath(hollow));
  ctx.fillStyle = PALETTE.sparkDim;
  hollow.forEach((q, k) => {
    if (k % 2 === 1) return;
    const r = tile * 0.12;
    ctx.beginPath();
    ctx.moveTo(q.x, q.y);
    ctx.lineTo(q.x + (cx - q.x) * 0.25 - r * 0.5, q.y + (cy - q.y) * 0.25);
    ctx.lineTo(q.x + (cx - q.x) * 0.25 + r * 0.5, q.y + (cy - q.y) * 0.25);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
  return polyPath(pts);
}
