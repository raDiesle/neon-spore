import { STARE_PHASES, type StareState } from "./stare.js";

/**
 * What THE STARE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `snake-hash.ts` and `scout-hash.ts` are ones:
 * `hash-boss.ts` grows by a whole boss at a time.
 *
 * **`open` is the field that matters most.** It decides whether a press on
 * this tick breaks the hull, so two devices disagreeing about it is one pair
 * member frozen on their screen and playing on the other's. The patterns are
 * hashed as their open beats, one number a level, so a device built from a
 * different wave file fingerprints as the different boss it is.
 */
export function stareHashParts(b: StareState): number[] {
  const out = [
    STARE_PHASES.indexOf(b.phase),
    b.phaseBeat,
    b.level,
    b.pass,
    b.open ? 1 : 0,
    b.caughtTick,
    b.caughtPlayer,
    b.caughtCol,
    b.lidSeat,
    b.lidMilli,
    b.levels.length,
  ];
  for (const p of b.levels) out.push(patternBits(p), p.length);
  return out;
}

/** A pattern's open beats as bits, beat 0 the lowest. */
function patternBits(p: string): number {
  let bits = 0;
  for (let i = 0; i < p.length && i < 30; i++) if (p[i] === "x") bits |= 1 << i;
  return bits;
}
