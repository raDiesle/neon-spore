import { BROOD_PHASES, type BroodState } from "./brood.js";

/**
 * What THE BROOD puts into `hashWorld`, and nothing else.
 *
 * **The buds are the fields that matter most**: two devices disagreeing about
 * one bud's ripening would have one phone drop a body the other still shows
 * hanging. **The script goes in whole**, THE INSTAR's rule (`instar-hash.ts`):
 * it is copied onto the state at install, and two devices handed different
 * scripts would be fighting different bosses.
 */
export function broodHashParts(s: BroodState): number[] {
  const out = [BROOD_PHASES.indexOf(s.phase), s.phaseBeat, s.cursor, s.dropped, s.steps.length];
  for (const st of s.steps) {
    out.push(st.ripenBeats, st.buds.length);
    for (const b of st.buds) out.push(b.offset, b.color === "red" ? 0 : 1);
  }
  out.push(s.buds.length);
  for (const b of s.buds) out.push(b.col, b.color === "red" ? 0 : 1, b.bornBeat, b.popped ? 1 : 0);
  return out;
}
