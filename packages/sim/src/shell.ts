import type { Creature, CreatureKind } from "./types.js";

/**
 * THE SHELL's armour, as arithmetic. No world, no events, no mutation — the
 * round it plays out is `shell-round.ts` next door, the same way
 * `warden-cycle.ts` holds the cycle and `warden.ts` holds what the cycle does.
 *
 * **The pieces divide the body vertically, and that is not a drawing
 * decision.** The cannon fires straight up, so a shot meets whatever stands
 * lowest in its column and nothing else. Pieces stacked in rows would put the
 * lower one permanently in front of the upper one, and the body would be
 * unkillable rather than hard — passing every test, and impossible on a phone.
 * So each piece is a full-height slice and **every column of the body has
 * exactly one piece in front of it**: `shellPieceAt` is that sentence, and
 * `test/shell.test.ts` fires up each column in turn to prove it.
 *
 * That is also why the count is not a tunable. The pieces *are* the body's
 * columns, so `SHELL_COLS` is both — two, which on a seven-column field is a
 * proportionate amount of the field to speak for, and which brings the
 * reversal the creature exists for soon enough that the pair is still
 * interested when it arrives.
 */

/**
 * Columns THE SHELL occupies, and therefore how many pieces it wears. One
 * number for both questions because they are one question — `colSpan` in
 * `kinds.ts` reads it, so a wider shell is a shell with more pieces and can
 * never be a wide body with a piece missing in front of a column.
 */
export const SHELL_COLS = 2;

/** No armour at all: every other kind, and a shell whose last piece is off. */
export const NO_SHELL = 0;

/**
 * Every piece still on. One bit per piece, bit `k` for the piece in front of
 * column `col + k` — a bitmask rather than a count because *which* piece is
 * gone is the whole of what the pair has to say to each other once the first
 * one goes.
 */
export const SHELL_INTACT = (1 << SHELL_COLS) - 1;

/** What a freshly spawned creature of this kind wears. Zero for every other. */
export function shellOnSpawn(kind: CreatureKind): number {
  return kind === "shell" ? SHELL_INTACT : NO_SHELL;
}

/**
 * Which piece stands in front of `col`, or -1 for a column the body does not
 * occupy. The piece index counted from the body's leftmost column, which is
 * what `Creature.col` always means for a span wider than one tile.
 *
 * Call this rather than writing `col - c.col` at a hit site or a draw site:
 * two copies of it is how the shot that broke a piece and the picture that
 * shows the gap come to disagree about which column is now open.
 */
export function shellPieceAt(c: Creature, col: number): number {
  const piece = col - c.col;
  return piece >= 0 && piece < SHELL_COLS ? piece : -1;
}

/** Whether the piece in front of this column is still on. */
export function shellHasPiece(c: Creature, col: number): boolean {
  const piece = shellPieceAt(c, col);
  return piece >= 0 && (c.shell & (1 << piece)) !== 0;
}

/** The mask with one piece taken off it. Pure — nothing here mutates a body. */
export function shellWithout(shell: number, piece: number): number {
  return shell & ~(1 << piece);
}

/** How many pieces are still on, for the event and for the card. */
export function shellPiecesLeft(c: Creature): number {
  let left = 0;
  for (let k = 0; k < SHELL_COLS; k++) if ((c.shell & (1 << k)) !== 0) left += 1;
  return left;
}

/**
 * Whether the core is exposed — the one question the two phases turn on.
 *
 * Call it rather than writing `shell === 0` by hand. The rule is that the core
 * is exposed only when **every** piece is gone, and a hand-written test
 * against a count would quietly become "one piece off is enough" the first
 * time the mask grew a third bit.
 */
export function shellIsBare(c: Creature): boolean {
  return c.shell === NO_SHELL;
}
