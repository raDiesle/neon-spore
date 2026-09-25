import type { ViewRole } from "./view-role.js";

/**
 * **The clock bosses' halves** — what each seat is shown of THE THROAT
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
 * THE GORGE's two, and symmetric — a different thing kept from each seat:
 * the same beads on both screens, and a different sentence written about them
 * on each.
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

/**
 * THE LEDGER's two, and this split is the first in either file to cut **one
 * drawn object** in half rather than keeping a fact or a number from a seat.
 * The cord is the whole mechanism and it is on both screens — but only as far
 * as the plating, on the pilot's: the last stretch fades out above the hull,
 * so he is shown the return coming down and never the column it is coming down
 * to (`ledger-cord.ts`).
 *
 * The pilot is shown **the beads**, where each has got to and how many beats
 * are left of it, because he owns the trigger and the trigger is the only
 * thing in this fight that answers a return. The navigator is shown **the
 * socket** — the hole the cord is rooted in, its white lock and the chevron
 * for the column it walks to next — because she carries the plate, and the
 * plate has to be in that column on the beat he presses. *His clock, her
 * column*, which is the design's own sentence for the fight.
 *
 * The one exception is in `ledger-read.ts` and not here: the **last** return is
 * drawn on both screens, because the design's beat 13 asks for both seats to
 * be shown that bead coming and neither of them asked to stop it. `test` is
 * both, the usual *one person is holding both seats*.
 */
export const showsLedgerBead = (role: ViewRole): boolean => role !== "p2";
export const showsLedgerSocket = (role: ViewRole): boolean => role !== "p1";

/**
 * THE SURGE's two, on the seam alone: both seats see the bulb and both
 * thumbs on it, and each is shown one thing on the seam the other is not.
 * The pilot is shown **the notches** — how many are open and where the
 * next one's band sits on the gauge — because the seat that knows *where*
 * is the seat that can say *let go on the four*. The navigator is shown
 * **the pressure** — where the charge has climbed to — because the seat
 * that knows *how much* is the seat that can count it there out loud.
 * Neither mark is on the other's screen, and neither body swells with a
 * number the seat is not shown (`surge-gauge.ts`, `surge-draw.ts`,
 * `sim/surge.ts`). `test` is both.
 */
export const showsSurgeNotches = (role: ViewRole): boolean => role !== "p2";
export const showsSurgePressure = (role: ViewRole): boolean => role !== "p1";

/**
 * THE LEAD's two, and the split is the eyes, each way: the navigator is
 * shown **the column** the body stands in — the stalk at its foot, locked —
 * and never which way it leans; the pilot is shown **the lean**, a stalk
 * standing in the middle of his screen and tilting the way the body goes,
 * and never where it is. His direction times the pace, her column: the sum
 * is the fight, and a screen with both terms on it would have no one to
 * say it to (`lead-shape.ts`, `lead-draw.ts`, `sim/lead.ts`). `test` is both.
 */
export const showsLeadLean = (role: ViewRole): boolean => role !== "p2";
export const showsLeadCol = (role: ViewRole): boolean => role !== "p1";
