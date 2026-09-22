import { SPOOL_PHASES, type SpoolState } from "./spool.js";

/**
 * What THE SPOOL puts into `hashWorld`, and nothing else.
 *
 * **The brake's depth goes in**, because it is not a gesture that has already
 * been judged — it is the rate the line is paying out at *this beat*
 * (`spoolPayRateMilli`), so two devices disagreeing about where a thumb has
 * the brake would disagree about where the line is a beat later, and about
 * whether the movement is still inside its zone.
 *
 * **Both lengths go in and the zone does not.** How wide the zone is now is
 * `spoolZoneMilli`, read off the ribs, and where it sits is `wantMilli` — so
 * the zone is derived twice over from things already here and has nothing of
 * its own that could drift from the health.
 *
 * `wantRateMilli` goes in because it is rolled off `world.rng`: it is the one
 * field here that a device could not recompute from the rest.
 */
export function spoolHashParts(s: SpoolState): number[] {
  return [
    SPOOL_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.ribs,
    s.brakeMilli,
    s.paidMilli,
    s.wantMilli,
    s.leg,
    s.legBeat,
    s.wantRateMilli,
  ];
}
