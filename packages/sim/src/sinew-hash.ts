import type { SinewState } from "./sinew.js";

/**
 * What THE SINEW puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `gorge-hash.ts` is one: `hash-boss.ts` grows
 * by a whole boss at a time.
 *
 * **The two pulls are the fields that matter most**: the sum is the whole
 * fight, and two devices disagreeing about one hand's depth would have
 * player 2 reading a sum the other phone is not holding, and a fibre parting
 * on one screen only. The sum, the zone's width and the mass's row are not
 * here because they are not kept — they are read off the pulls, the slack,
 * the fibres and the beats, which are.
 */
export function sinewHashParts(s: SinewState): number[] {
  return [
    s.massCol,
    s.fibres,
    s.pullP1Milli,
    s.pullP2Milli,
    s.swayP1Milli,
    s.swayP2Milli,
    s.slackMilli,
    s.zoneLowMilli,
    s.holdBeat,
    s.snapBeat,
    s.fallBeat,
    s.outBeat,
  ];
}
