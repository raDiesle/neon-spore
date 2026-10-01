import { THROAT_MODES, THROAT_PHASES, type ThroatState } from "./throat.js";

/**
 * What THE THROAT puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `stare-hash.ts` is one:
 * `hash-boss.ts` grows by a whole boss at a time.
 *
 * **The mouth's place and the pump are the fight**, and both are numbers two
 * devices could spend differently: a mouth a tile off on one phone swallows a
 * body the other phone still draws, and a pump a stroke apart opens a circle
 * of a different size. The two anchors go in for the same reason — a drag
 * sample is read against them, so a device that disagreed about either would
 * put the mouth somewhere else on the next sample.
 *
 * `fedBeat`, `refusedTick` and `refusedId` are half render's and go in anyway,
 * because rule 4 has no clause for a field only the drawing wants — and the
 * refusal's two are the throttle as well (`throat-suck.ts`).
 */
export function throatHashParts(b: ThroatState): number[] {
  return [
    THROAT_PHASES.indexOf(b.phase),
    b.phaseBeat,
    b.slack,
    b.fedBeat,
    b.refusedTick,
    b.refusedId,
    b.aimXMilli,
    b.aimYMilli,
    b.aimFromXMilli,
    b.aimFromYMilli,
    THROAT_MODES.indexOf(b.mode),
    b.pumpDir,
    b.pumpFromYMilli,
    b.pumpMilli,
  ];
}
