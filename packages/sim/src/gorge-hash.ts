import type { GorgeState } from "./gorge.js";

/**
 * What THE GORGE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `throat-hash.ts` is one: `hash-boss.ts` grows
 * by a whole boss at a time.
 *
 * **The bubbles are the fields that matter most**, all six numbers of each:
 * two devices disagreeing about one count would have player 1 calling a shot
 * the other phone has already taken, and a bubble open on one screen only.
 * **The levels go in whole**, THE INSTAR's rule (`instar-hash.ts`): they are
 * copied onto the state at install, and two devices handed different climbs
 * would be fighting different bosses. The phase is not, because it is not
 * kept — it is read off the beats, which are.
 */
export function gorgeHashParts(g: GorgeState): number[] {
  const out = [g.col, g.levels.length, g.level, g.intakes.length, g.next, g.turn];
  out.push(g.turnFrom);
  out.push(g.turnBeat, g.clearBeat, g.outBeat);
  for (const v of g.levels) {
    out.push(v.intakes, v.ordered ? 1 : 0, v.ring ? 1 : 0, v.mixed, v.needMin, v.needMax);
  }
  for (const k of g.intakes) out.push(k.needRed, k.needCyan, k.gotRed, k.gotCyan, k.order, k.taps);
  return out;
}
