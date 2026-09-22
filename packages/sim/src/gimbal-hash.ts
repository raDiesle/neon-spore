import { GIMBAL_PHASES, type GimbalState } from "./gimbal.js";

/**
 * What THE GIMBAL puts into `hashWorld`, and nothing else.
 *
 * **The alignments go in whole**, the way THE INSTAR's script and THE
 * FILAMENT's filaments do (`instar-hash.ts`, `filament-hash.ts`): they are
 * copied onto the state at install, and two devices hung different marks
 * would be turning to different places. The count goes in ahead of them so
 * two states differing only in how many alignments are left cannot fold into
 * the same number.
 *
 * **Both bearings and both hands go in**, because they are the fight: a ring
 * is where the hand put it, and a hand's last bearing is the reference the
 * next step is measured from — two devices disagreeing about that would
 * disagree about every turn after it. The teeth are not here and do not need
 * to be: they are `gimbalTeeth(cursor)`, and the cursor is the third number
 * down (`hash-coverage` is satisfied by the fields, not by what is read off
 * them).
 */
export function gimbalHashParts(s: GimbalState): number[] {
  const out = [
    s.marks.length,
    s.cursor,
    GIMBAL_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.heldBeats,
    s.seamCol,
    s.seamBeat,
    s.atMilli.length,
    s.atMilli[0],
    s.atMilli[1],
    s.handMilli.length,
    s.handMilli[0],
    s.handMilli[1],
  ];
  for (const m of s.marks) out.push(m.outerMilli, m.innerMilli, m.creepMilli);
  return out;
}
