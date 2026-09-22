import { HASP_PHASES, type HaspState } from "./hasp.js";

/**
 * What THE HASP puts into `hashWorld`, and nothing else.
 *
 * **Both hands go in**, and they are the boss: the latch's depth is what the
 * gate is read off every tick, and her bearing is the reference her next
 * step is measured from (`hasp-hand.ts`). Two devices disagreeing about
 * either would disagree about whether the wheel is turning at all.
 *
 * **`gripBeat` and `burnBeat` go in** because the pilot's whole clock is the
 * difference between them and now, and nothing else on the state carries it.
 *
 * **`seized` goes in** although it is nearly a reading: it is the memory of
 * whether the dim has already been said, so a device that had it wrong would
 * say it a second time or not at all.
 *
 * Which movement the fight is in is not here — it is `s.hasps`, read off the
 * health, so there is nothing beside the count that could drift from it.
 */
export function haspHashParts(s: HaspState): number[] {
  return [
    HASP_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.hasps,
    s.latchMilli,
    s.gripBeat,
    s.burnBeat,
    s.wheelMilli,
    s.handMilli,
    s.woundMilli,
    s.seized ? 1 : 0,
    s.boltCol,
    s.boltBeat,
  ];
}
