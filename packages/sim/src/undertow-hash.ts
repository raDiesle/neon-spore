import { UNDERTOW_BREACH_STAGES, UNDERTOW_PHASES, type UndertowState } from "./undertow.js";

/**
 * What THE UNDERTOW puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `baton-hash.ts` is one: `hash-boss.ts` grows by
 * a whole boss at a time.
 *
 * **The breaches are the fields that matter most.** Each is a column one
 * seat is being asked to answer and the other to plate, so two devices
 * disagreeing about one would have the pair answering different holes. The
 * width is in here because it decides when a second lobe comes through; the
 * unseat is a lock on one seat's phone, THE BATON's worst desync; the hold
 * is the count that ends the fight.
 */
export function undertowHashParts(u: UndertowState): number[] {
  const out = [
    UNDERTOW_PHASES.indexOf(u.phase),
    u.phaseBeat,
    u.push,
    u.restBeat,
    u.breaches.length,
  ];
  for (const b of u.breaches) {
    out.push(
      b.col,
      UNDERTOW_BREACH_STAGES.indexOf(b.stage),
      b.stageBeat,
      b.tall ? 1 : 0,
      b.widthMilli,
      b.widened ? 1 : 0,
    );
  }
  out.push(u.taken, u.scars, u.unseatedUntil, u.hold, u.slid);
  out.push(u.pinCol, u.freeHeld ? 1 : 0, u.freed);
  return out;
}
