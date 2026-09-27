import {
  BURGEE_CATCHES,
  type BurgeeState,
  burgeeFrozen,
  burgeeHeld,
  burgeeLitStep,
  type SimConfig,
} from "@neon-spore/sim";
import type { BurgeeFx } from "./burgee-fx.js";
import type { FlagLay } from "./burgee-shape.js";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE BURGEE is posed off** (§39, *Animation*), four poses: the
 * flag sweeping loose, streamed out behind its boom by how fast it goes;
 * the first catch held, the canvas brightened half-way; both caught, the
 * flag hanging still off the lit spindle; and the spindle guarded, dimmed,
 * while the flag creeps loose to be caught back.
 *
 * **Where the flag is asked to be is the simulation's place, spread across
 * the beat.** The simulation moves it once a beat; drawn there it would jump
 * a column a beat. So while it swings it is drawn half a beat either side of
 * that place — at the beat's middle exactly on it — which puts the drawn
 * flag over a column for the very beat the simulation says it is on that
 * column, and turns it back off either end of the span the way the
 * simulation does. Frozen or held it is asked to stay on its place, and
 * `burgee-fx.ts` eases it there.
 */

/** How far a flag streaming straight out stands off its boom, in radians. */
const STREAM = 1.3;
/** Its idle sway either way when it hangs, in radians, and how fast. */
const SWAY = 0.08;
const SWAY_RATE = 1.1;

/** How far into its phase the burgee is, in beats, the fraction of this one included. */
export function into(s: BurgeeState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** The boom swinging down into the field as it arrives: 0 still above it, 1 hanging. */
export function burgeeArrived(
  s: BurgeeState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "slack" || s.cursor > 0) return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.burgeeSlackBeats));
}

/** Whether the flag swings this beat: neither frozen nor held on the spindle. */
export function burgeeSwinging(s: BurgeeState): boolean {
  return !burgeeFrozen(s) && !burgeeHeld(s);
}

/** Where the drawer asks the flag to be this frame, thousandths of a column off the middle. */
export function burgeeAsked(s: BurgeeState, cfg: SimConfig, beatPhase: number): number {
  if (!burgeeSwinging(s)) return s.swingMilli;
  const step = burgeeLitStep(s);
  const sweep = step !== null && step.ask !== "fire" ? step.sweepMilli : cfg.burgeeSweepMilli;
  const span = cfg.burgeeSpanMilli;
  const at = s.swingMilli + s.swingDir * sweep * (beatPhase - 0.5);
  if (at > span) return 2 * span - at;
  if (at < -span) return -2 * span - at;
  return at;
}

/**
 * How the flag is laid: streamed out behind its boom by its drawn speed,
 * turned with the field (`across` is the sign of a column's pixels), opened
 * by as much, and rippled — quick and shallow while it streams, long and
 * slow for a flutter left by a swipe that caught nothing, a quick shiver for
 * a tap off the mark — and a catch pulls it open and flat for a moment.
 */
export function burgeeLay(fx: BurgeeFx, across: number, time: number): FlagLay {
  const lean = fx.flag.lean * Math.sign(across || 1);
  const out = Math.abs(lean);
  const { limp, flap, taut } = fx;
  return {
    angle: lean * STREAM + (1 - out) * (1 - taut) * SWAY * Math.sin(time * SWAY_RATE),
    open: Math.min(1, 0.25 + 0.75 * out + 0.35 * limp + taut),
    ripple: (0.05 + 0.1 * out + 0.26 * limp + 0.14 * flap) * (1 - 0.85 * taut),
    wave: time * (2.4 + 7 * out - 1.2 * limp + 9 * flap),
    time,
  };
}

/** How far the canvas has brightened: half for each catch. */
export function burgeeCaught(s: BurgeeState): number {
  return Math.min(1, s.catches / BURGEE_CATCHES);
}

/** How much of the lit step is still to run, 1 as it lights and 0 when it is out. */
export function burgeeLeft(s: BurgeeState, beat: number, beatPhase: number): number {
  const step = burgeeLitStep(s);
  if (step === null) return 0;
  return Math.max(0, 1 - into(s, beat, beatPhase) / Math.max(1, step.beats));
}

/**
 * How lit the spindle is between shots: nought until both catches are in,
 * full while it is held caught, and dimmed while it is guarded — a recatch
 * lit, the flag creeping loose, and no shot able to land.
 */
export function burgeeSpindleGlow(s: BurgeeState): number {
  if (!s.spindleLit || s.phase === "spent") return 0;
  return burgeeLitStep(s)?.ask === "recatch" ? 0.3 : 1;
}

/** How far the spent flag has faded, 0 not spent and 1 gone. */
export function burgeeSpent(s: BurgeeState, cfg: SimConfig, beat: number, beatPhase: number) {
  if (s.phase !== "spent") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.burgeeSpentBeats));
}
