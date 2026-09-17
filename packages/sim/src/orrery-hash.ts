import { ORRERY_PHASES, type OrreryState } from "./orrery.js";

/**
 * What THE ORRERY puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `baton-hash.ts` is one: `hash-boss.ts` grows by
 * a whole boss at a time.
 *
 * **The anchors are the fields that matter most, and they are the ones a
 * fingerprint over positions would have missed.** Nothing about a ring is
 * stepped, so there is no position to compare: two devices agree about where
 * every gap is exactly when they agree about `from` and `anchorBeat`, and a
 * device a beat out on either would have the pair firing into armour and
 * watching each other do it. The colour is in here for the same reason it is
 * on the state at all — it decides whether a shot lands — and `broken` is the
 * health.
 */
export function orreryHashParts(b: OrreryState): number[] {
  const out = [
    ORRERY_PHASES.indexOf(b.phase),
    b.phaseBeat,
    b.broken,
    b.anchorBeat,
    b.color === "red" ? 1 : 2,
    b.brokeBeat,
    b.spatBeat,
  ];
  // The whole list and its length, including the broken rings' anchors, which
  // go on being true of a ring that is no longer in the way. The length is in
  // here for the reason every list in this file's neighbours carries one: a
  // device holding four anchors and one holding three have disagreed about
  // the boss whatever the four numbers say.
  out.push(b.from.length);
  for (const at of b.from) out.push(at);
  return out;
}
