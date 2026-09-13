/**
 * What to call a seat on a screen a person is reading.
 *
 * **A name if the room knows one, and PLAYER 1 or PLAYER 2 if it does not.**
 * The owner asked for exactly that: *change "Player One" to use in the real
 * game the nicknames of the players; here we say "Player 1" and "Player 2".*
 * The two halves matter separately. A pair who have given their names are two
 * people, and a gate that calls them PLAYER ONE and PLAYER TWO has thrown that
 * away for no reason; a desk with one mouse and both seats on it has no names
 * to use, and the digits are shorter to read than the words ever were.
 *
 * The names arrive from the room and reach the renderer on `ViewState.names`,
 * by seat, blank for a seat nobody has named — solo play, a director, a frame
 * test. Upper case here rather than at the source, because what is stored is
 * what the person typed (`apps/game/src/nickname.ts` keeps "David" as "David")
 * and every word on this screen is set in capitals.
 */

/** The two seats' names, by seat, blank where the room has not said. */
export type SeatNames = readonly [string, string];

export function seatName(seat: 1 | 2, names?: SeatNames): string {
  const given = names?.[seat - 1]?.trim();
  return given ? given.toUpperCase() : `PLAYER ${seat}`;
}

/** Whether this seat has a name of its own, for a screen that would otherwise
 * say YOU or THEM — those are better than a number, and worse than a name. */
export function hasSeatName(seat: 1 | 2, names?: SeatNames): boolean {
  return (names?.[seat - 1]?.trim() ?? "") !== "";
}

/**
 * **A line of the game's own words, with the two seats' names put into it.**
 *
 * The owner asked for the nicknames wherever a person reads a seat's name in
 * play. Most of those places already name a seat as a number and then draw it —
 * a chip, a hand's label — and take the name instead in one line. This is for
 * the other kind: a sentence *written* about a seat, in `packages/content`,
 * which a rehearsal's caption points at a body with ("PLAYER 2 SEES ONE WIRE").
 *
 * **The words are the token**, rather than a `{p1}` the content would have to
 * carry. Two hundred captions would have had to learn a template, every one of
 * them a string an author reads out loud while writing it, and a caption with a
 * brace in it is a caption nobody can proof-read. PLAYER 1 and PLAYER 2 are
 * already the fixed vocabulary for the two seats (`docs/spec/roles.md`), they
 * are already what these lines say, and a substitution on them is exact: no
 * content moves, and a run with no names in it draws what it always drew.
 *
 * Upper case, because every one of these lines is.
 */
export function withNames(text: string, names?: SeatNames): string {
  if (!names) return text;
  return text
    .replace(/\bPLAYER 1\b/g, () => seatName(1, names).toUpperCase())
    .replace(/\bPLAYER 2\b/g, () => seatName(2, names).toUpperCase());
}
