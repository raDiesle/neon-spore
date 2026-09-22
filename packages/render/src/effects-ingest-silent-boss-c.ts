import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the third page** — THE WELL's four
 * and THE GIMBAL's ten.
 *
 * Cut off `effects-ingest-silent-boss-b.ts` on 22 September 2026 along the
 * seam every page of this list is cut on: the order the bosses were built
 * in, with the *last* boss on the full page handed across whole and its own
 * comment with it. THE GIMBAL is on it as well rather than back on page two,
 * which page two's header argues: four rows moved out and ten were coming
 * in, so the hand-across on its own was not enough room and the alternative
 * was tearing a boss out of the middle of a page.
 *
 * `INGEST_SILENT` spreads all three in place, so the guard and the type it
 * narrows by are unchanged, and every row still means what it means there —
 * *this event leaves nothing behind for the next frame*.
 */
export const INGEST_SILENT_BOSS_C = [
  // THE WELL's four, the first events that boss had: the roll, the hold, the
  // far end and the seam coming home are all read off the state the face is
  // drawn from every frame — the phase, `offsetMilli` and `heldBeats`
  // (`render/well.ts`). The picture *is* the report here, because the whole
  // boss is where the picture puts things, so an effect outliving the frame
  // would be a second face disagreeing with the one under the thumb.
  "wellRoll",
  "wellHeld",
  "wellWound",
  "wellHome",
  // THE GIMBAL's ten, silent **until the look lane draws it**: every one of
  // them is a state the picture already holds. Where each ring stands, where
  // its mark is this beat, how many teeth are left and whether the seam is
  // leaking are all read off the boss every frame, and a burst that outlived
  // the frame would be a second answer to *is it true* beside the rim the
  // thumb is on (`sim/gimbal.ts`, `docs/spec/bosses.md` §11.34).
  "gimbalEnter",
  "gimbalMarks",
  "gimbalTrue",
  "gimbalSlip",
  "gimbalShear",
  "gimbalLeak",
  "gimbalSeamOut",
  "gimbalSeamHit",
  "gimbalHatch",
  "gimbalOut",
] as const satisfies readonly SimEvent["type"][];
