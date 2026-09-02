import { PIN_THIN_MILLI, type PinballRound, type PinPiece } from "@neon-spore/sim";

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
const PIN_COLS = 11;

/** Tiles of clear air above the first row of a board — the ceiling to bank off. */
const PIN_TOP_TILES = 1.5;

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
 * The three boards, and they are a difficulty curve in the one currency this
 * round has: **how far a target is from a lane the ball can come back down.**
 *
 * The first is open, so almost any launch that goes up comes back through
 * something and the pair learns what a bounce does. The second puts two walls
 * across the middle, which is where blocks start mattering — a flat face
 * returns a ball along a line the pair can predict out loud, and that is the
 * board where "bank it off the left wall" becomes a sentence. The third is a
 * funnel with its targets in the shoulders, where a straight shot is worthless
 * and the only way in is a wall first.
 *
 * **Forty beats is twenty-five seconds at 96 BPM**, and three boards with the
 * morph and the verdict either side is the ninety the whole category is
 * written around ([interludes](../../../docs/spec/interludes.md)).
 */
export const PINBALL_ROUNDS: PinballRound[] = [
  // Open, wide, four targets spread across it: every launch finds something.
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
    `),
  },
  // Two walls, and the targets above them. A ball that goes straight up comes
  // straight back; the way in is off a side wall and along a block's face.
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
    `),
  },
  // A funnel. The middle is a chute back to the bucket and worth nothing; the
  // targets are in the shoulders and only a wall bounce reaches them.
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
