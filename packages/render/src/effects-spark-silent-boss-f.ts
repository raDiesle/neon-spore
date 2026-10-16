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
  // THE CHRYSALIS's fifteen are read as one family above the loop by
  // `chrysalis-fx.ts` (`Effects.boss.chrysalis`), the way THE BASTION's are:
  // a burst at the half, the quill, the sac or the pore, a quill flung off,
  // the slime dropping, the spores, and the shudder as a skin peels.
  "chrysalisEnter",
  "chrysalisSkin",
  "chrysalisRub",
  "chrysalisWipe",
  "chrysalisRip",
  "chrysalisSnap",
  "chrysalisWrong",
  "chrysalisSwell",
  "chrysalisBurst",
  "chrysalisSpray",
  "chrysalisHeart",
  "chrysalisShed",
  "chrysalisRegrow",
  "chrysalisSpent",
  "chrysalisOut",
  // THE HYDRA's seventeen are read as one family above the loop by
  // `hydra-fx.ts` (`Effects.boss.hydra`), the way THE CHRYSALIS's are: a
  // burst at the head, a head cut off falling, a coil dropping, the steam off
  // a maw, the lunge, and the shudder as a level is stopped.
  "hydraEnter",
  "hydraHeads",
  "hydraCut",
  "hydraGlance",
  "hydraLap",
  "hydraUncoil",
  "hydraOpen",
  "hydraBlink",
  "hydraPoke",
  "hydraMiss",
  "hydraMaw",
  "hydraQuench",
  "hydraWrong",
  "hydraCleared",
  "hydraStrike",
  "hydraSpent",
  "hydraOut",
  // THE BROOD's eight are read above the loop by `brood-fx.ts`
  // (`Effects.boss.brood`), THE GORGE's way: a pop's splash, a snapped
  // stalk, the hide's grit, and the blow as it is beaten.
  "broodEnter",
  "broodBud",
  "broodPop",
  "broodDrop",
  "broodSpoil",
  "broodHide",
  "broodSpent",
  "broodOut",
  // THE MATRON's seven are read above the loop by `matron-fx.ts`
  // (`Effects.boss.matron`), THE BROOD's way: a lobe springing back, her
  // lean toward a throw, and the blow as a pod is swallowed and as she is beaten.
  "matronEnter",
  "matronHang",
  "matronThrow",
  "matronLobe",
  "matronCleared",
  "matronSpent",
  "matronOut",
  // THE GEODE's nine are drawn by nothing yet: its look is the second lane
  // (`docs/spec/bosses.md` §11.66), and until it lands they leave nothing
  // behind for the next frame and burst nowhere.
  "geodeEnter",
  "geodeCracks",
  "geodeCleave",
  "geodeChip",
  "geodeWrong",
  "geodeSplit",
  "geodeStrike",
  "geodeShatter",
  "geodeOut",
] as const satisfies readonly SimEvent["type"][];
