import { type FleetState, fleetBeatsLeft, fleetCols, fleetRows, type World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE FLEET's chart: the lattice of squares the whole fight is named against.
 *
 * **This is the tile grid, switched on.** `field.ts` carries the lattice
 * `docs/spec/systems.md` 5.8 asks for and holds it off behind
 * `SHOW_TILE_GRID`, with a comment saying to flip it back on "when a mechanic
 * needs a player to call out a square". This is that mechanic, and it is drawn
 * here rather than by turning that flag on for the whole game: the chart is
 * one boss's picture, it covers only the rows the ships are in, and it carries
 * an axis the ordinary field has no use for.
 *
 * **A chart square is a field tile.** Same width, same rows, same origin — so
 * the columns the pair name here are the columns they have named all evening,
 * and nothing on this screen is a second coordinate system laid over the
 * first.
 *
 * The letters and the numbers are the point. Every other announcement in this
 * game is a column counted from the edge; a fight over a hundred squares needs
 * a name that survives being said once, and A-to-K by 1-to-10 is the one every
 * player already knows.
 */

/** Where the chart is on screen. Derived per frame — it is only arithmetic. */
export interface Chart {
  left: number;
  top: number;
  tile: number;
  cols: number;
  rows: number;
}

export function chartOf(l: Layout, world: World): Chart {
  return {
    left: l.gridLeft,
    top: l.gridTop,
    tile: l.tile,
    cols: fleetCols(world.cfg),
    rows: fleetRows(world.cfg),
  };
}

/** The centre of a square, across. */
export function chartX(c: Chart, col: number): number {
  return c.left + col * c.tile + c.tile / 2;
}

/** The centre of a square, down. */
export function chartY(c: Chart, row: number): number {
  return c.top + row * c.tile + c.tile / 2;
}

/**
 * A column's name. A..K across eleven columns, and `String.fromCharCode` past
 * Z is nothing a chart this size can reach — the field would need
 * twenty-seven columns before it did.
 */
function chartColName(col: number): string {
  return String.fromCharCode(65 + col);
}

/** A row's name. One-based, because nobody says "row zero" out loud. */
function chartRowName(row: number): string {
  return String(row + 1);
}

/** A square, as the pair says it. The one place the two halves are joined. */
export function chartSquareName(col: number, row: number): string {
  return `${chartColName(col)}${chartRowName(row)}`;
}

/** How wide the gutter carrying the row numbers is. */
function gutter(c: Chart): number {
  return Math.max(9, c.tile * 0.34);
}

/**
 * The chart, drawn: the water, the lattice, the frame and the axis.
 *
 * The lattice pulses on the beat exactly as the field's own would have, and
 * for the reason 5.8 gives — the pulse is the one thing both players share
 * across a voice delay, so a pair counting squares to each other is counting
 * them in time.
 */
export function drawFleetChart(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  boss: FleetState,
  beatPhase: number,
): void {
  // Loud on the beat and gone well before the next one. Derived from the
  // phase rather than handed down, because this is the only lattice in the
  // game that is drawn per boss and the field's own `flash` belongs to a pass
  // this one is not part of (`field.ts`).
  const flash = Math.max(0, 1 - beatPhase * 4);
  const c = chartOf(l, world);
  const w = c.cols * c.tile;
  const h = c.rows * c.tile;
  if (w <= 0 || h <= 0) return;

  ctx.save();
  // Deeper than the field behind it, so the chart reads as a thing standing on
  // the water rather than as a pattern printed on it.
  ctx.fillStyle = "rgba(4,8,20,.72)";
  ctx.fillRect(c.left, c.top, w, h);

  ctx.strokeStyle = `rgba(47,224,240,${0.1 + 0.16 * flash})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let col = 0; col <= c.cols; col++) {
    const x = c.left + col * c.tile;
    ctx.moveTo(x, c.top);
    ctx.lineTo(x, c.top + h);
  }
  for (let row = 0; row <= c.rows; row++) {
    const y = c.top + row * c.tile;
    ctx.moveTo(c.left, y);
    ctx.lineTo(c.left + w, y);
  }
  ctx.stroke();

  // The crossings carry the pulse more strongly than the lines, the same way
  // the field's lattice was written to.
  ctx.fillStyle = `rgba(47,224,240,${0.16 + 0.44 * flash})`;
  const s = 1.2 + 1.4 * flash;
  for (let col = 0; col <= c.cols; col++) {
    for (let row = 0; row <= c.rows; row++) {
      ctx.fillRect(c.left + col * c.tile - s / 2, c.top + row * c.tile - s / 2, s, s);
    }
  }

  ctx.strokeStyle = PALETTE.shield;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(c.left + 0.75, c.top + 0.75, w - 1.5, h - 1.5);
  ctx.globalAlpha = 1;

  drawAxis(ctx, c);
  drawClock(ctx, c, world, boss);
  ctx.restore();
}

/**
 * The letters and the numbers.
 *
 * The letters go in the water under the chart, where there is nothing else;
 * the numbers go in a gutter inside the left edge, because the stage is
 * exactly as wide as the columns and there is no outside to put them in
 * (`computeStage`). The gutter carries its own dark band so a digit never has
 * to be read off a square that has a hull under it.
 */
function drawAxis(ctx: CanvasRenderingContext2D, c: Chart): void {
  const g = gutter(c);
  const h = c.rows * c.tile;
  ctx.fillStyle = "rgba(4,8,20,.8)";
  ctx.fillRect(c.left, c.top, g, h);

  ctx.font = `700 ${Math.max(7, Math.round(c.tile * 0.32))}px "Courier New",monospace`;
  ctx.fillStyle = PALETTE.dim;
  ctx.textAlign = "center";
  for (let row = 0; row < c.rows; row++) {
    ctx.fillText(chartRowName(row), c.left + g / 2, chartY(c, row) + 3);
  }
  const y = c.top + h + Math.max(9, c.tile * 0.42);
  for (let col = 0; col < c.cols; col++) {
    ctx.fillText(chartColName(col), chartX(c, col), y);
  }
}

/**
 * How long is left, as a bar under the letters rather than as a number.
 *
 * A count of beats is a thing one of them would read out, and this fight has
 * enough to say already. A bar draining across the whole width of the chart is
 * read without being said — and it goes red for its last eighth, which is the
 * only warning the pair gets that the hull is about to pay for the round.
 */
function drawClock(ctx: CanvasRenderingContext2D, c: Chart, world: World, boss: FleetState): void {
  const total = Math.max(1, world.cfg.fleetRoundBeats);
  const left = fleetBeatsLeft(world, boss) / total;
  const w = c.cols * c.tile;
  const y = c.top + c.rows * c.tile + Math.max(13, c.tile * 0.6);
  const h = Math.max(2, c.tile * 0.09);
  ctx.fillStyle = "rgba(47,224,240,.14)";
  ctx.fillRect(c.left, y, w, h);
  ctx.fillStyle = left < 0.125 ? PALETTE.red : PALETTE.shield;
  ctx.fillRect(c.left, y, w * Math.max(0, Math.min(1, left)), h);
}
