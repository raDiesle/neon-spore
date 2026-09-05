import { BOSS_DEFAULTS, type BossConfig } from "./config-boss.js";
import { CAROM_DEFAULTS, type CaromConfig } from "./config-carom.js";
import { CREATURE_DEFAULTS, type CreatureConfig } from "./config-creatures.js";
import { FLEET_DEFAULTS, type FleetConfig } from "./config-fleet.js";
import { GAUGE_DEFAULTS, type GaugeConfig } from "./config-gauge.js";
import { GHOST_DEFAULTS, type GhostConfig } from "./config-ghost.js";
import { GYRE_DEFAULTS, type GyreConfig } from "./config-gyre.js";
import type { PairConfig } from "./config-pair.js";
import { PINBALL_DEFAULTS, type PinballConfig } from "./config-pinball.js";
import { POD_DEFAULTS, type PodConfig } from "./config-pod.js";
import { RECOIL_DEFAULTS, type RecoilConfig } from "./config-recoil.js";
import { SHOT_DEFAULTS, type ShotConfig } from "./config-shot.js";
import { SNAKE_DEFAULTS, type SnakeConfig } from "./config-snake.js";
import { VEER_DEFAULTS, type VeerConfig } from "./config-veer.js";
import { VOLLEY_DEFAULTS, type VolleyConfig } from "./config-volley.js";

export { BOSS_DEFAULTS, type BossConfig } from "./config-boss.js";
export { CAROM_DEFAULTS, type CaromConfig } from "./config-carom.js";
export { CREATURE_DEFAULTS, type CreatureConfig } from "./config-creatures.js";
export { FLEET_DEFAULTS, FLEET_SHELL_BEATS, type FleetConfig } from "./config-fleet.js";
export { GAUGE_DEFAULTS, type GaugeConfig } from "./config-gauge.js";
export { GHOST_DEFAULTS, type GhostConfig } from "./config-ghost.js";
export { GYRE_DEFAULTS, type GyreConfig } from "./config-gyre.js";
export { PAIR_ON, type PairConfig } from "./config-pair.js";
export { PINBALL_DEFAULTS, type PinballConfig } from "./config-pinball.js";
export { POD_DEFAULTS, type PodConfig } from "./config-pod.js";
export { RECOIL_DEFAULTS, type RecoilConfig } from "./config-recoil.js";
export { SHOT_DEFAULTS, type ShotConfig } from "./config-shot.js";
export { SNAKE_DEFAULTS, type SnakeConfig } from "./config-snake.js";
export { VEER_DEFAULTS, type VeerConfig } from "./config-veer.js";
export { VOLLEY_DEFAULTS, type VolleyConfig } from "./config-volley.js";

/**
 * Every tunable number of the simulation. Named values, never loose literals —
 * this object is what a comparison screen varies and what a replay pins down.
 */
export interface SimConfig
  extends BossConfig,
    CaromConfig,
    CreatureConfig,
    FleetConfig,
    GaugeConfig,
    GhostConfig,
    GyreConfig,
    PairConfig,
    PinballConfig,
    PodConfig,
    RecoilConfig,
    ShotConfig,
    SnakeConfig,
    VeerConfig,
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
  /** How long a bullet takes to glide between two tiles, in ms. Read by render/. */
  bulletGlideMs: number;
  /**
   * Share of the screen height the control band takes, in percent, on a screen
   * carrying **both** halves — the desk rig and the director's TEST view, never
   * a phone. It was 37, and the owner asked why the game looked smaller there:
   * it is down to where the lobes stop being limited by the band's height and
   * start being limited by the stage's width (`layout.ts`), which is the most
   * it can give back before the buttons shrink. Read by render/.
   */
  bandPct: number;
  /** The same share when a screen carries only one player's half of the band.
   * The finished game is one role per device, so the field gets the space the
   * missing controls leave behind — see the view switch in `apps/game`. */
  bandSoloPct: number;
  /** Height of the radar strip above the grid, in CSS pixels. Read by render/. */
  radarHeightPx: number;
  /**
   * How far a handle's circle reaches from its own centre, in thousandths of a
   * tile — THE MAZE's string, THE WARDEN's rope and THE LID's cord all wear the
   * same one.
   *
   * **It is here rather than in render/ because the rule needs it.** A pull may
   * not carry a handle off the field (`handle-pull.ts`), and what has to stay on
   * is the whole circle rather than its centre — so the bound is inset by
   * exactly this, and the simulation has to know the number the picture is
   * drawn at. It was a `HANDLE_TILES` constant written out in two render files;
   * a third copy in the clamp is how a control comes to be answered somewhere
   * it is not drawn.
   */
  handleRadiusMilli: number;
  /**
   * Perspective by row: how much larger a body draws on the hull row than on
   * the top row. 1 is the flat field. Read by render/ (`depth.ts`) and by
   * nothing else — `hashWorld` leaves `cfg` out, so two devices may disagree
   * about it and still agree about the world. Never below 1: the direction is
   * a constraint, because a shrinking far row walks through the 20–26 px
   * nameability floor. `render/src/depth.ts` derives 1.125 twice, and
   * `render/test/depth.test.ts` keeps it from being raised past either.
   */
  depthNearScale: number;
  /**
   * Atmospheric perspective: how far a body on the *top* row has its colours
   * mixed toward the field's far colour, 0 to 1, falling to 0 at the hull.
   * One mix pays for dimmer, cooler and lower contrast at once. Read by
   * render/ (`depth.ts`).
   */
  depthHaze: number;
}

export const DEFAULT_CONFIG: SimConfig = {
  ...BOSS_DEFAULTS,
  ...CAROM_DEFAULTS,
  ...VEER_DEFAULTS,
  ...VOLLEY_DEFAULTS,
  ...CREATURE_DEFAULTS,
  ...FLEET_DEFAULTS,
  ...GAUGE_DEFAULTS,
  ...GHOST_DEFAULTS,
  ...GYRE_DEFAULTS,
  ...RECOIL_DEFAULTS,
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
  bulletGlideMs: 130,
  bandPct: 31,
  bandSoloPct: 27,
  radarHeightPx: 34,
  handleRadiusMilli: 300,
  depthNearScale: 1.125,
  depthHaze: 0.3,
  briefings: false,
};

export {
  hullRow,
  midCol,
  msToTicks,
  ticksPerBeat,
} from "./config-derived.js";
