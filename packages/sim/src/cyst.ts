import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CYST: a sac of two flanks over the middle column, each stilled by one
 * seat's tap so the other seat can pinch it shut, and then a core that has to
 * be shot in the colour it shows (`docs/spec/bosses-choreographed.md` §34).
 *
 * **The rule is one sentence**: tap to still your partner's flank, and pinch
 * your own flank shut while it is still; then shoot the bared core.
 *
 * Each flank has two handles, on two seats. The pilot pinches the left flank
 * (`cystFlankLeft`) and taps the right one still (`cystFreezeRight`); the
 * navigator pinches the right (`cystFlankRight`) and taps the left
 * (`cystFreezeLeft`). A flank step lights its flank shuddering; the partner's
 * tap stills it for the step's beats and a grace, and only while it is still
 * does a pinch at or under `cystShutMilli` count. The shudder is the rule
 * that a pinch on a flank nobody stilled counts nothing — §34's drift, which
 * outpaces any pinch, stated as what it does rather than as a field.
 *
 * One crack a flank; both cracked bare the core. After that a flank step is a
 * **guard**: the same tap and pinch, to hold the flank off the core, which
 * reseals if it is missed and is bared again when the guard is made.
 *
 * **Three story steps** break the alternation, each under THE SLOW. **The
 * swell**: the sac goes taut and stops shuddering on its own, and both seats
 * pinch their own flank shut together. **The spit**: a spore down a column
 * off the middle, turned by the shield under it. **The bud**: a bud swells
 * out over a column off the middle, shot there in its colour.
 *
 * **Its health is the two flanks and the three shots.** A tap or a pinch
 * that runs out is tried again; a shot, a swell, a spit or a bud that runs
 * out is THE CYST's own blow at the hull.
 */

/**
 * Where the scene is: settling, a step lit and waiting (for a tap, or for a
 * shot), a flank stilled and the pinch counting, the sac resting between
 * steps, and the sac split open.
 */
export const CYST_PHASES = ["still", "lit", "frozen", "rest", "split"] as const;
export type CystPhase = (typeof CYST_PHASES)[number];

/**
 * What a step asks: the left flank stilled and pinched, the right, a shot at
 * the core, both flanks pinched at once, the spore shielded, or the bud shot.
 */
export const CYST_ASKS = ["left", "right", "fire", "swell", "spit", "bud"] as const;
export type CystAsk = (typeof CYST_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface CystStep {
  ask: CystAsk;
  /** The colour a shot must be, or `"either"`. A fire or bud step reads it. */
  color: Color | "either";
  /**
   * Beats: how long a pinch or a swell must be kept shut, how long a fire,
   * spit or bud step waits for its answer.
   */
  beats: number;
  /** Columns off the middle the spore falls or the bud swells. Only a spit or a bud reads it. */
  offset?: number;
}

/** What a wave authors: the whole script, in order. */
export interface CystEntry {
  kind: "cyst";
  steps: readonly CystStep[];
}

export interface CystState {
  kind: "cyst";
  /** Copied at install and never written again. */
  steps: CystStep[];
  phase: CystPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Whether each flank has cracked, the left then the right: nought or one. */
  cracks: [number, number];
  /** Shots the core has taken. */
  hits: number;
  /** Whether the core lies bare to be shot. */
  bared: boolean;
  /**
   * Each flank's gap, in thousandths of a tile: the distance between the two
   * touches on it, or `cystOpenMilli` with no pinch on it.
   */
  gapMilli: [number, number];
  /** Whether a thumb is down on each flank's freeze mark, the left then the right: the tap's edge. */
  tapDown: [boolean, boolean];
  /** Beats of the frozen step its flank has been kept shut, or of a swell both have. */
  heldBeats: number;
  /** `world.tick` the lit step lit: a shield pressed before it turns no spore. */
  litTick: number;
}

export function cystBoss(world: World): CystState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "cyst" ? boss : null;
}

/** The step lit or frozen, or null between steps. */
export function cystLitStep(s: CystState): CystStep | null {
  return s.phase === "lit" || s.phase === "frozen" ? (s.steps[s.cursor] ?? null) : null;
}

/** The flank the lit step is about, nought for the left and one for the right; null for a shot. */
export function cystSide(s: CystState): 0 | 1 | null {
  const ask = cystLitStep(s)?.ask;
  return ask === "left" ? 0 : ask === "right" ? 1 : null;
}

/** Whether a flank step is a guard — its flank already cracked, so it holds the flank off the core. */
export function cystGuarding(s: CystState): boolean {
  const side = cystSide(s);
  return side !== null && s.cracks[side] > 0;
}

/** Whether the lit flank is stilled and pinched shut this instant: what a beat counts. */
export function cystClosed(world: World, s: CystState): boolean {
  const side = cystSide(s);
  return s.phase === "frozen" && side !== null && s.gapMilli[side] <= world.cfg.cystShutMilli;
}

/** Whether the lit step is a swell and both flanks are pinched shut this instant. */
export function cystClenched(world: World, s: CystState): boolean {
  const shut = world.cfg.cystShutMilli;
  return (
    s.phase === "lit" &&
    cystLitStep(s)?.ask === "swell" &&
    s.gapMilli[0] <= shut &&
    s.gapMilli[1] <= shut
  );
}

/** The column a spore falls down or a bud swells over. */
export function cystStepCol(mid: number, step: CystStep): number {
  return mid + (step.offset ?? 0);
}

/** The seat that taps a flank still: always the partner of the seat that pinches it. */
export function cystFreezer(side: 0 | 1): 1 | 2 {
  return side === 0 ? 2 : 1;
}

/** The seat that pinches a flank: the pilot the left, the navigator the right. */
export function cystPincher(side: 0 | 1): 1 | 2 {
  return side === 0 ? 1 : 2;
}

/** The sac split: the fight is over and it is only falling. */
export function cystDone(s: CystState): boolean {
  return s.phase === "split";
}

/** A fresh sac: both flanks whole and wide, the core covered, no thumb on it. */
export function freshCyst(beat: number, steps: readonly CystStep[], openMilli: number): CystState {
  return {
    kind: "cyst",
    steps: steps.map((step) => ({ ...step })),
    phase: "still",
    phaseBeat: beat,
    cursor: 0,
    cracks: [0, 0],
    hits: 0,
    bared: false,
    gapMilli: [openMilli, openMilli],
    tapDown: [false, false],
    heldBeats: 0,
    litTick: 0,
  };
}
