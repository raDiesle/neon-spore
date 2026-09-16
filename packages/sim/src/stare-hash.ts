import { STARE_PHASES, type StareState } from "./stare.js";

/**
 * What THE STARE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `snake-hash.ts` and `scout-hash.ts` are ones:
 * `hash-boss.ts` grows by a whole boss at a time.
 *
 * **The rolled seat is the field that matters most.** It is the one number in
 * this boss that comes out of the rng, and it decides which of two people is
 * about to be punished for touching their own phone — so two devices
 * disagreeing about it is the worst desync this game could have: one pair
 * member would be frozen on their screen and playing on the other's. Nothing
 * else here could be got wrong without this being wrong first.
 */
export function stareHashParts(b: StareState): number[] {
  return [
    STARE_PHASES.indexOf(b.phase),
    b.phaseBeat,
    b.watching,
    b.lookBeats,
    b.looks,
    // The catch, and which seat earned it. Nothing but the picture reads
    // either, and both are in here anyway: rule 4 has no clause for a field
    // only the drawing wants, because a device that disagrees about one is a
    // device drawing a different boss.
    b.caughtTick,
    b.caughtPlayer,
  ];
}
