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
  // SinewConfig — how many fibres, how far a handle pulls, how wide the band
  // is and how much it narrows per fibre, where it can sit, how long a hold
  // takes, how long a snap throws the hands off and how many rocks it sheds,
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
  leadTorchEveryBeats: "THE LEAD — the boss you shoot where it will be",
  leadRockEveryBeats: "THE LEAD — the boss you shoot where it will be",
  leadSlowBeats: "THE LEAD — the boss you shoot where it will be",
  leadOutBeats: "THE LEAD — the boss you shoot where it will be",
  // ScuttleConfig — the frame's size and how many of its parts are pods, the
  // look before the first throw, the two cadences and the counts they switch
  // on, what a pod taken and the beam's priming buy, where a pod hangs, THE
  // SLOW on the wind-up and how long the wave holds after (`config-scuttle.ts`).
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
} satisfies Record<string, GroupName>;
