import { HIVE_PHASES, type HiveState } from "./hive.js";

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
 *
 * **The mass's own state goes in beside them**, and all of it: the phase
 * and the beat it started are what the clench is timed off, and the thumb's
 * three fields decide whether the next site opens with a colour in it. A
 * device that disagreed about any one of them would spill where the other
 * sealed. The phase is hashed by its position in `HIVE_PHASES`, plus one so
 * that `hang` is never nought (`hash.ts`), and the wrung list gets its own
 * count for the same reason the other three have theirs.
 */
export function hiveHashParts(s: HiveState): number[] {
  const out = [
    HIVE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cols.length,
    s.colors.length,
    s.sealed.length,
    s.wrung.length,
    s.pinch,
    s.pinchBeat,
    s.haulMilli,
    s.opened,
    s.openBeat,
    s.spillBeat,
    s.downBeat,
  ];
  for (let i = 0; i < s.cols.length; i++)
    out.push(
      s.cols[i] ?? 0,
      s.colors[i] === "red" ? 1 : 2,
      s.sealed[i] === true ? 1 : 0,
      s.wrung[i] === true ? 1 : 0,
    );
  return out;
}
