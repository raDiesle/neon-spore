import type { BossEntry, SimConfig } from "@neon-spore/sim";

/**
 * Every `SimConfig` field, sorted into the card that explains it to a person
 * standing at the ship — or into `PLUMBING` for the handful that keep two
 * devices in step or keep a hit-test honest and say nothing else.
 *
 * `FIELD_GROUP` is a `Record<keyof SimConfig, GroupName>`, which is the point:
 * TypeScript requires every key of `SimConfig` to appear here, so a field
 * added to the interface and left out of this object is a compile error
 * rather than a mechanic that landed and stayed invisible. `ship.ts` reads
 * this to build the SHIP tab; `packages/sim/src/briefing.ts`'s closed list
 * over creature kinds is the same idea against a union instead of an object.
 */

// The cards themselves — their names, their order and the prose under each —
// are `ship-groups.ts` next door. Re-exported here so nothing that already
// reaches for one through this file has to move.
export {
  GROUP_NOTE,
  GROUP_ORDER,
  type GroupName,
  SHIP_GROUPS,
  WAVE_ONLY_GROUPS,
} from "./ship-groups.js";

import type { GroupName } from "./ship-groups.js";

export const FIELD_GROUP: Record<keyof SimConfig, GroupName> = {
  cols: "THE BEAT",
  rows: "THE BEAT",
  bpm: "THE BEAT",
  tickHz: "PLUMBING — not a dial a person turns",
  inputDelayTicks: "PLUMBING — not a dial a person turns",
  guardWindowMs: "GUARD — the shared defence",
  readyHoldMs: "OPENING — the introduction, the guide and the ready gate",
  intakeWindowMs: "MAW — taking a pod in",
  podFallTilesPerBeat: "POD — shot loose, then caught",
  podDriftTilesPerBeat: "POD — shot loose, then caught",
  podHomeTiles: "POD — shot loose, then caught",
  podHomeTilesPerBeat: "POD — shot loose, then caught",
  podRepair: "POD — shot loose, then caught",
  wardBeats: "POD — shot loose, then caught",
  gripSlowPermille: "GRIP — a hand on the field",
  hullRegenPerSecond: "HULL — damage and repair",
  hullInvulnerable: "PLUMBING — not a dial a person turns",
  damageCreature: "HULL — damage and repair",
  damageMeteor: "HULL — damage and repair",
  maxHoles: "HULL — damage and repair",
  maxScars: "HULL — damage and repair",
  waveRestBeats: "THE BEAT",
  scoreDestroy: "SCORE",
  scoreDeflect: "SCORE",
  scoreWave: "SCORE",
  scorePod: "SCORE",
  damageLure: "HULL — damage and repair",
  lureVanishRows: "THE LURE — a body only one of you can see through",
  scoreThrobHit: "SCORE",
  scoreClaspBreak: "SCORE",
  // Beats, not milliseconds, and it changes nothing the simulation decides —
  // how long the broken shield goes on flying apart after the body under it
  // is already an ordinary slick or bulb (`clasp.ts`).
  claspBreakBeats: "GUARD — the shared defence",
  scoreShellPiece: "SCORE",
  veilMorphBeats: "THE VEIL — a cloud only one of you can see into",
  veilArmourMs: "THE VEIL — a cloud only one of you can see into",
  scoreVeilKill: "SCORE",
  wispDwellBeats: "THE WISP — a body only one of you can see at all",
  scoreWispKill: "SCORE",
  scoreGhostKill: "SCORE",
  ghostCrossRow: "THE GHOST — a body with no column on one screen",
  ghostCrossCols: "THE GHOST — a body with no column on one screen",
  ghostChargeLaps: "THE GHOST — a body with no column on one screen",
  ghostDiveTiles: "THE GHOST — a body with no column on one screen",
  damageGhostDive: "HULL — damage and repair",
  echoFallBeats: "THE ECHO — one body that becomes eight",
  echoSplits: "THE ECHO — one body that becomes eight",
  echoSplitBeats: "THE ECHO — one body that becomes eight",
  scoreEchoKill: "SCORE",
  rindLayers: "THE RIND — one body, three sizes",
  scoreRindShed: "SCORE",
  gyreSpinMilli: "THE GYRE — six bodies on a turning rim",
  gyreSpinGainMilli: "THE GYRE — six bodies on a turning rim",
  gyreSpinCapMilli: "THE GYRE — six bodies on a turning rim",
  gyreSuckSpinMilli: "THE GYRE — six bodies on a turning rim",
  gyreSuckMs: "THE GYRE — six bodies on a turning rim",
  gyreSinkLaps: "THE GYRE — six bodies on a turning rim",
  scoreGyreBreak: "SCORE",
  throbPeriodBeats: "THROB — open for one beat in every few",
  throbOpenBeats: "THROB — open for one beat in every few",
  radarLead: "RADAR — what is coming",
  bulletGlideMs: "AIM — colour and column",
  bandPct: "PLUMBING — not a dial a person turns",
  bandSoloPct: "PLUMBING — not a dial a person turns",
  radarHeightPx: "PLUMBING — not a dial a person turns",
  depthNearScale: "PLUMBING — not a dial a person turns",
  depthHaze: "PLUMBING — not a dial a person turns",
  // BossConfig
  queenRow: "QUEEN",
  queenEggGrowShare: "QUEEN",
  wardenRow: "WARDEN",
  wardenCycleBeats: "WARDEN",
  wardenHangRows: "WARDEN",
  wardenTautMilli: "WARDEN",
  wardenPlates: "WARDEN",
  scoreWardenPlate: "WARDEN",
  scoreWardenDown: "WARDEN",
  mirrorRow: "MIRROR",
  damageEcho: "MIRROR",
  scoreMirrorRound: "MIRROR",
  scoreMirrorDown: "MIRROR",
  mazeRow: "MAZE",
  damageMaze: "MAZE",
  mazeSpanMilli: "MAZE",
  mazeTurnMilli: "MAZE",
  mazeDragMilliPerTile: "MAZE",
  mazeDragBreakMilli: "MAZE",
  mazeSnapMilli: "MAZE",
  scoreMazeRound: "MAZE",
  scoreMazeDown: "MAZE",
  vanePins: "VANE",
  scoreVanePin: "VANE",
  scoreVaneDown: "VANE",
  scoreQueenPetal: "QUEEN",
  scoreQueenDown: "QUEEN",
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
  // PairConfig
  briefings: "OPENING — the introduction, the guide and the ready gate",
  // ShotConfig
  bulletTilesPerBeat: "AIM — colour and column",
  lancePrimeBeats: "LANCE — a column marked, then spent",
  lancePierce: "LANCE — a column marked, then spent",
  lanceTilesPerBeat: "LANCE — a column marked, then spent",
  fireEveryBeats: "AIM — colour and column",
  shotChargeBeats: "AIM — colour and column",
  hitHeightMilli: "PLUMBING — not a dial a person turns",
  fleetRows: "THE FLEET — a chart only one of you can read",
  fleetRoundBeats: "THE FLEET — a chart only one of you can read",
  fleetSalvoRestBeats: "THE FLEET — a chart only one of you can read",
  damageFleet: "THE FLEET — a chart only one of you can read",
  scoreFleetHit: "SCORE",
  scoreFleetSunk: "SCORE",
  scoreFleetDown: "SCORE",
};

/** Every field that belongs to `group`, in the order `SimConfig` declares them. */
export function fieldsIn(group: GroupName): (keyof SimConfig)[] {
  return (Object.keys(FIELD_GROUP) as (keyof SimConfig)[]).filter((k) => FIELD_GROUP[k] === group);
}

/**
 * The boss group each `BossEntry` kind shows — a wave that carries `warden`
 * shows WARDEN, and nothing else here changes because of it. `ship.ts` reads
 * this to decide what belongs beside the wave being edited rather than beside
 * the ship, which is the split the SHIP-column brief asked for.
 */
export const BOSS_GROUP: Record<BossEntry["kind"], GroupName> = {
  pinball: "PINBALL — a table the ship is the bucket of",
  queen: "QUEEN",
  warden: "WARDEN",
  mirror: "MIRROR",
  vane: "VANE",
  maze: "MAZE",
  gauge: "THE GAUGE — a round with no field in it",
  fleet: "THE FLEET — a chart only one of you can read",
  snake: "SNAKE — a round the ship is the body of",
};
