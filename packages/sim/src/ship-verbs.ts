import type { Command } from "./types.js";

/**
 * **Which commands are a seat talking to the ship**, as against the host
 * talking to the run.
 *
 * Written down once because two bosses now forbid a seat the same list: THE
 * STARE punishes a watched seat for any of these (`stareForbids`) and THE
 * BATON swallows them from a seat whose turn it is not (`batonLocks`). Two
 * lists would be two lists that drift, and a verb that one boss counted as
 * touching the ship and the other did not would be a verb the pair learns to
 * play around rather than a rule they sit still for.
 *
 * What is **not** here is leaving, retrying, the guide's own steps and the
 * ready gate. A pair frozen out of `restart` would be a pair who could not put
 * the phone down, and `applyCommand` already reads `restart` above every
 * other rule for that reason.
 */
export function reachesShip(c: Command): boolean {
  switch (c.kind) {
    case "restart":
    case "retry":
    case "retryGuide":
    case "quit":
    case "brief":
    case "guideStep":
      return false;
    default:
      return true;
  }
}
