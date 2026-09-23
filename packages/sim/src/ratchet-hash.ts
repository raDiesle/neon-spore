import { RATCHET_PHASES, type RatchetState } from "./ratchet.js";

/**
 * What THE RATCHET puts into `hashWorld`, and nothing else.
 *
 * **Her catch and his thumb go in**, and they are the boss: the catch's
 * depth is what a press is judged against, `catchSpent` whether that depth
 * counts, and `pawlDown` whether the next sample is a press at all. Two
 * devices disagreeing about any of them would disagree about a tooth.
 */
export function ratchetHashParts(s: RatchetState): number[] {
  return [
    RATCHET_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.teeth,
    s.clean,
    s.catchMilli,
    s.catchSpent ? 1 : 0,
    s.pawlDown ? 1 : 0,
    s.cleanLast ? 1 : 0,
    s.boltCol,
    s.boltBeat,
  ];
}
