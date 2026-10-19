import { MOTH_PHASES, MOTH_STEP_KINDS, type MothState } from "./moth.js";

/**
 * What THE MOTH puts into `hashWorld`, and nothing else.
 *
 * **Where it hangs and how far it has sunk matter most**: two devices
 * disagreeing about either would have one phone land it on the cannon while
 * the other still shows it high. **The cannon it has seen goes in too** — the
 * column and the beat it stood still from are what it drifts on. **The
 * script goes in whole**, THE INSTAR's rule (`instar-hash.ts`).
 */
export function mothHashParts(s: MothState): number[] {
  const out = [MOTH_PHASES.indexOf(s.phase), s.phaseBeat, s.cursor, s.centre, s.hits, s.settle];
  out.push(s.seenCol, s.seenBeat, s.flitBeat, s.shed, s.landed, s.spots.length, ...s.spots);
  out.push(s.steps.length);
  for (const st of s.steps) {
    out.push(MOTH_STEP_KINDS.indexOf(st.kind));
    if (st.kind === "wings") {
      out.push(st.dustEvery ?? 0, st.inTurn === true ? 1 : 0, st.spots.length, ...st.spots);
    } else out.push(st.hits, st.hopEvery);
  }
  return out;
}
