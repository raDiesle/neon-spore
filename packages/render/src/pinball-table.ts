import type { PinballState, SimConfig } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * PINBALL's table: where it sits on the stage, and the case it is played
 * inside.
 *
 * **The frame is thick on purpose.** A round is drawn out of slabs and glyphs
 * rather than blobs (`docs/spec/interludes.md`), and this is the one boss
 * where the pair spend ninety seconds watching something bounce *off the
 * edges* — a hairline border would be a wall the eye has to infer from the
 * ball's behaviour. So the table is a case with a real bezel and a lit inner
 * lip, and the playfield sits inside it the way a pinball table sits in its
 * cabinet.
 *
 * What stands *on* the table is `pinball-piece.ts`, the bucket at the floor of
 * it is `pinball-bucket.ts`, and the line out of that bucket is
 * `pinball-aim.ts`. This file is the box and the ball.
 *
 * Stateless like every other draw: everything is read off the world, so
 * nothing outlives a frame and `Effects.reset` has none of it to lose.
 */

/** Where the table is on the stage, and how big one of its tiles is. */
export interface Table {
  x: number;
  y: number;
  tile: number;
  cols: number;
  rows: number;
}

/** How thick the cabinet is, as a share of a tile. */
const BEZEL_TILES = 0.42;

/**
 * The table, centred in the play half and leaving room for its own case. Whole
 * pixels are not asked for — nothing on this table is counted along, which is
 * exactly what makes it different from SNAKE's arena next door.
 *
 * **The width is 0.88 of the stage and not 0.94**, which is the gutter the
 * power bar stands in (`pinball-aim.ts`). A bar drawn over the playfield would
 * be a dial on top of the board it is about; a table narrow enough to have a
 * margin can put it beside one.
 */
export function pinTable(l: Layout, cfg: SimConfig): Table {
  const bezel = 2 * BEZEL_TILES;
  const tile = Math.max(
    1,
    Math.min(
      (l.width * 0.88) / (cfg.pinballCols + bezel),
      (l.playHeight * 0.78) / (cfg.pinballRows + bezel),
    ),
  );
  const w = tile * cfg.pinballCols;
  const h = tile * cfg.pinballRows;
  return {
    x: (l.width - w) / 2,
    y: l.playHeight * 0.56 - h / 2,
    tile,
    cols: cfg.pinballCols,
    rows: cfg.pinballRows,
  };
}

/** A point in thousandths of a tile, in stage pixels. */
export function pinAt(t: Table, xMilli: number, yMilli: number): { x: number; y: number } {
  return { x: t.x + (xMilli * t.tile) / 1000, y: t.y + (yMilli * t.tile) / 1000 };
}

/**
 * The cabinet: a heavy bezel with a lit inner lip, and the floor drawn as a
 * broken line because it is the one edge that is not a wall.
 */
export function drawPinCase(ctx: CanvasRenderingContext2D, t: Table): void {
  const w = t.tile * t.cols;
  const h = t.tile * t.rows;
  const bezel = t.tile * BEZEL_TILES;

  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(t.x - bezel, t.y - bezel, w + bezel * 2, h + bezel * 2);
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = bezel;
  ctx.strokeRect(t.x - bezel / 2, t.y - bezel / 2, w + bezel, h + bezel);
  // Three sides only. The floor is the way out and the eye should be told so
  // before the first ball goes down it rather than after. The lip carries the
  // hull's own glow, so the wall the ball banks off is a lit edge rather than
  // a hairline.
  const lip = new Path2D();
  lip.moveTo(t.x, t.y + h);
  lip.lineTo(t.x, t.y);
  lip.lineTo(t.x + w, t.y);
  lip.lineTo(t.x + w, t.y + h);
  ctx.save();
  strokeGlow(ctx, lip, PALETTE.hullRim, Math.max(1, t.tile * 0.05), 0.7);
  ctx.restore();
  ctx.setLineDash([t.tile * 0.28, t.tile * 0.28]);
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = Math.max(1, t.tile * 0.05);
  ctx.beginPath();
  ctx.moveTo(t.x, t.y + h);
  ctx.lineTo(t.x + w, t.y + h);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** The ball. Steel, and the only round thing here that is not a cell. */
export function drawPinBall(
  ctx: CanvasRenderingContext2D,
  t: Table,
  state: PinballState,
  ballMilli: number,
): void {
  const r = (ballMilli * t.tile) / 1000;
  const at = pinAt(t, state.ball.xMilli, state.ball.yMilli);
  halo(ctx, at.x, at.y, r * 2.4, PALETTE.text, 0.35);
  ctx.fillStyle = PALETTE.rock;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = Math.max(1, t.tile * 0.04);
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.arc(at.x - r * 0.32, at.y - r * 0.36, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
