import type { HiveState } from "./hive.js";

/**
 * What THE HIVE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `scuttle-hash.ts` is one: `hash-boss-clocks.ts`
 * grows by a whole boss at a time.
 *
 * **The sites are the fields that matter most**: which column each is in,
 * what colour it opens with and whether it is sealed are facts the seed and
 * the pair decided once and both devices must hold identically, or one
 * phone would seal a breach the other is still spilling from. The count
 * of each list goes in ahead of them so two hives that differ only in a
 * length cannot fold into the same number — three counts and not one,
 * because the coverage test lengthens each list on its own — and a colour
 * is never nought so a red site and a missing one never agree.
 */
export function hiveHashParts(s: HiveState): number[] {
  const out = [
    s.cols.length,
    s.colors.length,
    s.sealed.length,
    s.opened,
    s.openBeat,
    s.spillBeat,
    s.downBeat,
  ];
  for (let i = 0; i < s.cols.length; i++)
    out.push(s.cols[i] ?? 0, s.colors[i] === "red" ? 1 : 2, s.sealed[i] === true ? 1 : 0);
  return out;
}
