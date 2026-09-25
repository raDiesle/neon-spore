import {
  INSTAR_ARRIVALS,
  INSTAR_GESTURES,
  INSTAR_PARTS,
  INSTAR_PHASES,
  INSTAR_POSES,
  INSTAR_SEATS,
  type InstarState,
} from "./instar.js";

/**
 * What THE INSTAR puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `hive-hash.ts` is one: `hash-boss-clocks.ts`
 * grows by a whole boss at a time.
 *
 * **The script goes in whole**, the way THE SCOUT's arenas do
 * (`scout-hash.ts`): it is copied onto the state at install and two devices
 * handed different scripts would be playing different scenes, so every
 * figure of every mark is fingerprinted, each closed word as its index in
 * its list plus one — nought is what a word not on the list would be. The
 * count of each list goes in ahead of it so two states that differ only in
 * a length cannot fold into the same number, and the four per-mark lists
 * each carry their own count because the coverage test lengthens each on
 * its own.
 */
export function instarHashParts(s: InstarState): number[] {
  const out = [
    s.steps.length,
    s.cursor,
    INSTAR_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.progress.length,
    s.doneBeat.length,
    s.ref.length,
    s.thumbs.length,
  ];
  for (const step of s.steps) {
    out.push(
      INSTAR_POSES.indexOf(step.pose) + 1,
      INSTAR_ARRIVALS.indexOf(step.arrive) + 1,
      step.morphBeats,
      step.windowBeats,
      step.landBeats,
      step.marks.length,
    );
    for (const m of step.marks)
      out.push(
        INSTAR_SEATS.indexOf(m.seat) + 1,
        INSTAR_PARTS.indexOf(m.part) + 1,
        INSTAR_GESTURES.indexOf(m.gesture) + 1,
        m.xMilli,
        m.yMilli,
        m.need,
      );
  }
  for (const n of s.progress) out.push(n);
  for (const n of s.doneBeat) out.push(n);
  for (const n of s.ref) out.push(n);
  for (const n of s.thumbs) out.push(n);
  return out;
}
