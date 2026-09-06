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
