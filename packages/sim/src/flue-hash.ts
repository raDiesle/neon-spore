import { FLUE_ENDS, FLUE_PHASES, FLUE_WEAPONS, type FlueState } from "./flue.js";

/**
 * What THE FLUE puts into `hashWorld`, and nothing else.
 *
 * **The authored levels go in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with their count ahead of them. The ember goes in, and the ticks it is
 * worked out from, because it decides whether a shot meets it.
 */
export function flueHashParts(s: FlueState): number[] {
  const out = [
    FLUE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.rollTicks,
    s.emberMilli,
    s.emberDir,
    s.shots,
    s.met,
    s.hits,
    s.levels.length,
  ];
  for (const level of s.levels) {
    out.push(FLUE_WEAPONS.indexOf(level.weapon) + 1);
    out.push(level.color === "red" ? 1 : 2);
    out.push(level.speedMilli);
    out.push(level.slowMilli);
    out.push(FLUE_ENDS.indexOf(level.from) + 1);
    out.push(level.needs);
  }
  return out;
}
