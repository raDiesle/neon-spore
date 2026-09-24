import { CHOREO_FIELD_GROUP_C } from "./ship-fields-choreo-c.js";
import type { GroupName } from "./ship-groups.js";

/**
 * **The choreographed bosses' dials, the second page** — THE LEDGER and
 * every boss built after it.
 *
 * Cut out of `ship-fields-choreo.ts` on 17 September 2026 when THE LEAD's
 * twelve numbers put that file at 240 lines and the next boss's dozen would
 * have landed on the 250-line wall, along the seam that file was itself cut
 * off `ship-fields-round.ts` on: the order they were built in, which nothing
 * depends on. Spread into `CHOREO_FIELD_GROUP` in place, so the
 * exhaustiveness check over `ROUND_FIELD_GROUP` is unchanged — a `SimConfig`
 * field missing from *any* page is still a compile error there. The next
 * boss's block goes here, and the one that takes this page past 250 opens a
 * third.
 */
export const CHOREO_FIELD_GROUP_B = {
  // LedgerConfig — how wide the body is, how many hits part the seam, how
  // long a return takes down the cord and how short that gets, the root, when
  // the whip starts, how far the socket walks, THE SLOW and the parting
  // (`config-ledger.ts`).
  ledgerCols: "THE LEDGER — the boss that bills your own hull for every shot",
  ledgerSeamHits: "THE LEDGER — the boss that bills your own hull for every shot",
  ledgerCadenceBeats: "THE LEDGER — the boss that bills your own hull for every shot",
  ledgerCadenceMinBeats: "THE LEDGER — the boss that bills your own hull for every shot",
  ledgerRootBeats: "THE LEDGER — the boss that bills your own hull for every shot",
  ledgerWhipSeam: "THE LEDGER — the boss that bills your own hull for every shot",
  ledgerSocketStep: "THE LEDGER — the boss that bills your own hull for every shot",
  ledgerSlowBeats: "THE LEDGER — the boss that bills your own hull for every shot",
  ledgerOutBeats: "THE LEDGER — the boss that bills your own hull for every shot",
  ledgerPlugBeats: "THE LEDGER — the boss that bills your own hull for every shot",
  ledgerHaulMilli: "THE LEDGER — the boss that bills your own hull for every shot",
  // SinewConfig — how many fibres, how far a handle pulls, how wide the band
  // is and how much it narrows per fibre, where it can sit, how long a hold
  // takes, how long a snap throws the hands off, how far apart both hands
  // catch the swing it leaves, and how many rocks it sheds,
  // where the mass hangs and how wide it is, when the slack starts and how
  // fast it creeps, THE SLOW on a part, the fall, the sway, the columns that
  // count as clear and how long it holds the wave after (`config-sinew.ts`).
  sinewFibres: "THE SINEW — the boss that asks how hard, not when",
  sinewReachMilli: "THE SINEW — the boss that asks how hard, not when",
  sinewZoneMilli: "THE SINEW — the boss that asks how hard, not when",
  sinewZoneNarrowMilli: "THE SINEW — the boss that asks how hard, not when",
  sinewZoneLowMilli: "THE SINEW — the boss that asks how hard, not when",
  sinewHoldBeats: "THE SINEW — the boss that asks how hard, not when",
  sinewSnapBeats: "THE SINEW — the boss that asks how hard, not when",
  sinewCatchMilli: "THE SINEW — the boss that asks how hard, not when",
  sinewSnapRocks: "THE SINEW — the boss that asks how hard, not when",
  sinewSnapRocksLast: "THE SINEW — the boss that asks how hard, not when",
  sinewMassRow: "THE SINEW — the boss that asks how hard, not when",
  sinewMassCols: "THE SINEW — the boss that asks how hard, not when",
  sinewDecayFibres: "THE SINEW — the boss that asks how hard, not when",
  sinewDecayMilli: "THE SINEW — the boss that asks how hard, not when",
  sinewPartSlowBeats: "THE SINEW — the boss that asks how hard, not when",
  sinewFallBeats: "THE SINEW — the boss that asks how hard, not when",
  sinewSwayMilli: "THE SINEW — the boss that asks how hard, not when",
  sinewClearCols: "THE SINEW — the boss that asks how hard, not when",
  sinewOutBeats: "THE SINEW — the boss that asks how hard, not when",
  // SurgeConfig — how many notches, what a thumb charges and a beat leaks,
  // where the top of the gauge is, where each notch sits and how wide its
  // band is, from which notch it holds, doubles and closes, what a burst
  // throws and for how long nothing takes hold, where the bulb hangs and how
  // wide it is, THE SLOW on the band and the eversion, and how long the wave
  // holds after (`config-surge.ts`).
  surgeNotches: "THE SURGE — the boss beaten by letting go",
  surgeChargeMilli: "THE SURGE — the boss beaten by letting go",
  surgeDecayMilli: "THE SURGE — the boss beaten by letting go",
  surgeBurstMilli: "THE SURGE — the boss beaten by letting go",
  surgeNotchMilli: "THE SURGE — the boss beaten by letting go",
  surgeNotchStepMilli: "THE SURGE — the boss beaten by letting go",
  surgeWindowMilli: "THE SURGE — the boss beaten by letting go",
  surgeHoldNotches: "THE SURGE — the boss beaten by letting go",
  surgeDoubleNotches: "THE SURGE — the boss beaten by letting go",
  surgeCloseNotches: "THE SURGE — the boss beaten by letting go",
  surgeAbsorbMilli: "THE SURGE — the boss beaten by letting go",
  surgeBurstGums: "THE SURGE — the boss beaten by letting go",
  surgeBurstBeats: "THE SURGE — the boss beaten by letting go",
  surgeRockNotches: "THE SURGE — the boss beaten by letting go",
  surgeRockBeats: "THE SURGE — the boss beaten by letting go",
  surgeBulbRow: "THE SURGE — the boss beaten by letting go",
  surgeBulbCols: "THE SURGE — the boss beaten by letting go",
  surgeNearSlowBeats: "THE SURGE — the boss beaten by letting go",
  surgeEvertBeats: "THE SURGE — the boss beaten by letting go",
  surgeOutBeats: "THE SURGE — the boss beaten by letting go",
  // LeadConfig — how many segments, how long a shot hangs, the three paces,
  // from which segment it runs and from which the lean says the turn early,
  // how long the last still is, the run's two cadences, THE SLOW on the
  // judged beat, and how long the wave holds after (`config-lead.ts`).
  leadSegments: "THE LEAD — the boss you shoot where it will be",
  leadFlightBeats: "THE LEAD — the boss you shoot where it will be",
  leadPaceCols: "THE LEAD — the boss you shoot where it will be",
  leadFastCols: "THE LEAD — the boss you shoot where it will be",
  leadPassCols: "THE LEAD — the boss you shoot where it will be",
  leadFastSegments: "THE LEAD — the boss you shoot where it will be",
  leadForecastSegments: "THE LEAD — the boss you shoot where it will be",
  leadStillBeats: "THE LEAD — the boss you shoot where it will be",
  leadHoldBeats: "THE LEAD — the boss you shoot where it will be",
  leadTorchEveryBeats: "THE LEAD — the boss you shoot where it will be",
  leadRockEveryBeats: "THE LEAD — the boss you shoot where it will be",
  leadStillFills: "THE LEAD — the boss you shoot where it will be",
  leadOutBeats: "THE LEAD — the boss you shoot where it will be",
  // ScuttleConfig — the frame's size and how many of its parts are pods, the
  // look before the first throw, the two cadences and the counts they switch
  // on, what a pod taken and the beam's priming buy, where a pod hangs, THE
  // SLOW on the wind-up and how long the wave holds after, and how far the
  // pilot must carry a hanging part before it swings a column
  // (`config-scuttle.ts`).
  scuttleRows: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttleCols: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttlePods: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttleLookBeats: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttleThrowBeats: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttleFastBeats: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttleTwinParts: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttleFastParts: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttlePodSlackBeats: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttleWindSlackBeats: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttlePodRow: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttleSlowBeats: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttleOutBeats: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  scuttleSwingMilli: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  // AntiphonConfig — the table of contours and the families it is cut into,
  // how many pits end it, the growth and the two windows, the rail and its
  // widest, the pit counts every escalation switches on, the rest, the still,
  // the rail of ships, how long the wave holds after, how long a turn of the
  // organ takes under a resting thumb, and how far down a candidate must be
  // carried to be crossed off the rail (`config-antiphon.ts`).
  antiphonShapes: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonFamily: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonPits: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonGrowBeats: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonWindowBeats: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonTightWindowBeats: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonRail: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonRailMax: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonTightPits: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonSpillPits: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonTwinPits: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonFirePits: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonEchoPits: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonRestBeats: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonStillBeats: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonShipRail: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonOutBeats: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonTurnBeats: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  antiphonPullMilli: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  // HiveConfig — how many sites, the look before the first opens and the
  // cadence after, the swell's warning, the spill's cadence, the opening
  // twins come from, what a wrong colour provokes, the clench's count and
  // clock and the two thumbs that answer the mass itself, THE SLOW on the
  // last seal and how long the wave holds after (`config-hive.ts`).
  hiveSites: "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveLookBeats:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveOpenBeats:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveSwellBeats:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveSpillBeats:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveTwinFrom:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveProvokeBeats:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveClenchEvery:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveClenchBeats:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hivePinchBeats:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveHaulMilli:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveSlowBeats:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  hiveOutBeats:
    "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  // InstarConfig — how close two seats' answers must be to be together, how
  // far a swipe carries before it counts, THE SLOW over the fall and how
  // long the body hangs after (`config-instar.ts`). A step's own window is
  // THE SLOW too, but it is the script's clock rather than a dial here
  // (`decisions.md` #33). The clocks of every step are the script's own.
  instarTogetherBeats:
    "THE INSTAR — the boss with no panel: its own body is marked where it will hurt you",
  instarSwipeMilli:
    "THE INSTAR — the boss with no panel: its own body is marked where it will hurt you",
  instarSlowBeats:
    "THE INSTAR — the boss with no panel: its own body is marked where it will hurt you",
  instarOutBeats:
    "THE INSTAR — the boss with no panel: its own body is marked where it will hurt you",
  // FilamentConfig — the gap the navigator may fall behind, the arm before
  // the thumbs count, the pull after a filament is traced, THE SLOW on the
  // last and how long the body hangs after (`config-filament.ts`).
  filamentGapTiles:
    "THE FILAMENT — the boss whose line one of you draws while the other follows it",
  filamentArmBeats:
    "THE FILAMENT — the boss whose line one of you draws while the other follows it",
  filamentPullBeats:
    "THE FILAMENT — the boss whose line one of you draws while the other follows it",
  filamentSlowBeats:
    "THE FILAMENT — the boss whose line one of you draws while the other follows it",
  filamentOutBeats:
    "THE FILAMENT — the boss whose line one of you draws while the other follows it",
  // GimbalConfig — how near a mark reads as true, how long both rings must
  // hold it, how fast a ring nobody holds falls back, and the five counts the
  // scene is paced by (`config-gimbal.ts`).
  gimbalTrueMilli: "THE GIMBAL — the boss where the same turn is not the same turn",
  gimbalHoldBeats: "THE GIMBAL — the boss where the same turn is not the same turn",
  gimbalDriftMilli: "THE GIMBAL — the boss where the same turn is not the same turn",
  gimbalStillBeats: "THE GIMBAL — the boss where the same turn is not the same turn",
  gimbalShearBeats: "THE GIMBAL — the boss where the same turn is not the same turn",
  gimbalSlowBeats: "THE GIMBAL — the boss where the same turn is not the same turn",
  gimbalSeamBeats: "THE GIMBAL — the boss where the same turn is not the same turn",
  gimbalOpenBeats: "THE GIMBAL — the boss where the same turn is not the same turn",
  // BellowsConfig — how far a handle travels, the depth a stroke counts at,
  // how long each phase holds, the one shared window, the spark's patience
  // and how far the two chambers hang off the waist (`config-bellows.ts`).
  bellowsReachMilli: "THE BELLOWS — the boss where you may never push while they are pulling",
  bellowsWorkMilli: "THE BELLOWS — the boss where you may never push while they are pulling",
  bellowsStillBeats: "THE BELLOWS — the boss where you may never push while they are pulling",
  bellowsJamBeats: "THE BELLOWS — the boss where you may never push while they are pulling",
  bellowsSeamBeats: "THE BELLOWS — the boss where you may never push while they are pulling",
  bellowsWindowBeats: "THE BELLOWS — the boss where you may never push while they are pulling",
  bellowsSparkBeats: "THE BELLOWS — the boss where you may never push while they are pulling",
  bellowsSlowBeats: "THE BELLOWS — the boss where you may never push while they are pulling",
  bellowsVentBeats: "THE BELLOWS — the boss where you may never push while they are pulling",
  bellowsChamberCols: "THE BELLOWS — the boss where you may never push while they are pulling",
  // THE SPOOL and everything after it (`ship-fields-choreo-c.ts`).
  ...CHOREO_FIELD_GROUP_C,
} satisfies Record<string, GroupName>;
