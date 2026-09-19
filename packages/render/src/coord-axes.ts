import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE NAMES ON THE LATTICE: what a column and a row are called, and the two
 * axes that write them on the field.
 *
 * Cut out of `coord-grid.ts` on 17 September 2026, when the axes learned to
 * move out from under a rehearsal's plate and took that file past its line
 * ceiling. The seam is the obvious one and was always there: next door is the
 * lattice — lines, crossings, and whether it is up at all — and here is what
 * the pair *says*, which is the half of it that has to be one right answer per
 * tile because two people are saying it out loud across a voice delay.
 */

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
 * The number a column is called out loud, 1 at the left wall.
 *
 * `rowLabel`'s argument sideways, and it is here beside it so that the two
 * halves of "people count from one" are one decision rather than two. The pair
 * has said "column four" since the first act and nothing drew it until THE
 * WELL, whose clock face carries a number per lane (`well-face.ts`) — and a
 * picture that wrote `3` over the lane both of them call four would be worse
 * than no number at all.
 *
 * Not `colLabel` above, which is the *lattice's* naming and answers a different
 * question: letters across and numbers down is what a pair needs when a body
 * has to be named by tile, and there is exactly one wave of that (THE WISP).
 * Everywhere else a column is a number, and this is that number.
 */
export function colNumber(col: number): string {
  return String(col + 1);
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
 * over the top edge of the field — the seat pills and the comms siren across
 * the top middle (`siren.ts` starts 24 px from the top and is 30 across) —
 * so a letter drawn on the grid's own top edge came out *behind* them, and
 * the columns under the cluster had no readable label at all. A whole tile
 * lower clears every one of them, and a letter sitting on
 * the line under its own column is where a board writes one anyway.
 */
export function drawAxes(ctx: CanvasRenderingContext2D, l: Layout, shown: number): void {
  const size = Math.max(7, Math.min(11, l.tile * 0.3));
  ctx.font = `${Math.round(size)}px "Courier New",monospace`;
  ctx.fillStyle = PALETTE.dim;
  ctx.globalAlpha = shown * 0.55;

  // A whole font size above the baseline is the ascent used for both: the caps
  // of a monospace digit reach about eight tenths of it, and the rest is the
  // breath that keeps a letter off the line above it.
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  const ly = l.gridTop + l.tile - size * 0.3;
  for (let c = 0; c < l.cols; c++) {
    ctx.fillText(colLabel(c), l.gridLeft + (c + 0.5) * l.tile, ly);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let r = 0; r < l.rows; r++) {
    const y = l.gridTop + (r + 0.5) * l.tile;
    ctx.fillText(rowLabel(r), l.gridLeft + size * 0.3, y);
  }

  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 1;
}
