import type { ViewRole } from "./view-role.js";

/**
 * **The clock bosses' halves** — what each seat is shown of THE DIASTOLE
 * onward, the bosses from `docs/spec/bosses-choreographed.md` whose whole
 * difficulty is a beat count the pair says out loud.
 *
 * Cut out of `view-role.ts` on 17 September 2026, when THE TASTER's two had
 * put that file at 245 lines, along the seam `packages/sim` already cuts three
 * files down (`bosses-clocks.ts`, `config-boss-clocks.ts`,
 * `boss-entries-clocks.ts`) and `boss-draw-clocks.ts` draws along. Next door
 * is the ship's own halves and the bosses with a body on the field; every one
 * of these hangs over the top of the field with nothing of itself on the grid,
 * and every one is the half that grows — nine more are designed, and each
 * brings a predicate with a paragraph over it. Nothing re-exports these:
 * every drawer that asks one names this file (`.claude/skills/new-boss`).
 *
 * The rules are the ones the other file states: `test` is one person holding
 * both seats and is shown both halves, a fact is kept from the seat that
 * would otherwise have nothing to ask for, and a split that is *symmetric* —
 * a different thing kept from each seat — is what makes a fight two counts
 * rather than one count and one witness.
 */

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

/**
 * THE CURTAIN's two, and here the split is the eyes rather than a sentence
 * written over a shared picture: both seats see the fabric and both hands
 * move it, and each is shown one thing behind it the other is not. The pilot
 * is shown **which lobes are soft** — he owns the cannon, so the seat that
 * has to put a shot into the fourth lobe is the seat given the fourth lobe
 * lit. The navigator is shown **the core's shadow and its colour** through
 * the fabric — she owns the colours, so the seat that has to say *red, two
 * columns left of the middle* is the seat given the shadow. Once the core is
 * bare it is a body on the field and both see it (`curtain-draw.ts`,
 * `sim/curtain.ts`). `test` is both.
 */
export const showsCurtainSoft = (role: ViewRole): boolean => role !== "p2";
export const showsCurtainShadow = (role: ViewRole): boolean => role !== "p1";

/**
 * THE TASTER's two, and this split is neither the eyes nor a sentence over a
 * shared picture: **both seats see the whole fan**, every blade and every
 * edge, and each is given one *number* the other has not got. It is the first
 * boss whose split is arithmetic rather than occlusion, because the fight is
 * arithmetic — what the two of them have been spending (`sim/spend.ts`).
 *
 * The navigator is shown **the ledger**: the two counts over the window the
 * fan is tasting, in their own colours, which is the *nine red to four, give
 * me cyan* she has to say. Hers because she owns the colours. The pilot is
 * shown **where the crest opens next**, one column ahead of anything the
 * world draws, which is what he answers with. His because he owns the column,
 * and because a blade that has already started growing is on both screens —
 * so the mark tells him nothing she could not also see, only sooner.
 *
 * Neither is shown the colour the beam has to be: that is the other side of
 * her own count, and a picture that named it would answer the fight
 * (`taster-read.ts`). `test` is both, the usual *one person is holding both
 * seats*.
 */
export const showsTasterTally = (role: ViewRole): boolean => role !== "p1";
export const showsTasterNext = (role: ViewRole): boolean => role !== "p2";

/**
 * THE SINEW's two, on the strain band alone: both seats see the tendon,
 * the mass and both handles, and each is shown one thing on the band the
 * other is not. The pilot is shown **the zone** — where on the band a fibre
 * parts — because his hand is the first on and the seat that knows where to
 * go is the seat that can say *pull to here*. The navigator is shown **the
 * sum** — where both pulls together have got to — because the seat that
 * knows where they are is the seat that can say *more* or *ease off*.
 * Neither number is on the other's screen; the hold counting is on both
 * (`sinew-band.ts`, `sim/sinew.ts`). `test` is both.
 */
export const showsSinewZone = (role: ViewRole): boolean => role !== "p2";
export const showsSinewSum = (role: ViewRole): boolean => role !== "p1";
