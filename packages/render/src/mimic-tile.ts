import { mimicShapeAt, mimicShapeSize } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **One square of THE MIMIC's board**, and **the same square on every
 * level** — the owner, 5 October 2026: *the visual of tiles should always be
 * the same for every level and should not have an arrow*. One colour, the
 * mantle's pale sign light, and no face: the shield's and the maw's faces the
 * first cut carried read as arrows, and went with THE THROAT's panel.
 *
 * - `wanted` — a square the picture wants and nobody has painted: faint, on
 *   the reader's screen only.
 * - `paint` — painted, as the painter sees it: solid, and nothing more.
 * - `right`, `wrong` — painted, as the reader sees it: solid, with a tick in
 *   the good green, or crossed through in the hull's red over a dark edge.
 */
export type TileLook = "wanted" | "paint" | "right" | "wrong";

/** How far a square stands in from its tile's edge, and its corners, in tiles. */
const INSET = 0.1;
const ROUND = 0.16;

export function drawMimicTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  paint: number,
  look: TileLook,
): void {
  if (paint === 0) return;
  const half = tile * (0.5 - INSET);
  const square = new Path2D();
  square.roundRect(x - half, y - half, half * 2, half * 2, tile * ROUND);
  ctx.lineWidth = STROKE.outline;
  if (look === "wanted") {
    ctx.fillStyle = rgba(PALETTE.mimicSign, 0.22);
    ctx.fill(square);
    ctx.setLineDash([tile * 0.12, tile * 0.09]);
    ctx.strokeStyle = rgba(PALETTE.mimicSign, 0.85);
    ctx.stroke(square);
    ctx.setLineDash([]);
    return;
  }
  ctx.fillStyle = PALETTE.mimicSign;
  ctx.fill(square);
  ctx.strokeStyle = PALETTE.mimicSkinDark;
  ctx.stroke(square);
  if (look === "right") drawTick(ctx, x, y, half);
  if (look === "wrong") drawCross(ctx, x, y, half);
}

/** Stroke `path` twice: a dark edge under, then the colour. */
function marked(ctx: CanvasRenderingContext2D, path: Path2D, hex: string, width: number): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = width * 2.2;
  ctx.strokeStyle = "rgba(4,8,20,.85)";
  ctx.stroke(path);
  ctx.lineWidth = width;
  ctx.strokeStyle = hex;
  ctx.stroke(path);
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
}

function drawTick(ctx: CanvasRenderingContext2D, x: number, y: number, half: number): void {
  const tick = new Path2D();
  tick.moveTo(x - half * 0.55, y + half * 0.02);
  tick.lineTo(x - half * 0.12, y + half * 0.45);
  tick.lineTo(x + half * 0.6, y - half * 0.45);
  marked(ctx, tick, PALETTE.good, Math.max(2, half * 0.22));
}

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, half: number): void {
  const k = half * 0.6;
  const cross = new Path2D();
  cross.moveTo(x - k, y - k);
  cross.lineTo(x + k, y + k);
  cross.moveTo(x + k, y - k);
  cross.lineTo(x - k, y + k);
  marked(ctx, cross, PALETTE.red, Math.max(2, half * 0.24));
}

/** A whole picture, `cell` pixels to a square, centred on (`x`, `y`) — the scrap a peel carries. */
export function drawMimicPicture(
  ctx: CanvasRenderingContext2D,
  sign: number,
  x: number,
  y: number,
  cell: number,
): void {
  const { w, h } = mimicShapeSize(sign);
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      const paint = mimicShapeAt(sign, dc, dr);
      if (paint === 0) continue;
      const cx = x + (dc - (w - 1) / 2) * cell;
      const cy = y + (dr - (h - 1) / 2) * cell;
      drawMimicTile(ctx, cx, cy, cell, paint, "paint");
    }
  }
}
