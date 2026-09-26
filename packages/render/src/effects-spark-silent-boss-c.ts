import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the not-a-burst list, the third page** — THE GAUGE's
 * four, THE WELL's four and THE RATCHET's twelve.
 *
 * Cut off `effects-spark-silent-boss-b.ts` on 22 September 2026, when THE
 * SPOOL's eleven and THE HASP's fourteen landed on that page in one sitting
 * and left it two lines under its 250-line limit. The seam is the one every
 * page of this list is cut on: the **last** bosses on the full page are
 * handed across whole, with their own comments, and the boss being worked on
 * stays under the comment that argues it.
 *
 * `SILENT` spreads this in place after page two, so `isSilent` still narrows
 * and `burstFor`'s `assertNever` still catches an event named on neither.
 */
export const SILENT_BOSS_C = [
  // THE GAUGE's four, the first events this round has had at all: no burst,
  // because a mark, a miss, a jam and a bind are every one of them a state the
  // plate already redraws every frame (`render/gauge.ts`). Sound is what was
  // missing, and it is bound instead (`packages/audio/src/bind-gauge.ts`).
  "gaugeMark",
  "gaugeMiss",
  "gaugeJam",
  "gaugeBind",
  // THE WELL's four, no burst: the face, its seam and its numerals are redrawn
  // from the boss every frame, and a shower over a clock whose whole job is to
  // agree with the thumb on it would be a look (`docs/looks.md`). Sound is
  // what these four get instead (`packages/audio/src/bind-well.ts`).
  "wellRoll",
  "wellHeld",
  "wellWound",
  "wellHome",
  // THE RATCHET's twelve, no burst from this table: they are read above the
  // loop by `ratchet-fx.ts`, THE HASP's way, because a set and a let-go burst
  // on the catch's screens alone and a table row cannot ask whose screen it
  // is. A burnt tooth throws nothing anywhere — §22's one silence.
  "ratchetEnter",
  "ratchetLit",
  "ratchetSet",
  "ratchetLet",
  "ratchetClick",
  "ratchetBurn",
  "ratchetBolt",
  "ratchetBoltOut",
  "ratchetBoltHit",
  "ratchetOpen",
  "ratchetJam",
  "ratchetOut",
  // THE GORGE's and THE TASTER's first halves, landed after their pages
  // filled: no burst from this table, because each boss's bursts are read
  // above the loop by its own fx file (`gorge-fx.ts`, `taster-fx.ts`).
  "gorgeNick",
  "gorgePryFill",
  "tasterPryFill",
  // THE MANTLE's ten, no burst from this table: each is thrown above the loop
  // by its own fx file (`mantle-fx.ts`).
  "mantleEnter",
  "mantleLight",
  "mantleShear",
  "mantleSplit",
  "mantleLeak",
  "mantleSparkOut",
  "mantleSparkHit",
  "mantleBeat",
  "mantleDark",
  "mantleOut",
  // THE MANTLE's brace before the last pair: its look is read off the
  // world each frame (`mantle-brace.ts`), and nothing of it outlives one.
  "mantleGlow",
  "mantleSlip",
  "mantleSteady",
  "mantleLapse",
  "mantleBuckle",
  "mantleFlat",
  "mantleVent",
  "mantleSeal",
  "mantleCross",
  "mantleTurn",
  "mantleSwing",
  "mantleTurned",
  // THE KEEL's sixteen, no burst from this table: each is thrown above the
  // loop by its own fx file (`keel-fx.ts`).
  "keelEnter",
  "keelLight",
  "keelLock",
  "keelMiss",
  "keelSlip",
  "keelSplit",
  "keelSocket",
  "keelShut",
  "keelSocketHit",
  "keelDim",
  "keelRigid",
  "keelThrow",
  "keelRockOut",
  "keelRockHit",
  "keelStraight",
  "keelOut",
  // THE VALVE's thirteen, the same (`packages/audio/src/bind-valve.ts`).
  "valveEnter",
  "valveLight",
  "valveHold",
  "valveSlip",
  "valveLapse",
  "valveFreeze",
  "valveThaw",
  "valvePull",
  "valveSpark",
  "valveSparkOut",
  "valveSparkHit",
  "valveOpen",
  "valveOut",
  // THE SEAM's ten, the same (`packages/audio/src/bind-seam.ts`).
  "seamEnter",
  "seamLight",
  "seamDim",
  "seamQuench",
  "seamSeal",
  "seamRockOut",
  "seamBlock",
  "seamMiss",
  "seamSplit",
  "seamOut",
  // THE OCULUS's fourteen, no burst from this table: each is thrown above the
  // loop by its own fx file (`oculus-fx.ts`).
  "oculusEnter",
  "oculusLight",
  "oculusSlip",
  "oculusShut",
  "oculusSpring",
  "oculusBreak",
  "oculusHit",
  "oculusReseal",
  "oculusSwallow",
  "oculusBlock",
  "oculusGlance",
  "oculusMiss",
  "oculusShatter",
  "oculusOut",
  // THE VISE's fourteen, no burst from this table: each is thrown above the
  // loop by its own fx file (`vise-fx.ts`).
  "viseEnter",
  "viseLight",
  "viseSlip",
  "viseCrack",
  "viseSpring",
  "viseBare",
  "viseHit",
  "viseBrace",
  "viseCover",
  "viseBlock",
  "viseSeedBurst",
  "viseMiss",
  "viseSplit",
  "viseOut",
  // THE RIME's twelve, the same (`packages/audio/src/bind-rime.ts`).
  "rimeEnter",
  "rimeLight",
  "rimeShave",
  "rimeClear",
  "rimeFrost",
  "rimeBare",
  "rimeHit",
  "rimeBlock",
  "rimeCloud",
  "rimeMiss",
  "rimeShatter",
  "rimeOut",
  // THE TRIVET's twelve, the same (`packages/audio/src/bind-trivet.ts`).
  "trivetEnter",
  "trivetLight",
  "trivetSlip",
  "trivetPlant",
  "trivetSpring",
  "trivetHub",
  "trivetHit",
  "trivetBrace",
  "trivetRock",
  "trivetMiss",
  "trivetCollapse",
  "trivetOut",
  // THE PLUMB's twelve, the same (`packages/audio/src/bind-plumb.ts`).
  "plumbEnter",
  "plumbLight",
  "plumbDrift",
  "plumbSettle",
  "plumbSwing",
  "plumbCore",
  "plumbHit",
  "plumbSteady",
  "plumbDim",
  "plumbMiss",
  "plumbFree",
  "plumbOut",
  // THE SLING's twelve, the same (`packages/audio/src/bind-sling.ts`).
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
  "slingFree",
  "slingOut",
  // THE GRINDSTONE's thirteen, the same (`packages/audio/src/bind-grindstone.ts`).
  "grindstoneEnter",
  "grindstoneLight",
  "grindstoneShave",
  "grindstoneClear",
  "grindstoneRegrit",
  "grindstoneBite",
  "grindstoneSlip",
  "grindstoneClamp",
  "grindstoneLoose",
  "grindstoneHit",
  "grindstoneMiss",
  "grindstoneFree",
  "grindstoneOut",
] as const satisfies readonly SimEvent["type"][];
