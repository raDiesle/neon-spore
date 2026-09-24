import type { LeadState } from "./lead.js";

/**
 * What THE LEAD puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `surge-hash.ts` is one: `hash-boss.ts` grows
 * by a whole boss at a time.
 *
 * **The flights are the fields that matter most**: a shot in the air above
 * the field is a fact one device has and the other must have identically,
 * column and due beat, or one phone would take a segment and the other
 * turn the body round. The count goes in ahead of them so two lists that
 * differ only in length cannot fold into the same number.
 */
export function leadHashParts(s: LeadState): number[] {
  const out = [
    s.col,
    s.dir,
    s.lean,
    s.segments,
    s.stillBeat,
    s.passBeat,
    s.downBeat,
    s.heldBeat,
    s.freeBeat,
    s.stillFills,
    s.flights.length,
  ];
  for (const f of s.flights) out.push(f.col, f.dueBeat);
  return out;
}
