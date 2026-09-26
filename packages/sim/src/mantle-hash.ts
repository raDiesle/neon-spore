import { MANTLE_PHASES, type MantleState } from "./mantle.js";

/**
 * What THE MANTLE puts into `hashWorld`, and nothing else.
 *
 * **The thresholds go in whole**, the way THE GIMBAL's alignments and THE
 * INSTAR's script do (`gimbal-hash.ts`): copied onto the state at install, so
 * two devices hung different figures would shear at different sums. The
 * count goes in ahead of them so two states differing only in how many
 * movements are left cannot fold into the same number.
 */
export function mantleHashParts(s: MantleState): number[] {
  const out = [
    s.thresholds.length,
    s.cursor,
    MANTLE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.depthMilli.length,
    s.depthMilli[0],
    s.depthMilli[1],
    s.sparkCol,
    s.sparkBeat,
    s.heartbeatNext,
    s.heartbeatDone,
    s.held.length,
    s.held[0] ? 1 : 0,
    s.held[1] ? 1 : 0,
    s.braceBeats,
  ];
  for (const t of s.thresholds) out.push(t);
  return out;
}
