import type { GroupName } from "./ship-groups.js";

/**
 * The rounds' own dials, sorted into their cards.
 *
 * Split out of `ship-fields.ts` when THE PULSE's eleven numbers took that file
 * past its 250-line limit, along the seam `content/src/controls-round.ts` and
 * `sim/src/command-round.ts` already cut twice: next door is the **ship**,
 * whose dials are the same on every wave, and this is whichever round has
 * taken the field away. Nine more rounds are designed and each brings a block
 * of its own, so the half that grows lives on its own.
 *
 * It is spread into `FIELD_GROUP` in place, so the exhaustiveness check that
 * file exists for is unchanged: a `SimConfig` field missing from *either* half
 * is still a compile error there.
 */
export const ROUND_FIELD_GROUP = {
  // GaugeConfig
  gaugeTurnMilli: "THE GAUGE — a round with no field in it",
  gaugeDriftMilli: "THE GAUGE — a round with no field in it",
  gaugeSpanMilli: "THE GAUGE — a round with no field in it",
  gaugeMarks: "THE GAUGE — a round with no field in it",
  gaugeRoundBeats: "THE GAUGE — a round with no field in it",
  gaugeCallRestBeats: "THE GAUGE — a round with no field in it",
  // ScoutConfig — every one of them is *feel*, which is why they are dials at
  // all: the three at the top decide whether the little ship reads as a ship,
  // and the owner is the only instrument that can say (`config-scout.ts`).
  scoutTurnMilliDeg: "THE SCOUT — a little ship one of you flies",
  scoutBurnMilli: "THE SCOUT — a little ship one of you flies",
  scoutDragMilli: "THE SCOUT — a little ship one of you flies",
  scoutMaxSpeedMilli: "THE SCOUT — a little ship one of you flies",
  scoutBounceMilli: "THE SCOUT — a little ship one of you flies",
  scoutRadiusMilli: "THE SCOUT — a little ship one of you flies",
  scoutMoteRadiusMilli: "THE SCOUT — a little ship one of you flies",
  scoutHazardRadiusMilli: "THE SCOUT — a little ship one of you flies",
  scoutMawTicks: "THE SCOUT — a little ship one of you flies",
  scoutHomeRadiusMilli: "THE SCOUT — a little ship one of you flies",
  scoutLeadBeats: "THE SCOUT — a little ship one of you flies",
  scoutVerdictBeats: "THE SCOUT — a little ship one of you flies",
  // StareConfig — the eye is not a round and its dials live here anyway: it
  // takes the panel away in the one sense that matters, and every number in it
  // is a count of beats a pair says something in (`config-stare.ts`).
  stareAwayBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareTellBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareLookBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareLookGrowBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareLookMaxBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareTurnBackBeats: "THE STARE — an eye that freezes whoever it looks at",
  // DiastoleConfig — two cadences that do not divide each other, what a
  // chamber can take, and how long the bridge takes to split. Every one of
  // them is the pair's arithmetic rather than a difficulty knob: three against
  // five is a coincidence every fifteen beats, and a pair that changed either
  // number would be counting a different boss (`config-diastole.ts`).
  diastoleLeftBeats: "THE DIASTOLE — two hearts on two cadences, one each",
  diastoleRightBeats: "THE DIASTOLE — two hearts on two cadences, one each",
  diastoleRightAloneBeats: "THE DIASTOLE — two hearts on two cadences, one each",
  diastoleChamberHits: "THE DIASTOLE — two hearts on two cadences, one each",
  diastoleBurstBeats: "THE DIASTOLE — two hearts on two cadences, one each",
  // BatonConfig — the arm's length and every beat a handover takes. All of
  // them are the pair's cadence: a flight is a word and a press, a turn is a
  // look and a word, and a lock is *not you, not this beat* (`config-baton.ts`).
  batonSockets: "THE BATON — a bead passed down an arm, one seat a beat",
  batonFlightBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonTurnBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonTightTurnBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonTightenAfter: "THE BATON — a bead passed down an arm, one seat a beat",
  batonLockBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonSwingAfter: "THE BATON — a bead passed down an arm, one seat a beat",
  batonShedAfter: "THE BATON — a bead passed down an arm, one seat a beat",
  batonShedBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonDownBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  // ThroatConfig — five rings, a mouth a third of the way down, the inhale
  // and what it tightens to, and how far the mouth steps between inhales.
  // Every one of them is a deadline somebody has to say out loud rather than a
  // difficulty knob: shorten the inhale and the fight does not get harder, it
  // gets quiet (`config-throat.ts`).
  throatRings: "THE THROAT — the boss you answer by feeding it",
  throatMouthRow: "THE THROAT — the boss you answer by feeding it",
  throatInhaleBeats: "THE THROAT — the boss you answer by feeding it",
  throatTightBeats: "THE THROAT — the boss you answer by feeding it",
  throatSlideCols: "THE THROAT — the boss you answer by feeding it",
  throatQuickCols: "THE THROAT — the boss you answer by feeding it",
  throatEvertBeats: "THE THROAT — the boss you answer by feeding it",
  // UndertowConfig — how often it comes up, and how long each part of a push
  // takes. Every beat is a call: a bow is a column said, a stand is a maw
  // opened or a plate moved on a word (`config-undertow.ts`).
  undertowSingles: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowPairs: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowPairGap: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowTalls: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowBowBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowStandBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowRestBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowWidenMilli: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowWideMilli: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowUnseatBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowUnseatedBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowRiseBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowHoldBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowLastBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowDownBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowSlowBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  // OrreryConfig — three orbits, the beat they first come together on, and
  // what the core does with the gap once a ring is off it. Every one of them
  // is a count the pair says out loud (`config-orrery.ts`).
  orreryOuterOrgans: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryMiddleOrgans: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryInnerOrgans: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryFirstBeats: "THE ORRERY — three orbits, and neither of you can see all three",
  orrerySpitBeats: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryDebris: "THE ORRERY — three orbits, and neither of you can see all three",
  orrerySlowBeats: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryOutBeats: "THE ORRERY — three orbits, and neither of you can see all three",
  // CandleConfig — how many steps the glow has, how long the dark takes to
  // fall, and the counts it drifts, turns, eats and goes out on. Every one a
  // count the pair says aloud in the dark (`config-candle.ts`).
  candleGlowSteps: "THE CANDLE — the boss fought in the dark",
  candleDarkBeats: "THE CANDLE — the boss fought in the dark",
  candleMoveBeats: "THE CANDLE — the boss fought in the dark",
  candleTurnBeats: "THE CANDLE — the boss fought in the dark",
  candleEatSteps: "THE CANDLE — the boss fought in the dark",
  candleLastSteps: "THE CANDLE — the boss fought in the dark",
  candleOutBeats: "THE CANDLE — the boss fought in the dark",
  // SnakeConfig
  snakeCols: "SNAKE — a round the ship is the body of",
  snakeRows: "SNAKE — a round the ship is the body of",
  snakeStartTiles: "SNAKE — a round the ship is the body of",
  snakeGrowTiles: "SNAKE — a round the ship is the body of",
  snakeMawTicks: "SNAKE — a round the ship is the body of",
  snakeMawRestTicks: "SNAKE — a round the ship is the body of",
  snakeFireRestBeats: "SNAKE — a round the ship is the body of",
  snakeShotTiles: "SNAKE — a round the ship is the body of",
  pinballCols: "PINBALL — a table the ship's cannon fires up into",
  pinballRows: "PINBALL — a table the ship's cannon fires up into",
  pinballBallMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballPegMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballGravityMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballSpeedCapMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballBouncePermille: "PINBALL — a table the ship's cannon fires up into",
  pinballWallPermille: "PINBALL — a table the ship's cannon fires up into",
  pinballLaunchMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballWeakPermille: "PINBALL — a table the ship's cannon fires up into",
  pinballSweepMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballNeedleMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballPowerMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballCatchMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballFlightBeats: "PINBALL — a table the ship's cannon fires up into",
  // PulseConfig
  pulseStepTicks: "THE PULSE — the same song on two screens",
  pulseLeadTicks: "THE PULSE — the same song on two screens",
  pulsePerfectTicks: "THE PULSE — the same song on two screens",
  pulseGoodTicks: "THE PULSE — the same song on two screens",
  pulseMeterStartMilli: "THE PULSE — the same song on two screens",
  pulseMeterMaxMilli: "THE PULSE — the same song on two screens",
  pulsePerfectMilli: "THE PULSE — the same song on two screens",
  pulseGoodMilli: "THE PULSE — the same song on two screens",
  pulseMissMilli: "THE PULSE — the same song on two screens",
  pulseStrayMilli: "THE PULSE — the same song on two screens",
} satisfies Record<string, GroupName>;
