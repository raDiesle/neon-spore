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
 * with a pixel. `layout.ts` re-exports the ship's own, so nothing that
 * already asked `showsCannon` through that file had to move.
 *
 * **The clock bosses' splits are next door** (`view-role-clocks.ts`), on the
 * seam `packages/sim` cuts three files down and `boss-draw-clocks.ts` draws
 * along: THE THROAT onward, the bosses whose whole difficulty is a count
 * said out loud, each with a paragraph over its predicate. THE TASTER's two
 * put this file at 245 lines, and the next boss would have paid for its line
 * by rewording somebody else's paragraph. What stays here is the ship's own
 * halves and the bosses with a body on the field — the queen, the fleet, the
 * splice — and THE FLIP.
 */

/**
 * Whose screen this is. `p1` shows the cannon and the trigger, `p2` the shield
 * and the two colours — one role per device, which is the finished game. `test`
 * is both halves at once on one screen, which is how it is played alone.
 */
export type ViewRole = "p1" | "p2" | "test";

/**
 * The role as a seat number, for the code that keys off `1 | 2` rather than
 * off `"p1" | "p2"` — a lane, a lobe, a `HandleWords`. `test` reads as seat 1.
 *
 * Eleven call sites had this re-derived before this existed to be called
 * instead: eight wrote the ternary this way, two of them as a same-named
 * private function apiece; three wrote it the other way round, `role ===
 * "p1" ? 1 : 2`, which reads `test` as seat 2 — safe only because all three
 * already returned early on `test` before reaching their own ternary.
 */
export const seatOf = (role: ViewRole): 1 | 2 => (role === "p2" ? 2 : 1);

/**
 * Whose **strip** the cannon's lane is on — the band a thumb can reach, not
 * the muzzle itself: `drawHull` draws the swelling on both screens alike, so
 * this gates a control, not a picture (`band.ts`, `touch-band.ts`).
 */
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
/**
 * Whose **strip** raises the shield — not the dome: `drawHull` calls
 * `drawShieldRim` with no role test, and THE WELL's ring does the same, so
 * both screens draw the plate wherever it stands. This gates the band's
 * shield strip alone (`band.ts`, `touch-band.ts`), which is why a reading
 * cannot cite it to say a seat cannot see the plate — only that the other
 * seat cannot move it.
 */
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
 * THE SCOUT's arena — every mote and every moving hazard. The navigator's,
 * on THE SPLICE's side: the seat that cannot move the little ship by a
 * thousandth of a tile is the seat shown where everything in the dark is, so
 * the flying is done on their word — an o'clock, and how long to burn
 * (`docs/spec/interludes.md`, `scout-draw.ts`).
 */
export const showsScoutArena = (role: ViewRole): boolean => role !== "p1";
/**
 * THE SCOUT's nose, and the motes it is carrying. The pilot's, the same half
 * as the three controls that fly it: a heading is the one thing the seat that
 * holds the turns has to know and the one thing the other seat can only be
 * told. Both seats are shown *where* the ship is — player 2 has to say which
 * way to point it, and cannot from a picture with no ship on it.
 */
export const showsScoutNose = (role: ViewRole): boolean => role !== "p2";
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
