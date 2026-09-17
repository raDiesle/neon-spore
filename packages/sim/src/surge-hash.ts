import type { SurgeState } from "./surge.js";

/**
 * What THE SURGE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `sinew-hash.ts` is one: `hash-boss.ts` grows
 * by a whole boss at a time.
 *
 * **The pressure and the lift tick are the fields that matter most**: the
 * pressure is the whole fight, and the tick the first lift came on is what
 * decides whether the second was inside the beat — two devices disagreeing
 * about either would have one phone venting and the other bursting. The
 * band and the row are not here because they are not kept — they are read
 * off the notches, which are.
 */
export function surgeHashParts(s: SurgeState): number[] {
  return [
    s.notches,
    s.pressureMilli,
    s.heldP1 ? 1 : 0,
    s.heldP2 ? 1 : 0,
    s.liftTick,
    s.nearBeat,
    s.burstBeat,
    s.evertBeat,
    s.outBeat,
  ];
}
