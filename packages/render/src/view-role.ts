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
/**
 * THE UNDERTOW's bow — the plate rising before a lobe comes through it. The
 * pilot's, because the floor is his half the way the rocks are: he owns the
 * maw and the cannon's column, so the seat that has to answer a breach is the
 * seat that is shown where the next one is pushing. The navigator is shown
 * the breach the moment it opens, and the plate she has to stand on it, and
 * nothing of the four beats before (`undertow-draw.ts`).
 */
export const showsUndertowBow = (role: ViewRole): boolean => role !== "p2";
/**
 * *Whether this screen sees that ring of THE ORRERY true.* The outer ring on
 * both, the middle on the pilot's alone and the inner on the navigator's — and
 * the one a seat does not own is drawn as an unbroken arc with **no gap in it
 * at all** (`orrery-draw.ts`).
 *
 * The second symmetric split in this list after THE DIASTOLE's chambers, and
 * the sharper of the two. There, each seat is kept from one count. Here each
 * seat is kept from one count *and given a third they share*, which is what
 * makes the fight a conversation rather than two monologues: the outer ring is
 * the common ground both of them can point at while they argue about the two
 * they cannot both see. Take it away and there is nothing to calibrate against;
 * give them all three and there is nothing to say.
 *
 * A ring drawn solid is not a lie, and that matters more here than anywhere
 * else in this file: an arc with no gap is exactly what an orbit you cannot
 * resolve looks like, and the seat that owns it is being asked for the one fact
 * — *three out, coming back* — rather than for a picture.
 *
 * `test` sees every ring true, the usual *one person is holding both seats*
 * answer, and here it is also the only honest one: a screen that greyed a ring
 * would be hiding a count from the only pair there is.
 */
export const showsOrreryRing = (role: ViewRole, ring: number): boolean =>
  ring === 0 || role === "test" || (ring === 1 ? role === "p1" : role === "p2");
/**
 * *Whether this screen draws the grip on the ring the pilot's hand can turn.*
 *
 * His, like every other handle on the field, and the mark is on his screen
 * only: a knurl drawn on the navigator's would be a control she is being shown
 * and cannot use (`orrery-grab.ts`).
 *
 * **It is drawn on a ring he cannot read, and that is the point.** The hand
 * moves inward as the rings come off (`orreryHandRing`), so at the end of the
 * fight the knurl is on the inner ring — grey on his screen, gapless, the one
 * ring that is hers — and he is turning it on her word alone. A picture that
 * put the grip only where he could see what he was doing would have quietly
 * taken the last third of this boss away.
 */
export const showsOrreryGrip = (role: ViewRole): boolean => role !== "p2";
/**
 * THE CANDLE's three, the deepest split in this list: **the same dark field,
 * lit differently on the two phones.** Every other entry keeps a fact about
 * a lit field from one seat; these light the field itself, and a flash is
 * drawn only on the screen of the seat whose control made it
 * (`candle-dark.ts`, `after-image.ts`).
 *
 * The muzzle flash is the navigator's — she fires, and three columns light on
 * her screen for a beat. The guard window is the pilot's — he pulls the
 * trigger, and the plate's column lights on his. The beam is both seats',
 * because it takes both to make: her colour held, his column kept. And the
 * column the glow *faces*, the one it eats flashes from, is the pilot's alone,
 * for the reason it is in the rule: the seat that fires cannot see which
 * column not to fire from, and has to be told (`sim/candle.ts`).
 */
export const showsCandleMuzzle = (role: ViewRole): boolean => role !== "p1";
export const showsCandleGuard = (role: ViewRole): boolean => role !== "p2";
export const showsCandleFace = (role: ViewRole): boolean => role !== "p2";
/**
 * THE GORGE's two, symmetric the way THE DIASTOLE's chambers are: the same
 * beads on both screens, and a different sentence written about them on each.
 * The pilot is shown the **count** in every lobe, a violet tally under it —
 * he owns the column and the trigger, so the seat that has to hold a lobe at
 * three and say *one more* is the seat given the three. The navigator is
 * shown **which** lobe is nearest full and the colour it fills with, and no
 * number — she owns the colours, so the seat that has to answer *which one,
 * which colour* is the seat given the ring (`gorge-draw.ts`, `sim/gorge.ts`).
 * `test` is both, the usual *one person is holding both seats* answer.
 */
export const showsGorgeTally = (role: ViewRole): boolean => role !== "p2";
export const showsGorgeNearest = (role: ViewRole): boolean => role !== "p1";
