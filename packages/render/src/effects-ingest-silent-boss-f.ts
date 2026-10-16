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
  "surgeBlister",
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
