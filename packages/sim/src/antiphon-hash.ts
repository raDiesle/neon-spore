import type { AntiphonCandidate, AntiphonState } from "./antiphon.js";

/**
 * What THE ANTIPHON puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `scuttle-hash.ts` is one: `hash-boss-clocks.ts`
 * grows by a whole boss at a time.
 *
 * **The rail is the field that matters most**: which shape stands in which
 * column in which colour, and which decoys beside it, are facts the seed
 * decided once and both devices must hold identically, or one phone would
 * show her a rail the other's organ is not on. Every list goes in with its
 * length ahead of it, and a candidate is three numbers rather than one, so
 * two rails that differ in one column cannot fold into the same number.
 *
 * **The crossings go in as indices into that rail**, in the order she pulled
 * them, and `heldRail` shifted off nought so its `-1` is a code and not a
 * subtraction. A rail she has pulled two candidates off is a different fight
 * from one she has pulled none off — a bolt into a crossed column is nothing,
 * and a crossed candidate cannot spill — so the two worlds must not fold
 * together (`antiphon-hand.ts`).
 */
export function antiphonHashParts(s: AntiphonState): number[] {
  const out = [
    s.extra,
    s.cycleBeat,
    s.stillBeat,
    s.downBeat,
    s.turnTicks,
    (s.heldP1 ? 1 : 0) + (s.heldP2 ? 2 : 0),
    s.organs.length,
    s.rail.length,
    s.pits.length,
    s.crossed.length,
    s.heldRail + 1,
  ];
  for (const o of s.organs) {
    candidate(out, o);
    out.push(o.grownBeat);
  }
  for (const c of s.rail) candidate(out, c);
  for (const p of s.pits) out.push(p);
  for (const i of s.crossed) out.push(i + 1);
  return out;
}

/** A candidate as three numbers: the shape shifted off nought so the ship's `-1` is a code of its own. */
function candidate(out: number[], c: AntiphonCandidate): void {
  out.push(c.shape + 2, c.col, c.color === "red" ? 1 : 2);
}
