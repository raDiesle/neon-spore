import {
  UNDERTOW_ANSWERS,
  UNDERTOW_LOBE_STAGES,
  UNDERTOW_PHASES,
  type UndertowState,
} from "./undertow.js";

/**
 * What THE UNDERTOW puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `baton-hash.ts` is one: `hash-boss.ts` grows by
 * a whole boss at a time.
 *
 * **The lobes are the fields that matter most.** Each is a column one seat is
 * being asked to answer with the maw and the other with the shield, so two
 * devices disagreeing about one's colour would have the pair answering
 * different questions — and one disagreeing about its stage would have one
 * screen bursting a lobe the other had shrunk. The level and its clock are in
 * here because they decide when the fight ends.
 */
export function undertowHashParts(u: UndertowState): number[] {
  const out = [
    UNDERTOW_PHASES.indexOf(u.phase),
    u.phaseBeat,
    u.restBeat,
    u.ebbBeat,
    u.taken,
    u.lobes.length,
  ];
  for (const l of u.lobes) {
    out.push(
      l.col,
      UNDERTOW_LOBE_STAGES.indexOf(l.stage),
      l.stageBeat,
      UNDERTOW_ANSWERS.indexOf(l.answer),
      l.tapped === true ? 1 : 0,
    );
  }
  return out;
}
