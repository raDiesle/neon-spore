import type { PinballState, PinPiece, SimConfig } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * PINBALL's table: the frame it is played inside, and everything standing on
 * it.
 *
 * **The frame is thick on purpose.** A round is drawn out of slabs and glyphs
 * rather than blobs (`docs/spec/interludes.md`), and this is the one boss
 * where the pair spend ninety seconds watching something bounce *off the
 * edges* — a hairline border would be a wall the eye has to infer from the
 * ball's behaviour. So the table is a machined case with a real bezel, and the
 * playfield sits inside it the way a pinball table sits in its cabinet.
 *
 * **The colours are the ones the game already owns.** Plain pieces are the
 * shield's cyan, targets are `pod` amber — which is what this game has always
 * meant by "here, this is the thing" — and a piece the ball has touched this
 * shot burns to `good` green until the shot ends and it goes. The ball is
 * `rock`, because a steel ball is the one thing on this table that is not the
 * ship and not a target. Nothing here invents a colour.
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
 */
export function pinTable(l: Layout, cfg: SimConfig): Table {
  const bezel = 2 * BEZEL_TILES;
  const tile = Math.max(
    1,
    Math.min(
      (l.width * 0.94) / (cfg.pinballCols + bezel),
      (l.playHeight * 0.86) / (cfg.pinballRows + bezel),
    ),
  );
  const w = tile * cfg.pinballCols;
  const h = tile * cfg.pinballRows;
  return {
    x: (l.width - w) / 2,
    y: l.playHeight * 0.52 - h / 2,
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
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = Math.max(1, t.tile * 0.05);
  // Three sides only. The floor is the way out and the eye should be told so
  // before the first ball goes down it rather than after.
  ctx.beginPath();
  ctx.moveTo(t.x, t.y + h);
  ctx.lineTo(t.x, t.y);
  ctx.lineTo(t.x + w, t.y);
  ctx.lineTo(t.x + w, t.y + h);
  ctx.stroke();
  ctx.setLineDash([t.tile * 0.28, t.tile * 0.28]);
  ctx.strokeStyle = PALETTE.dim;
  ctx.beginPath();
  ctx.moveTo(t.x, t.y + h);
  ctx.lineTo(t.x + w, t.y + h);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** Everything still standing, with what this shot has touched burning. */
export function drawPinPieces(ctx: CanvasRenderingContext2D, t: Table, state: PinballState): void {
  for (let i = 0; i < state.pieces.length; i++) {
    const piece = state.pieces[i];
    if (piece === undefined || state.alive[i] !== true) continue;
    drawPiece(ctx, t, piece, state.lit.includes(i));
  }
}

function drawPiece(ctx: CanvasRenderingContext2D, t: Table, piece: PinPiece, lit: boolean): void {
  const at = pinAt(t, piece.xMilli, piece.yMilli);
  const body = lit ? PALETTE.good : piece.target ? PALETTE.pod : PALETTE.shield;
  const rim = lit ? PALETTE.goodRim : piece.target ? PALETTE.podRim : PALETTE.shieldRim;
  ctx.fillStyle = body;
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(1, t.tile * 0.045);
  if (piece.kind === "peg") {
    const r = (piece.wMilli * t.tile) / 1000;
    ctx.beginPath();
    ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // The one highlight, up and to the left, so a field of pegs reads as
    // spheres rather than as discs. The same light every body on the field
    // is lit by (`key-light.ts`).
    ctx.fillStyle = PALETTE.text;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(at.x - r * 0.3, at.y - r * 0.34, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }
  const w = (piece.wMilli * 2 * t.tile) / 1000;
  const h = (piece.hMilli * 2 * t.tile) / 1000;
  const r = Math.min(h / 2, t.tile * 0.14);
  ctx.beginPath();
  ctx.roundRect(at.x - w / 2, at.y - h / 2, w, h, r);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.roundRect(at.x - w / 2 + h * 0.25, at.y - h / 2 + h * 0.18, w - h * 0.5, h * 0.22, h * 0.11);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** The ball. Steel, and the only round thing here that is not a peg. */
export function drawPinBall(
  ctx: CanvasRenderingContext2D,
  t: Table,
  state: PinballState,
  ballMilli: number,
): void {
  const cfg = { r: (ballMilli * t.tile) / 1000 };
  const at = pinAt(t, state.ball.xMilli, state.ball.yMilli);
  ctx.fillStyle = PALETTE.rock;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = Math.max(1, t.tile * 0.04);
  ctx.beginPath();
  ctx.arc(at.x, at.y, cfg.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.arc(at.x - cfg.r * 0.32, at.y - cfg.r * 0.36, cfg.r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * The bucket, at the floor — the hull and the cannon folded into one thing,
 * which is why it is drawn in the hull's violet with the cannon's mouth in it.
 */
export function drawPinBucket(
  ctx: CanvasRenderingContext2D,
  t: Table,
  state: PinballState,
  halfMilli: number,
  flash: number,
): void {
  const at = pinAt(t, state.bucketMilli, t.rows * 1000);
  const half = (halfMilli * t.tile) / 1000;
  const lip = t.tile * 0.62;
  ctx.strokeStyle = flash > 0 ? PALETTE.red : PALETTE.hullRim;
  ctx.fillStyle = PALETTE.hull;
  ctx.lineWidth = Math.max(1.5, t.tile * 0.08);
  ctx.beginPath();
  ctx.moveTo(at.x - half, at.y - lip);
  ctx.lineTo(at.x - half * 0.62, at.y);
  ctx.lineTo(at.x + half * 0.62, at.y);
  ctx.lineTo(at.x + half, at.y - lip);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // The mouth: where the ball comes out and where it has to come back in.
  ctx.fillStyle = flash > 0 ? PALETTE.red : PALETTE.pod;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.roundRect(at.x - half * 0.7, at.y - lip - t.tile * 0.1, half * 1.4, t.tile * 0.16, 3);
  ctx.fill();
  ctx.globalAlpha = 1;
}
