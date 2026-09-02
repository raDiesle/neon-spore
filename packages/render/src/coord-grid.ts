import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE COORDINATE GRID: the tile lattice and its two axes, up only while
 * something on the field has to be named by tile rather than by column.
 *
 * The lattice itself is old. `field.ts` has carried it since the field was
 * first drawn, switched off behind a constant, under a comment saying to flip
 * it back on "when a mechanic needs a player to call out a square — a shot
 * aimed at a column *and* a row". THE WISP is that mechanic (`sim/wisp.ts`):
 * one seat can see the body and the other holds the cannon, and the body is
 * somewhere else every two beats, so there is nothing to say about it except
 * where it is standing.
 *
 * **It is on for both seats and off the rest of the time.** Both, because the
 * one who reads the letter and the one who has to put a cannon on it are
 * different people and a grid on one screen would be half a vocabulary. Off
 * the rest of the time, because that is exactly what was wrong with it before:
 * a lattice behind every wave is a texture competing with the silhouettes, and
 * the pair learns to stop seeing it — at which point it is no use on the one
 * wave it is needed.
 *
 * **And it is quiet.** The version that was switched off pulsed hard on every
 * beat: the lines went from 0.07 to 0.37 alpha and the crossing points from
 * 0.18 to 0.68, over the whole screen, four times a bar. That is a lot of
 * flashing to put behind a body somebody is trying to read a letter off, and
 * the owner asked for it toned down. The beat is still in here — a grid that
 * did not breathe would read as a dead overlay — but it is a tenth of what it
 * was, and the axes barely move at all. The beat has three louder voices
 * already: the sweep, the HUD's dots and the click track.
 */

/**
 * How long the grid takes to go, in seconds. It does not take that long to
 * arrive: it snaps.
 *
 * **Up on the instant, down over half a second, and the asymmetry is the
 * point.** A wisp materialising *is* the event that says "this wave is about
 * tiles", so the grid belongs to that instant rather than easing in beside it
 * — and a grid that faded in would be at a tenth of its opacity for the first
 * hop, which is the one the pair most needs it for. Going is the opposite: the
 * last wisp dying is a thing the pair did, and a lattice that vanished on the
 * same frame as the body would read as part of the kill.
 *
 * It is also what makes the thing photographable. `tools/frames` drives the
 * loop with `advance` and then paints **once**, so anything eased on `dt`
 * comes out at one sixtieth of a second's worth of itself — a grid that faded
 * in over half a second would be invisible in every picture ever taken of the
 * creature it belongs to.
 */
const FADE_SECONDS = 0.5;

/**
 * Whether the grid is up, as render state.
 *
 * It lives in `Effects` and is cleared by `Effects.reset()`, because it is the
 * one thing here that outlives a frame — see the rule in CLAUDE.md and
 * `render/test/restart.test.ts`, which is what enforces it. A wave restarting
 * with the grid half-faded would carry the previous run's opacity into the new
 * one's first frame.
 */
export class CoordGrid {
  private fade = 0;

  /** 0 while nothing needs a tile named, 1 while something does. */
  get shown(): number {
    return this.fade;
  }

  update(dt: number, on: boolean): void {
    this.fade = on ? 1 : Math.max(0, this.fade - dt / FADE_SECONDS);
  }

  clear(): void {
    this.fade = 0;
  }
}

/**
 * The letter a column is called, A first. Exported so a guide, a tool or a
 * test says the same word the field does rather than spelling the arithmetic
 * out again — the pair says these out loud, so there is exactly one right
 * answer per column and it must not be derived twice.
 *
 * Past the twenty-sixth column it doubles up (AA, AB), which no field the game
 * ships gets near; it is here so the function is total rather than so the case
 * is used.
 */
export function colLabel(col: number): string {
  let label = "";
  for (let n = col; ; n = Math.floor(n / 26) - 1) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    if (n < 26) return label;
  }
}

/**
 * The number a row is called, 1 at the top and rising toward the ship.
 *
 * **Down, not up, and it is not chess's convention.** A chessboard counts
 * ranks up from the near player. This field is not symmetrical: everything on
 * it falls, and the number a pair actually wants is *how close is it*, which
 * has to grow as the thing gets nearer. It is also the simulation's own `row`
 * plus one, so a tile said out loud and a tile in the world are the same
 * number displaced by nothing but the fact that people count from one.
 */
export function rowLabel(row: number): string {
  return String(row + 1);
}

/**
 * The lattice, the crossings and the two axes, at `shown` opacity.
 *
 * `flash` is the beat, 1 on it and decayed to 0 before the next — the same
 * number every other beat-lit thing in the frame reads, so the grid breathes
 * with them rather than on a clock of its own.
 */
export function drawCoordGrid(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  flash: number,
  shown: number,
): void {
  if (shown <= 0.01 || l.tile <= 0) return;
  ctx.save();

  // A tenth of the pulse the retired version carried, and the base only a
  // little brighter: what a player has to be able to do here is find the line
  // between two columns, which wants contrast rather than movement.
  ctx.strokeStyle = PALETTE.grid;
  ctx.globalAlpha = shown * (0.5 + 0.12 * flash);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 0; c <= l.cols; c++) {
    const x = l.gridLeft + c * l.tile;
    ctx.moveTo(x, l.gridTop);
    ctx.lineTo(x, l.gridTop + l.gridHeight);
  }
  for (let r = 0; r <= l.rows; r++) {
    const y = l.gridTop + r * l.tile;
    ctx.moveTo(l.gridLeft, y);
    ctx.lineTo(l.gridLeft + l.gridWidth, y);
  }
  ctx.stroke();

  // The crossings are what an eye actually snaps to when it is counting
  // columns, so they keep a little more of the beat than the lines do.
  ctx.fillStyle = PALETTE.gridBeat;
  ctx.globalAlpha = shown * (0.5 + 0.3 * flash);
  const s = 1.4 + 0.8 * flash;
  for (let c = 0; c <= l.cols; c++) {
    for (let r = 0; r <= l.rows; r++) {
      ctx.fillRect(l.gridLeft + c * l.tile - s / 2, l.gridTop + r * l.tile - s / 2, s, s);
    }
  }

  drawAxes(ctx, l, shown);
  ctx.restore();
}

/**
 * The letters across and the numbers down.
 *
 * **Quieter than the lattice, on purpose and against the obvious instinct.**
 * They are the part that carries the words, so the first draft had them
 * brightest — and a column of characters running the whole height of a phone
 * at full strength is a second thing to read on a screen whose whole job is
 * the bodies. They only ever have to be legible on the one glance somebody
 * takes to convert a tile into a word, and a player who is already saying
 * "E nine" is not looking at them at all.
 *
 * Both axes sit *inside* the field rather than in a margin: the stage is as
 * wide as the columns (`computeStage`), so there is no margin to put them in,
 * and a label in the corner of its own tile is where a board game puts one
 * anyway. They do not pulse. The beat is not what they are for.
 *
 * **The letters hang at the *foot* of the first row, not at its head**, and
 * that is a defect repaired rather than a preference. The HUD reaches down
 * over the top edge of the field — the beat dots on the left, the seat pills
 * and the comms siren on the right (`siren.ts` starts 24 px from the top and
 * is 30 across) — so a letter drawn on the grid's own top edge came out
 * *behind* them, and the three right-hand columns had no readable label at
 * all. A whole tile lower clears every one of them, and a letter sitting on
 * the line under its own column is where a board writes one anyway.
 */
function drawAxes(ctx: CanvasRenderingContext2D, l: Layout, shown: number): void {
  const size = Math.max(7, Math.min(11, l.tile * 0.3));
  ctx.font = `${Math.round(size)}px "Courier New",monospace`;
  ctx.fillStyle = PALETTE.dim;
  ctx.globalAlpha = shown * 0.55;

  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  for (let c = 0; c < l.cols; c++) {
    ctx.fillText(colLabel(c), l.gridLeft + (c + 0.5) * l.tile, l.gridTop + l.tile - size * 0.3);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let r = 0; r < l.rows; r++) {
    ctx.fillText(rowLabel(r), l.gridLeft + size * 0.3, l.gridTop + (r + 0.5) * l.tile);
  }

  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 1;
}
