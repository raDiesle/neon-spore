import {
  type CapstanState,
  capstanLitStep,
  capstanSeatIndex,
  capstanSteerer,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE CAPSTAN is posed off** (§37, *Animation*): the drum
 * dropping in rusted; the cradle rocked by the lean steering it; a band worn
 * bright mark by mark; the core bared, its cap creeping back over it through
 * a hold and pushed open again by the pair; and the cap swung wide, spent —
 * each read straight off the world, since the lean, the wear and the beats a
 * hold has kept are numbers the simulation keeps.
 *
 * **The rock is the lean itself.** The cradle stands at the steering seat's
 * reading as a share of the mark — a phone tilted slowly rocks it slowly,
 * the legibility §37 asks for, and past the mark is past a full turn. A hold,
 * a shot or a rest has no steerer until someone leans past the mark, so the
 * cradle follows whichever phone is leaning further: the pair sees it start
 * to go before it goes.
 *
 * **The rattle never stops** while the drum stands (`capstanJudder`): three
 * sines no two of which beat together under a slow swell, so a thumb that
 * has paused mid-wipe is read by the judder carrying on under it.
 */

/** How far the bared core's cap creeps back through a hold run out unkept, as a share of shut. */
const CREEP = 0.7;
/** How far the cap swings past open as the drum is spent: under nought is flipped over its hinge. */
const SWING = 0.45;

/** How far into its phase the drum is, in beats, the fraction of this one included. */
export function into(s: CapstanState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** The drop into frame: 0 still above the field, 1 standing. */
export function capstanArrived(
  s: CapstanState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "rusted" || s.cursor > 0) return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.capstanRustBeats));
}

/** How far the drum has gone, spent: 0 standing, 1 gone. */
export function capstanGone(
  s: CapstanState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "open") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.capstanOpenBeats));
}

/** How much of the lit step's window is left: 1 as it lights, 0 as it runs out. */
export function capstanLeft(s: CapstanState, beat: number, beatPhase: number): number {
  const step = capstanLitStep(s);
  if (step === null) return 0;
  return Math.max(0, 1 - into(s, beat, beatPhase) / Math.max(1, step.beats));
}

/**
 * How far the cradle is rocked: minus toward the left face, plus toward the
 * right, one at the mark and past it — the steering seat's lean, or with
 * nobody steering, whichever phone is leaning further.
 */
export function capstanTurn(world: World, s: CapstanState): number {
  if (s.phase === "open") return 0;
  const lean = Math.max(1, world.cfg.capstanLeanMilli);
  const steer = capstanSteerer(world, s);
  const [a, b] = s.tiltMilli;
  const tilt =
    steer !== null ? s.tiltMilli[capstanSeatIndex(steer)] : Math.abs(a) >= Math.abs(b) ? a : b;
  return Math.max(-1, Math.min(1, tilt / lean));
}

/** Face `side`'s wear as a share of bright: 1 worn bright for good. */
export function capstanWorn(world: World, s: CapstanState, side: 0 | 1): number {
  return Math.min(1, s.wear[side] / Math.max(1, world.cfg.capstanWearThreshold));
}

/** The share of the lit hold's beats kept, this beat's fraction included while a rub has landed in it. */
export function capstanHeldShare(world: World, s: CapstanState, beatPhase: number): number {
  if (capstanLitStep(s)?.ask !== "hold") return 0;
  const running = s.rubbed ? beatPhase : 0;
  return Math.min(1, (s.heldBeats + running) / Math.max(1, world.cfg.capstanHoldBeats));
}

/**
 * How shut the cap over the core is: 1 shut, 0 swung up off it, under 0
 * swung wide past its hinge as the drum is spent. Through a hold the bared
 * core's cap creeps back as the window runs, and the beats the pair keeps
 * push it open again.
 */
export function capstanCover(
  world: World,
  s: CapstanState,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase === "open") return -SWING * capstanGone(s, world.cfg, beat, beatPhase) - 0.05;
  if (!s.bared) return 1;
  if (capstanLitStep(s)?.ask !== "hold") return 0;
  const run = 1 - capstanLeft(s, beat, beatPhase);
  return CREEP * run * (1 - capstanHeldShare(world, s, beatPhase));
}

/** How hard the drum rattles: twice as hard rusted, and still once spent. */
export function capstanRattle(s: CapstanState): number {
  if (s.phase === "open") return 0;
  return s.phase === "rusted" ? 2 : 1;
}

/**
 * The drum's rattle this instant at `amp` pixels: three sines no two of
 * which keep time, under a slow swell, and a hair of roll with them.
 */
export function capstanJudder(time: number, amp: number): { x: number; y: number; roll: number } {
  if (amp <= 0) return { x: 0, y: 0, roll: 0 };
  const swell = 0.4 + 0.6 * Math.sin(time * 1.1) ** 2;
  const x = Math.sin(time * 31.7) * 0.6 + Math.sin(time * 53.3 + 1.9) * 0.4;
  const y = Math.sin(time * 41.3 + 0.7) * 0.5 + Math.sin(time * 23.9 + 2.3) * 0.5;
  const roll = Math.sin(time * 37.1 + 4.1) * 0.012;
  return { x: x * amp * swell, y: y * amp * swell * 0.6, roll: roll * swell };
}
