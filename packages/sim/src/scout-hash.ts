import { SCOUT_PHASES, type ScoutState } from "./scout.js";

/**
 * What THE SCOUT puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `snake-hash.ts` and `maze-hash.ts` are ones:
 * `hash-boss.ts` grows by a whole boss at a time, and every rule in here is
 * about what two devices could come to disagree about rather than about a
 * scout.
 *
 * **The flight is the part that could drift.** Position, travel and heading
 * are integers that are rewritten every tick out of the tick before, so a
 * device that rounded one of them differently once is a device flying a
 * different ship a beat later — which is exactly what rule 3 and the ban on
 * `Math.sin` in this package exist to stop, and exactly what this is the proof
 * of. The authored arenas are in for THE MIRROR's reason: two phones on two
 * builds of `content` would be flying round different arenas and nothing else
 * here would say a word about it.
 */
export function scoutHashParts(b: ScoutState): number[] {
  const parts: number[] = [];
  const push = (n: number): void => {
    parts.push(n);
  };
  push(SCOUT_PHASES.indexOf(b.phase));
  push(b.phaseBeat);
  push(b.openBeat);
  push(b.passed ? 1 : 0);
  push(b.arena);
  push(b.arenaBeat);
  push(b.colMilli);
  push(b.rowMilli);
  push(b.vColMilli);
  push(b.vRowMilli);
  push(b.headingMilli);
  push(b.turn);
  push(b.burning ? 1 : 0);
  // The catch, tick and which one did it. Nothing but the picture reads the
  // index, and it is in here anyway: rule 4 has no clause for a field only the
  // drawing wants, because a device that disagrees about one is a device
  // drawing a different round.
  push(b.caughtTick);
  push(b.caughtBy);
  // What has been collected, and where everything is now. The hazards move, so
  // their positions are the play rather than the map.
  push(b.mawTick);
  // The two hands on the picture. A line on the ship is whether player 1's
  // controls do anything at all, and a prime is whether his burn does — so a
  // device that disagreed about either would be flying a different ship
  // (`scout-hand.ts`).
  push(b.reeling ? 1 : 0);
  push(b.primeTick);
  // Carried and banked are two lists and both are the fight: a device that
  // thinks one more mote is aboard is a device drawing a different arena for
  // the seat that can see it.
  push(b.carrying.length);
  for (const at of b.carrying) push(at);
  push(b.banked.length);
  for (const at of b.banked) push(at);
  push(b.hazards.length);
  for (const hazard of b.hazards) {
    push(hazard.colMilli);
    push(hazard.rowMilli);
    push(hazard.vColMilli);
    push(hazard.vRowMilli);
  }
  push(b.arenas.length);
  for (const arena of b.arenas) {
    push(arena.beats);
    push(arena.startColMilli);
    push(arena.startRowMilli);
    push(arena.startHeadingMilli);
    push(arena.motes.length);
    for (const mote of arena.motes) {
      push(mote.colMilli);
      push(mote.rowMilli);
    }
    push(arena.hazards.length);
    for (const hazard of arena.hazards) {
      push(hazard.colMilli);
      push(hazard.rowMilli);
      push(hazard.vColMilli);
      push(hazard.vRowMilli);
    }
  }
  return parts;
}
