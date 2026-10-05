import type { AntiphonState } from "./antiphon.js";

/**
 * What THE ANTIPHON puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `scuttle-hash.ts` is one: `hash-boss-clocks.ts`
 * grows by a whole boss at a time.
 *
 * **The rail is the field that matters most**: which shape hangs where, and
 * which of them is the organ, are facts the seed decided once and both
 * devices must hold identically, or one phone would judge a carry the other
 * called right. Every list goes in with its length ahead of it, and the
 * codes that may be `-1` are shifted off nought so they stay codes. The
 * carry goes in whole — which candidate and how far down — because a
 * candidate half way down its vein is a different fight from one on the
 * rail (`antiphon-hand.ts`).
 */
export function antiphonHashParts(s: AntiphonState): number[] {
  const out = [
    s.cycleBeat,
    s.stillBeat,
    s.downBeat,
    s.turnTicks,
    (s.heldP1 ? 1 : 0) + (s.heldP2 ? 2 : 0),
    s.organ === null ? 0 : 1,
    s.answer + 1,
    s.carried + 1,
    s.carryMilli,
    s.rail.length,
    s.pits.length,
  ];
  if (s.organ !== null) out.push(s.organ.shape + 2, s.organ.grownBeat);
  for (const c of s.rail) out.push(c.shape + 2, c.col);
  for (const p of s.pits) out.push(p);
  return out;
}
