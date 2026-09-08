import type { PinballState, SimConfig } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * PINBALL's table: where it sits on the stage, and the ball that travels it.
 *
 * **There is no case any more, and that is the whole of this file's history.**
 * The table used to stand in a thick violet cabinet with a lit inner lip,
 * centred in 88% of the stage so a power bar had a gutter to live in. The owner
 * looked at it and asked for the opposite: *remove this purple borders, and
 * make the game area the full available size*. He is right. A bezel is a second
 * frame drawn inside the one the phone already has, and every pixel it takes is
 * a pixel of the board the pair are arguing about.
 *
 * So the table is exactly the field: the same eleven columns, at the same tile,
 * starting where the grid starts and **ending on the hull's own surface**. The
 * walls a ball banks off are the walls the ship has always had, the floor is
 * the ship, and there is nothing between them to draw. That the two fit without
 * a remainder is not luck — `pinballCols` is `cols` and `pinballRows` is one
 * less than `rows`, which is the hull's row — but it is not assumed either:
 * the tile below is the smaller of the two fits, so a config that pulled them
 * apart shrinks the table rather than pushing it off the screen.
 *
 * What stands *on* the table is `pinball-piece.ts`, the line out of the cannon
 * is `pinball-aim.ts`, and what happens when a ball is missed is
 * `pinball-blast.ts`. This file is the frame and the ball.
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

/**
 * The table, over the field it has replaced.
 *
 * The floor is pinned to `l.hullY` — the row a creature dies on, and therefore
 * the line the ship's skin is drawn along. A ball that reaches the bottom of
 * this table has reached the ship, which is what the round says happens.
 */
export function pinTable(l: Layout, cfg: SimConfig): Table {
  const height = Math.max(1, l.hullY - l.gridTop);
  const tile = Math.max(1, Math.min(l.gridWidth / cfg.pinballCols, height / cfg.pinballRows));
  return {
    x: l.gridLeft + (l.gridWidth - tile * cfg.pinballCols) / 2,
    y: l.hullY - tile * cfg.pinballRows,
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
 * The two side walls, as the faintest possible line.
 *
 * Not a frame: the ball genuinely bounces off the edges of the field and the
 * eye has to be told that once, before the first bank rather than after it. A
 * hairline in the grid's own colour is as much as that costs — the ceiling gets
 * one too, and the floor gets none, because the floor is the ship and the ship
 * is drawn.
 */
export function drawPinWalls(ctx: CanvasRenderingContext2D, t: Table): void {
  const w = t.tile * t.cols;
  const h = t.tile * t.rows;
  ctx.save();
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = Math.max(1, t.tile * 0.03);
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.moveTo(t.x + 0.5, t.y + h);
  ctx.lineTo(t.x + 0.5, t.y);
  ctx.lineTo(t.x + w - 0.5, t.y);
  ctx.lineTo(t.x + w - 0.5, t.y + h);
  ctx.stroke();
  ctx.restore();
}

/** The ball. Steel, and the only round thing here that is not a body. */
export function drawPinBall(
  ctx: CanvasRenderingContext2D,
  t: Table,
  state: PinballState,
  ballMilli: number,
): void {
  const r = (ballMilli * t.tile) / 1000;
  const at = pinAt(t, state.ball.xMilli, state.ball.yMilli);
  drawBall(ctx, t, at.x, at.y, r, 0.35);
}

/**
 * The ball waiting in the muzzle, between shots.
 *
 * Drawn at all because the round's whole sentence is that the thing you fire
 * from is the thing you catch with, and a cannon with nothing in it while the
 * pair argue about an angle says the opposite.
 */
export function drawPinResting(
  ctx: CanvasRenderingContext2D,
  t: Table,
  x: number,
  y: number,
  ballMilli: number,
): void {
  drawBall(ctx, t, x, y, (ballMilli * t.tile) / 1000, 0.28);
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  t: Table,
  x: number,
  y: number,
  r: number,
  glow: number,
): void {
  halo(ctx, x, y, r * 2.4, PALETTE.text, glow);
  ctx.fillStyle = PALETTE.rock;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = Math.max(1, t.tile * 0.04);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.36, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
