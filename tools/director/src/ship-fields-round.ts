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
  damageGauge: "THE GAUGE — a round with no field in it",
  // SnakeConfig
  snakeCols: "SNAKE — a round the ship is the body of",
  snakeRows: "SNAKE — a round the ship is the body of",
  snakeStartTiles: "SNAKE — a round the ship is the body of",
  snakeGrowTiles: "SNAKE — a round the ship is the body of",
  snakeMawTicks: "SNAKE — a round the ship is the body of",
  snakeMawRestTicks: "SNAKE — a round the ship is the body of",
  snakeFireRestBeats: "SNAKE — a round the ship is the body of",
  snakeShotTiles: "SNAKE — a round the ship is the body of",
  snakeStunTicks: "SNAKE — a round the ship is the body of",
  damageSnake: "SNAKE — a round the ship is the body of",
  damageSnakeRepeat: "SNAKE — a round the ship is the body of",
  pinballCols: "PINBALL — a table the ship is the bucket of",
  pinballRows: "PINBALL — a table the ship is the bucket of",
  pinballBallMilli: "PINBALL — a table the ship is the bucket of",
  pinballPegMilli: "PINBALL — a table the ship is the bucket of",
  pinballGravityMilli: "PINBALL — a table the ship is the bucket of",
  pinballSpeedCapMilli: "PINBALL — a table the ship is the bucket of",
  pinballBouncePermille: "PINBALL — a table the ship is the bucket of",
  pinballWallPermille: "PINBALL — a table the ship is the bucket of",
  pinballLaunchMilli: "PINBALL — a table the ship is the bucket of",
  pinballWeakPermille: "PINBALL — a table the ship is the bucket of",
  pinballSweepMilli: "PINBALL — a table the ship is the bucket of",
  pinballNeedleMilli: "PINBALL — a table the ship is the bucket of",
  pinballPowerMilli: "PINBALL — a table the ship is the bucket of",
  pinballSlideMilli: "PINBALL — a table the ship is the bucket of",
  pinballBucketMilli: "PINBALL — a table the ship is the bucket of",
  pinballFlightBeats: "PINBALL — a table the ship is the bucket of",
  damagePinball: "PINBALL — a table the ship is the bucket of",
  damagePinballDrop: "PINBALL — a table the ship is the bucket of",
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
  damagePulse: "THE PULSE — the same song on two screens",
  // TellConfig — two numbers, because everything else about the ladder is
  // authored per rung rather than tuned here (`config-tell.ts`).
  damageTell: "THE TELL — rock, paper, scissors with half a tell each",
  damageTellRepeat: "THE TELL — rock, paper, scissors with half a tell each",
} satisfies Record<string, GroupName>;
