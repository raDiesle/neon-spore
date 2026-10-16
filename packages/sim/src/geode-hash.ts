import { GEODE_PHASES, type GeodeState } from "./geode.js";

/**
 * What THE GEODE puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE CHRYSALIS's reason
 * (`chrysalis-hash.ts`), each level's beats and its cracks' columns and
 * colours with the lengths ahead of them. The ticks the pieces were cut on go
 * in because they are the fight and the picture of it.
 */
export function geodeHashParts(s: GeodeState): number[] {
  const out = [
    GEODE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.pieces,
    s.cutTick.length,
    ...s.cutTick,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(step.beats);
    out.push(step.cracks.length);
    for (const c of step.cracks) {
      out.push(c.at);
      out.push(c.color === "red" ? 1 : 2);
    }
  }
  return out;
}
