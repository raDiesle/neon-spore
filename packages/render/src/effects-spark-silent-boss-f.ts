import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the not-a-burst list, the sixth page: three
 * choreographed bosses** — THE SURGE, THE LEAD and THE SCUTTLE
 * (`docs/spec/bosses-choreographed.md` §9, §11, §15).
 *
 * Moved off page one on 7 October 2026, with page one at 242 lines, the
 * last three bosses on it, by build order — never the boss being worked
 * on. The ingest list's sixth page took the same bosses on the same day
 * (`effects-ingest-silent-boss-f.ts`).
 *
 * `SILENT` spreads this in place after page five, so `isSilent` still
 * narrows and `burstFor`'s `assertNever` still catches an event named on
 * neither.
 */
export const SILENT_BOSS_F = [
  // THE SURGE's thirteen are one family read above the loop by
  // `surge-fx.ts`, never rows here (`docs/spec/bosses.md` §11.28).
  "surgeSettle",
  "surgeGrip",
  "surgeRelease",
  "surgeNear",
  "surgeVent",
  "surgeBurst",
  "surgeBlister",
  "surgeRock",
  "surgeLost",
  "surgeAbsorb",
  "surgeClose",
  "surgeEvert",
  "surgeOut",
  // THE LEAD's seventeen are one family read above the loop by
  // `lead-fx.ts`, never rows here (`docs/spec/bosses.md` §11.29).
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
  // THE SCUTTLE's ten are one family read above the loop by
  // `scuttle-fx.ts`, never rows here (`docs/spec/bosses.md` §11.30).
  "scuttleEnter",
  "scuttleLoose",
  "scuttleThrow",
  "scuttleStruck",
  "scuttleSwing",
  "scuttleRebuff",
  "scuttleSlack",
  "scuttleWind",
  "scuttleLast",
  "scuttleDown",
  "scuttleOut",
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
