import { FLEET_PHASES, type FleetState } from "./fleet-state.js";

/**
 * THE FLEET's second and third states in the fingerprint, beside the chart
 * `hash-boss.ts` already pushes. Its own file because that one is at its
 * limit, and for the reason every field is here: two phones that disagree
 * about which hull is holed, whose thumb is where, or how far the wreck has
 * been pulled are two phones about to disagree about whether a ship sank.
 */
export function hashFleetPhase(push: (n: number) => void, b: FleetState): void {
  push(FLEET_PHASES.indexOf(b.phase));
  push(b.phaseBeat);
  push(b.holed);
  push(b.holeCol);
  push(b.holeRow);
  push(b.breachHeld ? 1 : 0);
  push(b.rakeOn ? 1 : 0);
  push(b.rakeCol);
  push(b.rakeRow);
  push(b.rakeBeat);
  push(b.wreckPullMilli);
}
