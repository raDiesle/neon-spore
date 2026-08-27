import type { BossConfig } from "./config-boss.js";
import { GAUGE_DEFAULTS, type GaugeConfig } from "./config-gauge.js";
import type { PairConfig } from "./config-pair.js";
import { SHOT_DEFAULTS, type ShotConfig } from "./config-shot.js";

export type { BossConfig } from "./config-boss.js";
export { GAUGE_DEFAULTS, type GaugeConfig } from "./config-gauge.js";
export { PAIR_ON, type PairConfig } from "./config-pair.js";
export { SHOT_DEFAULTS, type ShotConfig } from "./config-shot.js";

/**
 * Every tunable number of the simulation. Named values, never loose literals —
 * this object is what a comparison screen varies and what a replay pins down.
 */
export interface SimConfig extends BossConfig, GaugeConfig, PairConfig, ShotConfig {
  /** Grid width in columns. Waves are authored for 7 and remapped. */
  cols: number;
  /** Grid height in rows. The hull occupies the last one. */
  rows: number;
  /** Beats per minute of the shared clock. */
  bpm: number;
  /** Fixed simulation rate. Must divide into a whole number of ticks per beat. */
  tickHz: number;
  /**
   * Ticks between a press and the tick it takes effect on, on both devices at
   * once — the "delayed" in delayed lockstep. It buys the time a command needs
   * to reach the other phone, so it has to be longer than one trip through the
   * relay or every press lands after the tick it was meant for. It changes no
   * rule and enters no fingerprint; it is here because a tunable in this game
   * is a named field of `SimConfig` and because the number wants measuring on
   * a real connection, like `guardWindowMs` beside it.
   */
  inputDelayTicks: number;
  /** How long after player 1 triggers the shield it stays armed, in milliseconds. */
  guardWindowMs: number;
  /**
   * How long after player 1 opens the maw it stays open, in milliseconds. The
   * sibling of `guardWindowMs`, and deliberately not the same number: the pod
   * falls slowly and is caught by the cannon the player is already holding, so
   * the window may be tighter than the one that answers a rock.
   */
  intakeWindowMs: number;
  /** How fast a pod that has been shot loose sinks, in tiles per beat. */
  podFallTilesPerBeat: number;
  /**
   * How far a falling pod slides sideways, in tiles per beat. The direction is
   * drawn from the seeded rng when the shot lands, so the cannon has to chase
   * what it just freed rather than wait under it.
   */
  podDriftTilesPerBeat: number;
  /**
   * How close to the hull, in tiles, a falling pod has to be before it starts
   * steering toward the cannon's column instead of drifting on its own.
   */
  podHomeTiles: number;
  /**
   * Sideways speed while steering toward the cannon, in tiles per beat. Once a
   * pod is inside `podHomeTiles` of the hull this replaces
   * `podDriftTilesPerBeat` entirely — the two never apply on the same tick.
   */
  podHomeTilesPerBeat: number;
  /** Hull points a swallowed pod gives back. The energy boost, as a number. */
  podRepair: number;
  /** Beats a `ward` pod keeps the shield armed without a trigger. */
  wardBeats: number;
  /**
   * Share of its speed a creature keeps for each hand held on it, in
   * thousandths — the whole of THE GRIP as a number. 550 leaves a little over
   * half from one player and a little under a third when both pull, which is
   * a beat or two bought and never a creature stopped dead.
   */
  gripSlowPermille: number;
  /** Hull points regained per second. */
  hullRegenPerSecond: number;
  /**
   * Damage is counted and shown but never subtracted. A test convenience, so a
   * wave can be watched to its end; it is a config field rather than a flag in
   * the app because a replay has to record that the run was played this way.
   */
  hullInvulnerable: boolean;
  /** Damage when a creature reaches the hull. */
  damageCreature: number;
  /** Damage when a meteor is not deflected. */
  damageMeteor: number;
  /** Craters a single meteor can carry. Older ones are forgotten. */
  maxHoles: number;
  /** Breaks the hull remembers. Older ones are forgotten. */
  maxScars: number;
  /** Beats of quiet between a wave being cleared and the next one starting. */
  waveRestBeats: number;
  /** Score for destroying a creature. */
  scoreDestroy: number;
  /** Score for deflecting a meteor. */
  scoreDeflect: number;
  /** Score for clearing a wave. */
  scoreWave: number;
  /** Score for taking a pod in. */
  scorePod: number;
  /** What a shot at a Runt costs, off the score (never below zero) — the
   * reflex that pays off against every other aim target is wrong here. */
  scoreRuntPenalty: number;
  /** Score for hitting a Throb while it is open. */
  scoreThrobHit: number;
  /** Beats in one Throb swell-shrink cycle — `throbIsOpen`'s whole state
   * machine is `beat % throbPeriodBeats` against `throbOpenBeats`. */
  throbPeriodBeats: number;
  /** Beats out of every cycle a Throb can be hit at all. */
  throbOpenBeats: number;
  /**
   * How many beats ahead the radar strip shows an arrival. Read by render/.
   * A creature needs at least a 3-second floor of warning (docs/spec/latency.md)
   * to be called out and acted on across the voice delay, and a single time
   * axis on the strip is the only readable one — there is no per-kind lead.
   * At 96 BPM, 6 beats is 3.75 s.
   */
  radarLead: number;
  /** How long a bullet takes to glide between two tiles, in ms. Read by render/. */
  bulletGlideMs: number;
  /** Share of the screen height the control band takes, in percent. Read by render/. */
  bandPct: number;
  /**
   * The same share when a screen carries only one player's half of the band.
   * The finished game is one role per device, so the field gets the space the
   * missing controls leave behind — see the view switch in `apps/game`.
   * Read by render/.
   */
  bandSoloPct: number;
  /** Height of the radar strip above the grid, in CSS pixels. Read by render/. */
  radarHeightPx: number;
}

export const DEFAULT_CONFIG: SimConfig = {
  ...GAUGE_DEFAULTS,
  ...SHOT_DEFAULTS,
  cols: 11,
  rows: 15,
  queenRow: 2,
  bpm: 96,
  tickHz: 120,
  inputDelayTicks: 12,
  guardWindowMs: 900,
  intakeWindowMs: 800,
  podFallTilesPerBeat: 3,
  podDriftTilesPerBeat: 0.4,
  podHomeTiles: 2,
  podHomeTilesPerBeat: 2,
  podRepair: 18,
  wardBeats: 6,
  gripSlowPermille: 550,
  hullRegenPerSecond: 3,
  hullInvulnerable: false,
  damageCreature: 12,
  damageMeteor: 20,
  wardenRow: 2,
  wardenCycleBeats: 12,
  wardenPullBeats: 2,
  wardenPlates: 5,
  damageWarden: 16,
  scoreWardenPlate: 500,
  scoreWardenDown: 2500,
  vanePins: 5,
  scoreVanePin: 500,
  scoreVaneDown: 2500,
  mirrorRow: 3,
  damageEcho: 15,
  scoreMirrorRound: 500,
  scoreMirrorDown: 2500,
  maxHoles: 10,
  maxScars: 30,
  waveRestBeats: 3,
  forkBetweenWaves: false,
  interludes: false,
  scoreDestroy: 100,
  scoreDeflect: 150,
  scoreWave: 300,
  scorePod: 250,
  scoreRuntPenalty: 150,
  scoreThrobHit: 200,
  throbPeriodBeats: 4,
  throbOpenBeats: 1,
  scoreQueenPetal: 400,
  scoreQueenDown: 2000,
  radarLead: 6,
  bulletGlideMs: 130,
  bandPct: 37,
  bandSoloPct: 27,
  radarHeightPx: 34,
  queenEggGrowShare: 0.5,
  briefings: false,
};

/** Ticks per beat. Throws unless it is a whole number — see docs/architecture.md. */
export function ticksPerBeat(cfg: SimConfig): number {
  const exact = (cfg.tickHz * 60) / cfg.bpm;
  const rounded = Math.round(exact);
  if (Math.abs(exact - rounded) > 1e-9) {
    throw new Error(
      `tickHz ${cfg.tickHz} and bpm ${cfg.bpm} give ${exact} ticks per beat. ` +
        `It must be a whole number, otherwise the beat drifts and lockstep breaks.`,
    );
  }
  return rounded;
}

/**
 * The row the hull occupies. A creature that arrives here has reached it, so a
 * creature entering at row 0 travels `rows - 1` beats — 8.75 s at the defaults,
 * which is the 4-second rule from docs/spec/latency.md with room to spare.
 */
export function hullRow(cfg: SimConfig): number {
  return cfg.rows - 1;
}
