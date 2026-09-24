import { BELLOWS_PHASES, type BellowsState } from "./bellows.js";

/**
 * What THE BELLOWS puts into `hashWorld`, and nothing else.
 *
 * **Both hands go in**, because a handle's depth is the reference the next
 * stroke's edge is measured against (`bellows-hand.ts`): two devices
 * disagreeing about where a thumb had a handle would disagree about whether
 * the stroke after it was a stroke at all, which on this boss is the
 * difference between a seam and a jam.
 *
 * **`liftTick` goes in** for the same reason one beat later: the finale is
 * two hands off inside a beat of each other, and the tick the first came off
 * is the only thing that says so.
 *
 * The exchange's beat is here and the movement is not: which movement the
 * fight is in is `bellowsShared`, read off the seams, so there is nothing
 * beside the health that could drift from it.
 */
export function bellowsHashParts(s: BellowsState): number[] {
  return [
    BELLOWS_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.exchangeBeat,
    s.exchanged,
    s.seams,
    s.handMilli.length,
    s.handMilli[0],
    s.handMilli[1],
    s.sparkCol,
    s.sparkBeat,
    s.liftTick,
  ];
}
