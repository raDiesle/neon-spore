import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the not-a-burst list, the fourth page** — THE CYST's
 * seventeen, THE DAVIT's thirteen, and THE KEEL's story beats.
 *
 * Cut off `effects-spark-silent-boss-c.ts` on 26 September 2026, when THE
 * KEEL's flip, marrow and cooldown arrived with eight and page three stood at
 * 246 lines. The seam is the one every page of this list is cut on: the
 * **last** bosses on the full page are handed across whole, with their own
 * comments, and the boss being worked on stays under the comment that argues
 * it — its story beats open this page only because its first sixteen stay
 * where they are.
 *
 * `SILENT` spreads this in place after page three, so `isSilent` still
 * narrows and `burstFor`'s `assertNever` still catches an event named on
 * neither.
 */
export const SILENT_BOSS_D = [
  // THE KEEL's story beats, no burst from this table: the flip, the marrow,
  // the breath and the cooldown are read off the state each frame
  // (`render/src/keel-story.ts`); the held breath's flare is `keel-fx.ts`'.
  "keelFlip",
  "keelArrest",
  "keelSnap",
  "keelMarrow",
  "keelSeal",
  "keelBurn",
  "keelCool",
  "keelFlare",
  "keelBreath",
  "keelStir",
  "keelHeld",
  // THE SEAM's two steps that ask for nothing, landed after page three
  // filled: the false point and the dark are read off the lit step each
  // frame (`seam-hold.ts`); the reseal's flash is `seam-fx.ts`', read above
  // the loop.
  "seamBaited",
  "seamFade",
  "seamReseal",
  // THE PLUMB's bleed, landed after page three filled: how far the light has
  // bled is read off the state each frame (`sim/plumb-bleed.ts`).
  "plumbBleed",
  "plumbFlare",
  // THE CYST's seventeen, no burst from this table: each is thrown above the
  // loop by its own fx file (`cyst-fx.ts`).
  "cystEnter",
  "cystLight",
  "cystStill",
  "cystShudder",
  "cystSlip",
  "cystCrack",
  "cystSpring",
  "cystBare",
  "cystHit",
  "cystGuard",
  "cystSeal",
  "cystMiss",
  "cystClench",
  "cystTurn",
  "cystPop",
  "cystSplit",
  "cystOut",
  // THE DAVIT's thirteen, the same (`packages/audio/src/bind-davit.ts`).
  "davitEnter",
  "davitLight",
  "davitDrift",
  "davitSlack",
  "davitLoose",
  "davitSway",
  "davitPivot",
  "davitHit",
  "davitReland",
  "davitDim",
  "davitMiss",
  "davitSpent",
  "davitOut",
  // THE HALTER's fourteen, the same (`packages/audio/src/bind-halter.ts`).
  "halterEnter",
  "halterLight",
  "halterSettle",
  "halterStartle",
  "halterSlip",
  "halterCrack",
  "halterBare",
  "halterGuard",
  "halterShut",
  "halterSeal",
  "halterHit",
  "halterMiss",
  "halterSplit",
  "halterOut",
  // THE CAPSTAN's fourteen, no burst from this table: each is thrown above the
  // loop by its own fx file (`capstan-fx.ts`).
  "capstanEnter",
  "capstanLight",
  "capstanRock",
  "capstanDrift",
  "capstanWear",
  "capstanBright",
  "capstanBare",
  "capstanKept",
  "capstanStall",
  "capstanCover",
  "capstanHit",
  "capstanMiss",
  "capstanOpen",
  "capstanOut",
  // THE GALL's eleven, no burst from this table: each is thrown above the
  // loop by its own fx file (`gall-fx.ts`).
  "gallEnter",
  "gallLight",
  "gallPress",
  "gallSlip",
  "gallClose",
  "gallSwell",
  "gallBare",
  "gallHit",
  "gallMiss",
  "gallFlat",
  "gallOut",
  // THE TRAPEZE's thirteen, no burst from this table: each is thrown above the
  // loop by its own fx file (`trapeze-fx.ts`).
  "trapezeEnter",
  "trapezeLevel",
  "trapezeCall",
  "trapezePush",
  "trapezeBrake",
  "trapezeWhiff",
  "trapezeLock",
  "trapezeUnlock",
  "trapezeShot",
  "trapezeGong",
  "trapezeMiss",
  "trapezeSpent",
  "trapezeOut",
  // THE FLUE's six, no burst from this table: each is thrown above the
  // loop by its own fx file (`flue-fx.ts`).
  "flueEnter",
  "flueLight",
  "flueHit",
  "flueMiss",
  "flueSpent",
  "flueOut",
  // THE VALVE's story between the pins: what the drum does is read off its
  // phase (`valve-story.ts`), and each burst is thrown above the loop by
  // `valve-fx-story.ts`, through the drum's own fx.
  "valveJet",
  "valveCap",
  "valveBlow",
  "valveShudder",
  "valveBrace",
  "valveShake",
  "valveFilm",
  "valveRub",
  "valveDry",
  "valveSmear",
  "valveStrain",
  "valveSeal",
  "valveRough",
  // THE RATCHET's story between the teeth: what the rack does is read off its
  // phase (`ratchet-story.ts`), and each burst is thrown above the loop by
  // `ratchet-fx-story.ts`, through the rack's own fx.
  "ratchetSlip",
  "ratchetBite",
  "ratchetDrop",
  "ratchetKick",
  "ratchetSeat",
  "ratchetFly",
  "ratchetBind",
  "ratchetMesh",
  "ratchetShake",
  "ratchetWind",
  "ratchetWound",
  "ratchetUnwind",
  // THE HASP's story between the hasps: what the door does is read off its
  // phase (`hasp-story.ts`), and each burst is thrown above the loop by
  // `hasp-fx-story.ts`, through the door's own fx.
  "haspRattle",
  "haspHush",
  "haspSlam",
  "haspBackspin",
  "haspCatch",
  "haspSpoke",
  "haspRust",
  "haspCrack",
  "haspBurst",
  "haspSway",
  "haspSteady",
  "haspRough",
  // THE GOVERNOR's twelve, no burst from this table: each is thrown above
  // the loop by its own fx file (`governor-fx.ts`).
  "governorEnter",
  "governorLight",
  "governorTick",
  "governorSkid",
  "governorHub",
  "governorRetap",
  "governorSway",
  "governorDim",
  "governorHit",
  "governorMiss",
  "governorSpent",
  "governorOut",
  // THE BULB QUEEN's three verdicts throw no burst: the mark answers under
  // the thumb in a ring (`queen-fx.ts`), and a burst over her is on both
  // screens where the ring is not.
  "queenPry",
  "queenHold",
  "queenRefuse",
  // THE MIRROR's lobe verdicts, the same: a step on a lobe, and a press from
  // the seat the lobe is not asked of, each a ring round it (`mirror-grip.ts`).
  "mirrorTouch",
  "mirrorRefuse",
  // THE VANE's press from the wrong seat, the same: a ring round the arm or
  // the housing, `effects.boss.vane`'s (`vane-marks.ts`).
  "vaneRefuse",
  // And THE MAZE's, on the heart or the string: a ring round the part,
  // `effects.boss.maze`'s (`maze-grip-fx.ts`, `maze-marks.ts`).
  "mazeRefuse",
] as const satisfies readonly SimEvent["type"][];
