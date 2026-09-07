import { BOSS_DEFAULTS, type BossConfig } from "./config-boss.js";
import { CAROM_DEFAULTS, type CaromConfig } from "./config-carom.js";
import { CHOIR_DEFAULTS, type ChoirConfig } from "./config-choir.js";
import { CLAW_DEFAULTS, type ClawConfig } from "./config-claw.js";
import { COIL_DEFAULTS, type CoilConfig } from "./config-coil.js";
import { CRAWLER_DEFAULTS, type CrawlerConfig } from "./config-crawler.js";
import { CREATURE_SCORE_DEFAULTS, type CreatureScoreConfig } from "./config-creature-scores.js";
import { CREATURE_DEFAULTS, type CreatureConfig } from "./config-creatures.js";
import { FENCE_DEFAULTS, type FenceConfig } from "./config-fence.js";
import { FLEET_DEFAULTS, type FleetConfig } from "./config-fleet.js";
import { GAUGE_DEFAULTS, type GaugeConfig } from "./config-gauge.js";
import { GHOST_DEFAULTS, type GhostConfig } from "./config-ghost.js";
import { GYRE_DEFAULTS, type GyreConfig } from "./config-gyre.js";
import { MALFUNCTION_DEFAULTS, type MalfunctionConfig } from "./config-malfunction.js";
import type { PairConfig } from "./config-pair.js";
import { PINBALL_DEFAULTS, type PinballConfig } from "./config-pinball.js";
import { POD_DEFAULTS, type PodConfig } from "./config-pod.js";
import { RECOIL_DEFAULTS, type RecoilConfig } from "./config-recoil.js";
import { ROCK_CROSS_DEFAULTS, type RockCrossConfig } from "./config-rock-cross.js";
import { SHOT_DEFAULTS, type ShotConfig } from "./config-shot.js";
import { SNAKE_DEFAULTS, type SnakeConfig } from "./config-snake.js";
import { STRAND_DEFAULTS, type StrandConfig } from "./config-strand.js";
import { VEER_DEFAULTS, type VeerConfig } from "./config-veer.js";
import { VIEW_DEFAULTS, type ViewConfig } from "./config-view.js";
import { VOLLEY_DEFAULTS, type VolleyConfig } from "./config-volley.js";

export { BOSS_DEFAULTS, type BossConfig } from "./config-boss.js";
export { CAROM_DEFAULTS, type CaromConfig } from "./config-carom.js";
export { CHOIR_DEFAULTS, type ChoirConfig } from "./config-choir.js";
export { CLAW_DEFAULTS, type ClawConfig } from "./config-claw.js";
export { COIL_DEFAULTS, type CoilConfig } from "./config-coil.js";
export { CRAWLER_DEFAULTS, type CrawlerConfig } from "./config-crawler.js";
export { CREATURE_SCORE_DEFAULTS, type CreatureScoreConfig } from "./config-creature-scores.js";
export { CREATURE_DEFAULTS, type CreatureConfig } from "./config-creatures.js";
export { FENCE_DEFAULTS, type FenceConfig } from "./config-fence.js";
export { FLEET_DEFAULTS, FLEET_SHELL_BEATS, type FleetConfig } from "./config-fleet.js";
export { GAUGE_DEFAULTS, type GaugeConfig } from "./config-gauge.js";
export { GHOST_DEFAULTS, type GhostConfig } from "./config-ghost.js";
export { GYRE_DEFAULTS, type GyreConfig } from "./config-gyre.js";
export { MALFUNCTION_DEFAULTS, type MalfunctionConfig } from "./config-malfunction.js";
export { PAIR_ON, type PairConfig } from "./config-pair.js";
export { PINBALL_DEFAULTS, type PinballConfig } from "./config-pinball.js";
export { POD_DEFAULTS, type PodConfig } from "./config-pod.js";
export { RECOIL_DEFAULTS, type RecoilConfig } from "./config-recoil.js";
export { ROCK_CROSS_DEFAULTS, type RockCrossConfig } from "./config-rock-cross.js";
export { SHOT_DEFAULTS, type ShotConfig } from "./config-shot.js";
export { SNAKE_DEFAULTS, type SnakeConfig } from "./config-snake.js";
export { STRAND_DEFAULTS, type StrandConfig } from "./config-strand.js";
export { VEER_DEFAULTS, type VeerConfig } from "./config-veer.js";
export { VIEW_DEFAULTS, type ViewConfig } from "./config-view.js";
export { VOLLEY_DEFAULTS, type VolleyConfig } from "./config-volley.js";

/**
 * Every tunable number of the simulation. Named values, never loose literals —
 * this object is what a comparison screen varies and what a replay pins down.
 */
export interface SimConfig
  extends CoilConfig,
    BossConfig,
    CaromConfig,
    ChoirConfig,
    ClawConfig,
    CrawlerConfig,
    CreatureConfig,
    CreatureScoreConfig,
    FleetConfig,
    GaugeConfig,
    GhostConfig,
    RockCrossConfig,
    FenceConfig,
    GyreConfig,
    MalfunctionConfig,
    PairConfig,
    PinballConfig,
    PodConfig,
    RecoilConfig,
    ShotConfig,
    SnakeConfig,
    StrandConfig,
    VeerConfig,
    ViewConfig,
    VolleyConfig {
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
   * How long a seat has to hold at the ready gate before its circle says READY
   * and the wave may start, in milliseconds. Milliseconds here and ticks in
   * the world: `readyHoldTicks` converts it once, so the rule two devices have
   * to agree on is an integer count of ticks (`briefing.ts`).
   *
   * It is not one of the pair's switches and needs no `PAIR_ON`: `briefings`
   * already gates the whole opening, so under `DEFAULT_CONFIG` there is never
   * a circle for this number to describe.
   */
  readyHoldMs: number;
  /**
   * How long after player 1 opens the maw it stays open, in milliseconds. The
   * sibling of `guardWindowMs`, and deliberately not the same number: the pod
   * falls slowly and is caught by the cannon the player is already holding, so
   * the window may be tighter than the one that answers a rock.
   */
  intakeWindowMs: number;
  /**
   * Share of its speed a creature keeps for each hand held on it, in
   * thousandths — the whole of THE GRIP as a number. 550 leaves a little over
   * half from one player and a little under a third when both pull, which is
   * a beat or two bought and never a creature stopped dead.
   */
  gripSlowPermille: number;
  /**
   * How far a hand has to carry a body it is holding before it steps a column,
   * in thousandths of a tile — the whole of THE PUSH as a distance
   * (`grip-push.ts`).
   *
   * A whole tile, so the finger and the body travel the same ground: carry it
   * a column's width and the column is what it moves, which leaves the body
   * still under the finger afterwards and the gesture able to be repeated
   * without lifting. Anything shorter and a thumb resting on a rock to slow it
   * would push the rock about while its owner was only trying to hold on.
   */
  gripPushMilli: number;
  /**
   * Beats a carried body has to stand still before a hand may carry it again.
   *
   * One: the body moves, a beat passes with it where it landed, and only then
   * may it move again — so a thumb can walk a rock across the field at half
   * the speed it falls, never faster. Counted on the body rather than on the
   * hand, so two hands on one rock are not twice as quick as one.
   */
  gripPushPauseBeats: number;
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
  /**
   * How many beats ahead the radar strip shows an arrival. Read by render/.
   * A creature needs at least a 3-second floor of warning (docs/spec/latency.md)
   * to be called out and acted on across the voice delay, and a single time
   * axis on the strip is the only readable one — there is no per-kind lead.
   * At 96 BPM, 6 beats is 3.75 s.
   */
  radarLead: number;
}

export const DEFAULT_CONFIG: SimConfig = {
  ...MALFUNCTION_DEFAULTS,
  ...VIEW_DEFAULTS,
  ...COIL_DEFAULTS,
  ...BOSS_DEFAULTS,
  ...CAROM_DEFAULTS,
  ...CHOIR_DEFAULTS,
  ...CRAWLER_DEFAULTS,
  ...STRAND_DEFAULTS,
  ...VEER_DEFAULTS,
  ...VOLLEY_DEFAULTS,
  ...CREATURE_DEFAULTS,
  ...CREATURE_SCORE_DEFAULTS,
  ...CLAW_DEFAULTS,
  ...FLEET_DEFAULTS,
  ...GAUGE_DEFAULTS,
  ...GHOST_DEFAULTS,
  ...FENCE_DEFAULTS,
  ...GYRE_DEFAULTS,
  ...RECOIL_DEFAULTS,
  ...ROCK_CROSS_DEFAULTS,
  ...PINBALL_DEFAULTS,
  ...POD_DEFAULTS,
  ...SHOT_DEFAULTS,
  ...SNAKE_DEFAULTS,
  cols: 11,
  rows: 15,
  bpm: 96,
  tickHz: 120,
  inputDelayTicks: 12,
  guardWindowMs: 900,
  intakeWindowMs: 800,
  gripSlowPermille: 550,
  gripPushMilli: 1000,
  gripPushPauseBeats: 1,
  hullRegenPerSecond: 3,
  hullInvulnerable: false,
  damageCreature: 12,
  damageMeteor: 20,
  maxHoles: 10,
  maxScars: 30,
  waveRestBeats: 3,
  readyHoldMs: 420,
  scoreDestroy: 100,
  scoreDeflect: 150,
  scoreWave: 300,
  scorePod: 250,
  radarLead: 6,
  briefings: false,
};

export {
  hullRow,
  midCol,
  msToTicks,
  ticksPerBeat,
} from "./config-derived.js";
