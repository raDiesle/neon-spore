import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the third page** — THE WELL's four,
 * THE GIMBAL's ten and THE BELLOWS's sixteen.
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
  // THE GIMBAL's ten are one family read above the loop, the way THE
  // FILAMENT's are: the kick of a tooth coming off, the shake of a ring that
  // lost true, the glare of the seam landing, and every burst, are
  // `effects.boss.gimbal`'s (`gimbal-fx.ts`). Where each ring stands, where
  // its mark is this beat, how many teeth are left and whether the seam is
  // leaking stay read off the boss every frame — a burst that outlived the
  // frame would be a second answer to *is it true* beside the rim the thumb
  // is on (`gimbal-draw.ts`, `docs/spec/bosses.md` §11.34).
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
  // THE BELLOWS's sixteen are one family read above the loop, the way THE
  // GIMBAL's are: the shudder of a jam, the jolt of a seam letting go, the
  // glare of the vent and every burst are `effects.boss.bellows`'s
  // (`bellows-fx.ts`). Which seat the lung is waiting on, how deep each
  // handle has been carried, how many seams are left and whether a spark is
  // leaking stay read off the boss every frame — a mark that outlived the
  // frame would be a second answer to *whose beat is it* beside the two
  // handles themselves (`bellows-draw.ts`, `docs/spec/bosses.md` §11.35).
  "bellowsEnter",
  "bellowsMarks",
  "bellowsPulled",
  "bellowsSeam",
  "bellowsJam",
  "bellowsLate",
  "bellowsSpark",
  "bellowsSparkOut",
  "bellowsSparkHit",
  "bellowsBreath",
  "bellowsGlow",
  "bellowsGrip",
  "bellowsSplit",
  "bellowsHold",
  "bellowsVent",
  "bellowsOut",
  // THE SPOOL's eleven, silent until the look lane: the line's length, the
  // zone under it, the brake's depth and the four ribs are all read off the
  // boss every frame, and the three the picture will want to keep — the slip,
  // the rib easing and the drift — are one family for spool-fx.ts rather
  // than rows here (`docs/spec/bosses.md` §11.36).
  "spoolEnter",
  "spoolZone",
  "spoolLeg",
  "spoolGrip",
  "spoolLet",
  "spoolSlip",
  "spoolRock",
  "spoolRib",
  "spoolSlack",
  "spoolDrift",
  "spoolOut",
  // THE HASP's fourteen, silent because nothing has drawn them yet: this is
  // the simulation lane, and the door, its clasps, the latch and the wheel
  // are not on any screen until the look lane lands (`docs/spec/bosses.md`
  // §11.37). Most of them will stay here when it does, for THE BELLOWS's
  // reason above — how far the wheel has gone round, how hot the latch is,
  // how many clasps are left and whether a bolt is loose are all read off
  // the boss every frame, and a mark that outlived the frame would be a
  // second answer to a question the picture is already answering.
  "haspEnter",
  "haspLit",
  "haspGrip",
  "haspLet",
  "haspBurn",
  "haspCool",
  "haspSeize",
  "haspFree",
  "haspOpen",
  "haspBolt",
  "haspBoltOut",
  "haspBoltHit",
  "haspClear",
  "haspOut",
] as const satisfies readonly SimEvent["type"][];
