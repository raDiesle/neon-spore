/**
 * Whose screen this is, and what that seat is allowed to be shown.
 *
 * Split out of `layout.ts` when THE FLEET added the fifth of these and pushed
 * that file past its 250-line limit. The seam is the honest one: next door is
 * *where things are on the screen*, which is arithmetic over a viewport, and
 * this is *which screen this is*, which is the information split
 * (`docs/spec/systems.md` 5.2) written as five predicates.
 *
 * That list grows with the game — one line every time a mechanic gives one
 * seat something the other is not told — and none of it has anything to do
 * with a pixel. `layout.ts` re-exports the whole of it, so nothing that
 * already asked `showsCannon` through that file had to move.
 */

/**
 * Whose screen this is. `p1` shows the cannon and the trigger, `p2` the shield
 * and the two colours — one role per device, which is the finished game. `test`
 * is both halves at once on one screen, which is how it is played alone.
 */
export type ViewRole = "p1" | "p2" | "test";

export const showsCannon = (role: ViewRole): boolean => role !== "p2";
/**
 * *Whether the key is turned over* — THE CODEX's shimmer across the field and
 * the emitter's beam standing in it.
 *
 * **The pilot's, and the first entry in this list that hides a fault from the
 * seat the fault acts on.** Every other split here keeps a fact about the
 * *field* from one player. This one keeps a fact about the navigator's own two
 * buttons from the navigator: they work, they answer the thumb, and while the
 * key is over they do each other's job. A navigator who could see the shimmer
 * would simply press the other colour and there would be nothing to say
 * (`sim/codex.ts`).
 */
export const showsCodex = (role: ViewRole): boolean => role !== "p2";
export const showsShield = (role: ViewRole): boolean => role !== "p1";
/**
 * *Where* — which side the queen's next rock drops from, and which of her two
 * marks is the real one. The navigator's read, same half as the shield.
 */
export const showsQueenHint = (role: ViewRole): boolean => role !== "p1";
/**
 * *What* — the creature and colour her mark is about to become. The pilot's
 * read, same half as the cannon that has to answer it: they hold the
 * ammunition, so they are the one who has to know which it needs to be.
 * Player 2 gets a question mark in its place (`queen-weakpoint.ts`).
 */
export const showsQueenShape = (role: ViewRole): boolean => role !== "p2";
/**
 * THE FLEET's hulls. The pilot's, the same half as the cannon — they hold the
 * only trigger, so the seat that can act on the map is the seat that is given
 * it, and the whole fight is them getting it out of their mouth one square at
 * a time. Player 2 is shown water and the sights, and nothing else at all
 * (`fleet-hulls.ts`).
 */
export const showsFleetHulls = (role: ViewRole): boolean => role !== "p2";
/**
 * THE SPLICE's tangle, its numbers and its clock. The navigator's, and the
 * first entry in this list on the *opposite* side from THE FLEET's — there the
 * seat that can act is given the map, here the seat that cannot is.
 *
 * It has to be this way round because of what the two fights ask. THE FLEET's
 * pilot has to get a square out of their mouth one coordinate at a time, and
 * the fight is the saying. THE SPLICE's tangle takes *reading* — following a
 * line across four others — and a seat doing that while also deciding when to
 * press would simply stop talking. So the reading and the pressing are put on
 * different phones and the panel crosses the other way (`mawTake`,
 * `content/control-sets-table.ts`): the navigator reads the tangle and holds
 * the only mouth, the pilot holds the cannon and is shown a hand's width of
 * straw over each opening and nothing above it (`splice-draw.ts`).
 */
export const showsSpliceTangle = (role: ViewRole): boolean => role !== "p1";
/**
 * *Which way round the field is drawn* — THE FLIP, and the one entry here that
 * takes an argument, because which seat is turned is the wave's to say and not
 * this file's (`sim/flip.ts`).
 *
 * What it settles is the third screen. `test` is both halves at once, so a
 * fault authored on one seat has to be either shown there or not, and it
 * follows the pilot for the reason every other split in this list does:
 * `showsCannon`, `showsCodex` and `showsQueenShape` are all *not p2*, so a
 * person playing alone is shown player 1's picture throughout rather than a
 * third one nobody plays.
 */
export const flipsField = (role: ViewRole, seat: 1 | 2): boolean =>
  seat === 1 ? role !== "p2" : role === "p2";
/**
 * *Whether this screen sees that chamber of THE DIASTOLE beating true.* One
 * each: the pilot owns the left chamber, the navigator the right, and the one
 * a seat does not own is drawn as a still grey mass on that screen
 * (`sim/diastoleSeat`, `diastole-draw.ts`).
 *
 * The second entry here to take an argument, and for THE FLIP's reason — which
 * seat owns which chamber is the boss's to say, not this file's. It is also the
 * first split in this list that is **symmetric**: every other one keeps
 * something from *one* of the two seats, and this keeps a different thing from
 * each of them, which is what makes the fight two counts rather than one count
 * and one witness.
 *
 * `test` is both halves at once, so it sees both beating — and here that is not
 * the usual *follow the pilot* default but the only honest answer: a person
 * playing alone is holding both counts, and a screen that showed one chamber
 * grey would be hiding a count from the only pair there is.
 */
export const showsDiastoleBeat = (role: ViewRole, seat: 1 | 2): boolean =>
  role === "test" || (seat === 1 ? role === "p1" : role === "p2");

/**
 * *Where it will be, and when* — THE THROAT's next inhale: the column the mouth
 * will stand in on that beat, and the count to it. The navigator's read, and
 * the sharpest one in this list.
 *
 * Everything else here keeps a fact somebody could have worked out. This keeps
 * a fact about **a beat that has not happened**, which is why the mouth's
 * column is a pure function of the beat rather than a position stepped once a
 * beat (`sim/throat.ts`, `docs/spec/bosses.md` §11.19) — a stepper could not
 * answer the question this readout asks.
 *
 * The pilot is not being punished for it. He owns the fling and he has the
 * whole gullet in front of him: where the mouth is *now*, which is what a fling
 * this beat is swept against. What he cannot see is where to aim for a fling
 * that lands in four beats' time, and that is the sentence the pair has to say.
 *
 * `test` shows it, the usual *one person is holding both seats* answer.
 */
export const showsThroatLock = (role: ViewRole): boolean => role !== "p1";
