import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the fourth page** — THE SLING's
 * twelve, and the bosses after it.
 *
 * Opened on 26 September 2026 because page three stood at 242 lines and
 * THE SLING arrived with thirteen. Nothing was handed across: the page is cut
 * along the seam every page of this list is cut on, the order the bosses were
 * built in, and the SLING is simply the first boss built after page three
 * filled.
 *
 * `INGEST_SILENT` spreads every page in place, so the guard and the type it
 * narrows by are unchanged, and every row still means what it means there —
 * *this event leaves nothing behind for the next frame*.
 */
export const INGEST_SILENT_BOSS_D = [
  // THE MANTLE's story beats, landed after page three filled: the buckle,
  // the vent, the crosswise crack and the turn are read off the state each
  // frame, and nothing of them outlives one (`sim/mantle-story.ts`).
  "mantleBuckle",
  "mantleFlat",
  "mantleVent",
  "mantleSeal",
  "mantleCross",
  "mantleTurn",
  "mantleSwing",
  "mantleTurned",
  // THE KEEL's story beats, landed after page three filled: the flip, the
  // marrow, the breath and the cooldown are read off the state each frame
  // (`render/src/keel-story.ts`); the held breath's flare down every seam is
  // `keel-fx.ts`', read above the loop.
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
  // THE SEAM's glow, landed after page three filled: how much of it is
  // left is read off the state each frame (`sim/seam-shot.ts`).
  "seamQuench",
  // THE OCULUS's glare met and look answered, landed after page three
  // filled: what they draw is read off the state (`sim/oculus-guard.ts`).
  "oculusBlock",
  "oculusGlance",
  // THE VISE's bite met and seed burst, landed after page three filled: what
  // they draw is read off the state (`sim/vise-guard.ts`, `sim/vise-shot.ts`).
  "viseBlock",
  "viseSeedBurst",
  // THE SLING's fourteen: nothing is drawn yet, so nothing outlives a frame
  // (`packages/audio/src/bind-sling.ts`).
  "slingEnter",
  "slingLight",
  "slingSlack",
  "slingLoose",
  "slingSpring",
  "slingYoke",
  "slingHit",
  "slingSteady",
  "slingDim",
  "slingMiss",
  "slingCool",
  "slingSnap",
  "slingFree",
  "slingOut",
  // THE HALTER's fourteen: what outlives a frame is its marks' verdicts,
  // `halter-verdicts.ts`', read above the loop (`packages/audio/src/bind-halter.ts`).
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
  // THE CAPSTAN's fourteen: what outlives a frame is `capstan-fx.ts`', read above
  // the loop; the lean, the wear and the cap's creep stay read off the state.
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
  // THE GALL's ten: what outlives a frame is `gall-fx.ts`', read above the
  // loop; the point, the taps and the flight stay read off the state.
  "gallEnter",
  "gallLight",
  "gallTap",
  "gallWhiff",
  "gallLeap",
  "gallLand",
  "gallHit",
  "gallMiss",
  "gallFlat",
  "gallOut",
  // THE TRAPEZE's thirteen: what outlives a frame is `trapeze-fx.ts`', read
  // above the loop; the swing's place and the gongs stay read off the state.
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
  // THE FLUE's six: what outlives a frame is `flue-fx.ts`', read above the loop.
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
] as const satisfies readonly SimEvent["type"][];
