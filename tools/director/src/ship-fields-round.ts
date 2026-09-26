import { CHOREO_FIELD_GROUP } from "./ship-fields-choreo.js";
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
  gaugeSettleBeats: "THE GAUGE — a round with no field in it",
  gaugeBindMarks: "THE GAUGE — a round with no field in it",
  gaugeBoundSpanMilli: "THE GAUGE — a round with no field in it",
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
  scoutLadenMotes: "THE SCOUT — a little ship one of you flies",
  scoutHeavyMotes: "THE SCOUT — a little ship one of you flies",
  scoutReelMilli: "THE SCOUT — a little ship one of you flies",
  scoutPrimeMilli: "THE SCOUT — a little ship one of you flies",
  scoutPrimeTicks: "THE SCOUT — a little ship one of you flies",
  scoutHomeRadiusMilli: "THE SCOUT — a little ship one of you flies",
  scoutLeadBeats: "THE SCOUT — a little ship one of you flies",
  scoutVerdictBeats: "THE SCOUT — a little ship one of you flies",
  // The twelve bosses of the choreographed page, and THE STARE with them
  // (`ship-fields-choreo.ts`).
  ...CHOREO_FIELD_GROUP,
  // SnakeConfig
  snakeCols: "SNAKE — a round the ship is the body of",
  snakeRows: "SNAKE — a round the ship is the body of",
  snakeStartTiles: "SNAKE — a round the ship is the body of",
  snakeGrowTiles: "SNAKE — a round the ship is the body of",
  snakeMawTicks: "SNAKE — a round the ship is the body of",
  snakeGorgeTiles: "SNAKE — a round the ship is the body of",
  snakeShedTiles: "SNAKE — a round the ship is the body of",
  snakeJawsMilli: "SNAKE — a round the ship is the body of",
  snakeTailTiles: "SNAKE — a round the ship is the body of",
  snakeMawRestTicks: "SNAKE — a round the ship is the body of",
  snakeFireRestBeats: "SNAKE — a round the ship is the body of",
  snakeShotTiles: "SNAKE — a round the ship is the body of",
  snakeHomeStepTicks: "SNAKE — a round the ship is the body of",
  snakeHullPct: "SNAKE — a round the ship is the body of",
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
  pinballHardMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballWindMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballNudgeMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballNudgeShoveMilli: "PINBALL — a table the ship's cannon fires up into",
  pinballNudges: "PINBALL — a table the ship's cannon fires up into",
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
  pulseFlutterMilli: "THE PULSE — the same song on two screens",
  pulseArrestMilli: "THE PULSE — the same song on two screens",
  pulseBracePermille: "THE PULSE — the same song on two screens",
  pulseArrestGainMilli: "THE PULSE — the same song on two screens",
} satisfies Record<string, GroupName>;
