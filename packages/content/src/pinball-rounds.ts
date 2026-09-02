import {
  DEFAULT_CONFIG,
  PIN_THIN_MILLI,
  type PinballRound,
  type PinPiece,
  type SimConfig,
} from "@neon-spore/sim";

/**
 * PINBALL's boards, one per round, **drawn rather than listed**.
 *
 * Every other authored boss in this game is a handful of numbers a person can
 * read down a page — three per snake round, four per ship. A peg table is
 * forty pieces, and forty rows of `{ kind, xMilli, yMilli, target }` is a
 * board nobody can see. So a board is written as the picture it is, eleven
 * characters wide, and the argument is `fleet-editor.ts`' exactly: where the
 * pieces are *is* the fight, and none of that is legible as a list.
 *
 * The parser below is twenty lines and it is the same grid the director paints
 * on, which is the second reason for the shape — one board format, read the
 * same way by the file a person edits and by the tool they edit it with.
 *
 * ```
 *   .  nothing        o  peg            O  target peg
 *   =  block          #  target block
 * ```
 *
 * **Only targets end a round.** Peggle's orange rule
 * ([bosses](../../../docs/spec/bosses.md) 11.7): the plain pieces still bounce
 * and still go, and a board cleared of its lit ones is a board finished.
 * Without it the round runs until the last peg in a corner happens to be
 * struck, which is a length nobody authored.
 */

/** Columns a board is drawn in. `cfg.pinballCols`, and a row of another width throws. */
export const PIN_COLS = 11;

/** Tiles of clear air above the first row of a board — the ceiling to bank off. */
const PIN_TOP_TILES = 1.5;

/**
 * How many rows a board may have before its lowest piece is standing in the
 * bucket's own lane, which `pinballFault` refuses.
 *
 * Derived rather than written down, because it follows from three numbers that
 * are all somebody's to turn — the table's height, the bucket's mouth and
 * where a board hangs from. The director's editor asks this for the size of
 * the grid it paints, so an author cannot draw a board the game would reject.
 */
export function pinBoardRows(cfg: SimConfig = DEFAULT_CONFIG): number {
  const floor = cfg.pinballRows - (cfg.pinballBucketMilli * 2) / 1000;
  return Math.max(1, Math.floor(floor - PIN_TOP_TILES - 0.5 - BLOCK_H_MILLI / 1000) + 1);
}

/** A peg's radius and a block's half-extents, in thousandths of a tile. */
const PEG_MILLI = 200;
const BLOCK_W_MILLI = 440;
const BLOCK_H_MILLI = 150;

/**
 * One board out of its picture. Row `r`, column `c` becomes the centre of tile
 * `(c + 0.5, r + PIN_TOP_TILES + 0.5)`, so a board hangs from the ceiling and
 * grows downward however many rows it is given — and `pinballFault` is what
 * says whether it has grown into the bucket's own lane.
 */
export function pinBoard(picture: string): PinPiece[] {
  const rows = picture
    .trim()
    .split("\n")
    .map((line) => line.trim());
  const pieces: PinPiece[] = [];
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? "";
    if (row.length !== PIN_COLS) {
      throw new Error(`a pinball row is ${row.length} wide, and a board is ${PIN_COLS}`);
    }
    for (let c = 0; c < PIN_COLS; c++) {
      const mark = row[c];
      if (mark === undefined || mark === ".") continue;
      const peg = mark === "o" || mark === "O";
      const block = mark === "=" || mark === "#";
      if (!peg && !block) throw new Error(`a pinball board has no mark "${mark}" in it`);
      pieces.push({
        kind: peg ? "peg" : "block",
        xMilli: c * 1000 + 500,
        yMilli: Math.round((r + PIN_TOP_TILES + 0.5) * 1000),
        wMilli: peg ? PEG_MILLI : BLOCK_W_MILLI,
        hMilli: peg ? PEG_MILLI : BLOCK_H_MILLI,
        target: mark === "O" || mark === "#",
      });
    }
  }
  if (PEG_MILLI < PIN_THIN_MILLI || BLOCK_H_MILLI < PIN_THIN_MILLI) {
    throw new Error("a pinball piece thinner than a ball can be stopped by");
  }
  return pieces;
}

/**
 * A board back into the picture it was drawn from — `pinBoard` run backwards.
 *
 * Here rather than in the director because the two have to agree about the
 * grid, and two files that must agree about a coordinate system are one file.
 * A piece that does not sit on the grid — hand-written, or left by an older
 * anchor — is dropped rather than rounded, and the editor says so by showing a
 * board with a hole in it instead of one quietly moved.
 */
export function pinPicture(pieces: readonly PinPiece[]): string {
  const rows = pinBoardRows();
  const grid: string[][] = [];
  for (let r = 0; r < rows; r++) grid.push(new Array(PIN_COLS).fill("."));
  for (const piece of pieces) {
    const c = (piece.xMilli - 500) / 1000;
    const r = piece.yMilli / 1000 - PIN_TOP_TILES - 0.5;
    if (!Number.isInteger(c) || !Number.isInteger(r)) continue;
    if (c < 0 || c >= PIN_COLS || r < 0 || r >= rows) continue;
    const row = grid[r];
    if (row === undefined) continue;
    row[c] = piece.kind === "peg" ? (piece.target ? "O" : "o") : piece.target ? "#" : "=";
  }
  return grid.map((row) => row.join("")).join("\n");
}

/**
 * The three boards, and they are a difficulty curve in the one currency this
 * round has: **how far a target is from a lane the ball can come back down.**
 *
 * **The first** is open, so almost any launch that goes up comes back through
 * something and the pair learns what a bounce does. Four targets spread across
 * it: every launch finds one.
 *
 * **The second** puts two walls across the middle, which is where blocks start
 * mattering — a flat face returns a ball along a line the pair can predict out
 * loud, and that is the board where "bank it off the left wall" becomes a
 * sentence. A ball straight up comes straight back; the way in is off a side
 * wall and along a block.
 *
 * **The third** is a funnel. The middle is a chute back to the bucket and
 * worth nothing; the targets are in the shoulders and only a wall bounce
 * reaches them.
 *
 * **Forty-odd beats is twenty-five seconds at 96 BPM**, and three boards with
 * the morph and the verdict either side is the ninety the whole category is
 * written around ([interludes](../../../docs/spec/interludes.md)).
 *
 * **Everything worth saying about a board is said up here, and not beside
 * it.** The director regenerates this array on every save
 * (`tools/director/src/serialize-pinball.ts`), exactly as it regenerates an
 * act file, so a comment inside it survives until the first time somebody
 * paints a peg. `act-4.ts` keeps its prose above its array for the same
 * reason, and `tools/director/test/wave-save.test.ts` is what holds the
 * regeneration to being a no-op on a board nobody touched.
 */
export const PINBALL_ROUNDS: PinballRound[] = [
  {
    beats: 44,
    pieces: pinBoard(`
      ...........
      ..o.o.o.o..
      .o.O.o.O.o.
      ..o.o.o.o..
      ...........
      .o.o.O.o.o.
      ..o.o.o.o..
      ...........
      ...o.O.o...
      ...........
      ...........
    `),
  },
  {
    beats: 48,
    pieces: pinBoard(`
      ...........
      ..O.....O..
      .o.o...o.o.
      .===...===.
      ...........
      ..o.o.o.o..
      .o.o.#.o.o.
      ...........
      ....===....
      ...o.O.o...
      ...........
    `),
  },
  {
    beats: 52,
    pieces: pinBoard(`
      .O.......O.
      .o.......o.
      .oo.....oo.
      ..=o...o=..
      ...o...o...
      ...O...O...
      ...o...o...
      ....o.o....
      ....===....
      ...........
      .....O.....
    `),
  },
];
