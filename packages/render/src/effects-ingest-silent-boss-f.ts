import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the sixth page: two choreographed
 * bosses** — THE SURGE and THE LEAD (`docs/spec/bosses-choreographed.md`
 * §9, §11).
 *
 * Moved off page one on 7 October 2026, with page one at 243 lines, the
 * last two bosses on it, by build order — never the boss being worked on.
 * The not-a-burst list's sixth page took the same bosses, and THE SCUTTLE
 * after them, on the same day (`effects-spark-silent-boss-f.ts`).
 *
 * `INGEST_SILENT` spreads this in place after page five, so every row still
 * means *this event leaves nothing behind for the next frame*.
 */
export const INGEST_SILENT_BOSS_F = [
  // THE SURGE's thirteen are read as one family above the loop by
  // `surge-fx.ts` (`Effects.surge`), the way THE SINEW's are: a burst per
  // event at the bulb or the grip, the sink and the jet on a vent, the jolt
  // on a burst.
  "surgeSettle",
  "surgeGrip",
  "surgeRelease",
  "surgeNear",
  "surgeVent",
  "surgeBurst",
  "surgeGum",
  "surgeRock",
  "surgeLost",
  "surgeAbsorb",
  "surgeClose",
  "surgeEvert",
  "surgeOut",
  // THE LEAD's seventeen are read as one family above the loop by
  // `lead-fx.ts` (`Effects.lead`), the way THE SURGE's are: a burst per
  // event at the foot or the column, the whip on a doubling back, the bead
  // that tumbles off on a hit (`docs/spec/bosses.md` §11.29).
  "leadEnter",
  "leadPace",
  "leadTurn",
  "leadFlight",
  "leadHit",
  "leadMiss",
  "leadReverse",
  "leadTorch",
  "leadRock",
  "leadStill",
  "leadGrip",
  "leadRelease",
  "leadTear",
  "leadPass",
  "leadWall",
  "leadDown",
  "leadOut",
  "tether",
  "eyeOpen",
  "wardenDown",
  "mazeCommit",
  "mazeProbe",
  "mazeVerdict",
  "mazeDown",
  // THE BASTION's fourteen are read as one family above the loop by
  // `bastion-fx.ts` (`Effects.boss.bastion`), the way THE LATCH's are: a
  // burst at the plate, the gun, the node or the port, a torn plate flung
  // off, the lightning, and the shudder as a shell comes away.
  "bastionEnter",
  "bastionLayer",
  "bastionTear",
  "bastionSnap",
  "bastionWrong",
  "bastionGun",
  "bastionCharge",
  "bastionBurst",
  "bastionArc",
  "bastionPort",
  "bastionShed",
  "bastionRegrow",
  "bastionSpent",
  "bastionOut",
] as const satisfies readonly SimEvent["type"][];
