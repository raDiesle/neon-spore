import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the second page** — from THE
 * ANTIPHON on.
 *
 * Cut when THE ANTIPHON's ten rows would have put
 * `effects-ingest-silent-boss.ts` over its 250-line limit, the seam the
 * first page itself was cut on: the order the bosses were built in.
 * `INGEST_SILENT` spreads this in place after the first page, so the guard
 * and the type it narrows by are unchanged.
 *
 * Every row means what it means there — *this event leaves nothing behind
 * for the next frame* — and the reasons stay with the rows.
 */
export const INGEST_SILENT_BOSS_B = [
  // THE ANTIPHON's ten leave nothing behind for the next frame here: the
  // body, the organs, the rail and the pits are read off the state every
  // frame, and what outlives a frame — the eruption of every pit — and the
  // bursts are one family read above the loop by `antiphon-fx.ts`, never
  // rows here (`docs/spec/bosses.md` §11.31).
  "antiphonEnter",
  "antiphonGrow",
  "antiphonPit",
  "antiphonHarden",
  "antiphonSink",
  "antiphonSpill",
  "antiphonStill",
  "antiphonShip",
  "antiphonBurst",
  "antiphonOut",
  // THE HIVE's nine: a breach open or sealed and the swell before one opens
  // are read off the boss every frame, and the bursts, the clench and the
  // jolt are `hive-fx.ts`'s, read above the loop as one family the way THE
  // SCUTTLE's are (`docs/spec/bosses.md` §11.14).
  "hiveEnter",
  "hiveSwell",
  "hiveOpen",
  "hiveSpill",
  "hiveSkin",
  "hiveWrong",
  "hiveSeal",
  "hiveDown",
  "hiveOut",
  // THE INSTAR's eleven: the pose, the marks and how far each has got are
  // read off the boss every frame, and the bursts, the jolt, the flinch and
  // the lash are `instar-fx.ts`'s, read above the loop as one family the
  // way THE HIVE's are (`docs/spec/bosses.md` §11.32).
  "instarEnter",
  "instarMorph",
  "instarShow",
  "instarRefuse",
  "instarAnswer",
  "instarDone",
  "instarSlip",
  "instarLand",
  "instarStrike",
  "instarDown",
  "instarOut",
  // THE FILAMENT's ten are silent **until the look lane draws them**: the
  // lit tiles, the two thumbs and the gap are read off the boss every frame,
  // and the snap, the recoil and the dark will be a family of their own
  // read above the loop (`docs/spec/bosses.md` §11.33).
  "filamentEnter",
  "filamentArm",
  "filamentDrawn",
  "filamentFollowed",
  "filamentSnap",
  "filamentRecoil",
  "filamentDark",
  "filamentPulled",
  "filamentDown",
  "filamentOut",
] as const satisfies readonly SimEvent["type"][];
