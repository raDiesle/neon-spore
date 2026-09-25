import { THROAT_PHASES, type ThroatState } from "./throat.js";

/**
 * What THE THROAT puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `stare-hash.ts` is one:
 * `hash-boss.ts` grows by a whole boss at a time.
 *
 * **`mouthFrom` and `phaseBeat` together *are* the mouth's position**, and
 * they are the two fields a reader would most expect to be left out — an
 * anchor looks like setup. They are not. Where the mouth is on any beat is
 * derived from exactly these two numbers and the stride
 * (`throatMouthCol`), so a device that disagreed about either would draw the
 * mouth in a different column and judge a fling against a different one. That
 * is the worst desync this boss could have: player 2 would have named the
 * column correctly and one of the two phones would tell the pair she had not.
 *
 * `slack` is the health and the phase both, since the phase is read off it.
 * `chokedBeat` and `fedBeat` are render's and go in anyway, because rule 4 has
 * no clause for a field only the drawing wants: a device that disagrees about
 * whether the throat just ate is a device drawing a different boss.
 *
 * **The two hands are three more numbers, and every one of them is a beat two
 * devices could spend differently.** `cinchBeat` is whether the gullet is
 * breathing at all, `breath` is how many inhales it owes, and `haulStep` is a
 * column the mouth is about to move that has not moved yet — a pending
 * number, which is exactly the kind rule 4 was written for
 * (`throat-hand.ts`).
 */
export function throatHashParts(b: ThroatState): number[] {
  return [
    THROAT_PHASES.indexOf(b.phase),
    b.phaseBeat,
    b.slack,
    b.mouthFrom,
    b.chokedBeat,
    b.fedBeat,
    b.cinchBeat,
    b.breath,
    b.haulStep,
  ];
}
