import { BALLOON_DEFAULTS, type BalloonConfig } from "./config-balloon.js";
import { BEATBOX_DEFAULTS, type BeatboxConfig } from "./config-beatbox.js";
import { BLISTER_DEFAULTS, type BlisterConfig } from "./config-blister.js";
import { BOSS_DEFAULTS, type BossConfig } from "./config-boss.js";
import { BOSS_CLOCK_DEFAULTS, type BossClockConfig } from "./config-boss-clocks.js";
import { CAROM_DEFAULTS, type CaromConfig } from "./config-carom.js";
import { CHOIR_DEFAULTS, type ChoirConfig } from "./config-choir.js";
import { CHOKE_DEFAULTS, type ChokeConfig } from "./config-choke.js";
import { CLAW_DEFAULTS, type ClawConfig } from "./config-claw.js";
import { CLING_DEFAULTS, type ClingConfig } from "./config-cling.js";
import { COIL_DEFAULTS, type CoilConfig } from "./config-coil.js";
import { CRAWLER_DEFAULTS, type CrawlerConfig } from "./config-crawler.js";
import { CREATURE_DEFAULTS, type CreatureConfig } from "./config-creatures.js";
import { CRYSTAL_DEFAULTS, type CrystalConfig } from "./config-crystal.js";
import { FENCE_DEFAULTS, type FenceConfig } from "./config-fence.js";
import { GHOST_DEFAULTS, type GhostConfig } from "./config-ghost.js";
import { GYRE_DEFAULTS, type GyreConfig } from "./config-gyre.js";
import { MALFUNCTION_DEFAULTS, type MalfunctionConfig } from "./config-malfunction.js";
import type { PairConfig } from "./config-pair.js";
import { POD_DEFAULTS, type PodConfig } from "./config-pod.js";
import { PUSH_DEFAULTS, type PushConfig } from "./config-push.js";
import { RECOIL_DEFAULTS, type RecoilConfig } from "./config-recoil.js";
import { ROCK_CROSS_DEFAULTS, type RockCrossConfig } from "./config-rock-cross.js";
import { ROUND_DEFAULTS, type RoundConfig } from "./config-rounds.js";
import { RUN_DEFAULTS, type RunConfig } from "./config-run.js";
import { SCOUT_DEFAULTS, type ScoutConfig, type ScoutHandConfig } from "./config-scout.js";
import { SHOT_DEFAULTS, type ShotConfig } from "./config-shot.js";
import { SLOW_DEFAULTS, type SlowConfig } from "./config-slow.js";
import { STRAND_DEFAULTS, type StrandConfig } from "./config-strand.js";
import { VEER_DEFAULTS, type VeerConfig } from "./config-veer.js";
import { VIEW_DEFAULTS, type ViewConfig } from "./config-view.js";
import { VOLLEY_DEFAULTS, type VolleyConfig } from "./config-volley.js";
import { WEIGHT_DEFAULTS, type WeightConfig } from "./config-weight.js";

// The two names any caller reaches for through this file rather than through
// the set they belong to: `bind-fleet.ts` delays a splash by the one, and the
// game turns the pair's gates on with the other. Every set's own name was
// re-exported here too, and nothing read one by this road (8 October 2026).
export { PAIR_ON } from "./config-pair.js";
export { FLEET_SHELL_BEATS } from "./config-rounds.js";

/**
 * Every tunable number of the simulation. Named values, never loose literals —
 * this object is what a comparison screen varies and what a replay pins down.
 */
export interface SimConfig
  extends CoilConfig,
    BalloonConfig,
    BeatboxConfig,
    BlisterConfig,
    BossConfig,
    CaromConfig,
    ChoirConfig,
    ClawConfig,
    ScoutConfig,
    ScoutHandConfig,
    BossClockConfig,
    SlowConfig,
    CrawlerConfig,
    CrystalConfig,
    ChokeConfig,
    ClingConfig,
    CreatureConfig,
    GhostConfig,
    RockCrossConfig,
    FenceConfig,
    GyreConfig,
    MalfunctionConfig,
    PairConfig,
    PodConfig,
    PushConfig,
    RoundConfig,
    RunConfig,
    RecoilConfig,
    ShotConfig,
    WeightConfig,
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
   * to agree on is an integer count of ticks (`briefing.ts`). Not one of the
   * pair's switches and needs no `PAIR_ON` — `briefings` already gates the
   * whole opening, so under `DEFAULT_CONFIG` there is never a circle for it.
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
   * (`grip-push.ts`). A whole tile, so the finger and the body travel the
   * same ground: carry it a column's width and the column is what it moves,
   * leaving the body still under the finger afterwards. Anything shorter and
   * a thumb resting on a rock to slow it would push the rock about.
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
  /** Craters a single meteor can carry. Older ones are forgotten. */
  maxHoles: number;
  /** Breaks the hull remembers. Older ones are forgotten. */
  maxScars: number;
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
  ...BALLOON_DEFAULTS,
  ...BOSS_DEFAULTS,
  ...CAROM_DEFAULTS,
  ...CRYSTAL_DEFAULTS,
  ...CHOKE_DEFAULTS,
  ...CLING_DEFAULTS,
  ...BEATBOX_DEFAULTS,
  ...BLISTER_DEFAULTS,
  ...CHOIR_DEFAULTS,
  ...CRAWLER_DEFAULTS,
  ...STRAND_DEFAULTS,
  ...VEER_DEFAULTS,
  ...VOLLEY_DEFAULTS,
  ...CREATURE_DEFAULTS,
  ...CLAW_DEFAULTS,
  ...SCOUT_DEFAULTS,
  ...BOSS_CLOCK_DEFAULTS,
  ...SLOW_DEFAULTS,
  ...GHOST_DEFAULTS,
  ...FENCE_DEFAULTS,
  ...GYRE_DEFAULTS,
  ...RECOIL_DEFAULTS,
  ...ROCK_CROSS_DEFAULTS,
  ...POD_DEFAULTS,
  ...PUSH_DEFAULTS,
  ...ROUND_DEFAULTS,
  ...RUN_DEFAULTS,
  ...SHOT_DEFAULTS,
  ...WEIGHT_DEFAULTS,
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
  maxHoles: 10,
  maxScars: 30,
  readyHoldMs: 150,
  radarLead: 6,
  briefings: false,
};

export {
  beatSeconds,
  clampCol,
  hullRow,
  midCol,
  msToTicks,
  ticksPerBeat,
} from "./config-derived.js";
