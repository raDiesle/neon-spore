import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { closeSlow, openSlow } from "./slow.js";
import {
  freshVise,
  VISE_SEAMS_PER_LOBE,
  type ViseState,
  type ViseStep,
  viseClosed,
} from "./vise.js";
import type { World } from "./world.js";

/**
 * THE VISE's clock: the case settling, each step lighting, the beats a pinch
 * is kept shut being counted, a window running out, and the split.
 *
 * The shot is judged where a bolt leaves the top of the field
 * (`vise-shot.ts`) and calls `viseAnswered` here; the two gaps are heard on
 * the tick (`vise-hand.ts`) and only *counted* here, on the beat, because
 * what a pinch step asks is a number of beats.
 *
 * **A pinch that runs out is tried again**, the step relit after a rest with
 * the cursor where it was: §28 has a missed crack widen back out and a missed
 * hold close the lobes over the kernel, and neither is a hull hit. **A shot
 * that runs out is the hull**, THE SEAM's rule (`seam-step.ts`): this game has
 * no hull hit that is not the wave. So is a bite left unshielded and a seed
 * left hanging, the two story steps (`vise-guard.ts`, `vise-shot.ts`).
 */

export function installVise(world: World, steps: readonly ViseStep[]): ViseState {
  const s = freshVise(world.beat, steps, world.cfg.viseOpenMilli);
  world.events.push({ type: "viseEnter", col: midCol(world.cfg) });
  return s;
}

export function stepVise(world: World, s: ViseState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "split") {
    if (since >= cfg.viseSplitBeats) {
      world.events.push({ type: "viseOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.viseStillBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.viseRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

/** Whether a step is a pinch, one lobe or both, rather than a shot or a shield. */
function pinchStep(step: ViseStep): boolean {
  return step.ask === "left" || step.ask === "right" || step.ask === "both";
}

/** How long the lit step stays lit: a pinch's own beats and the grace, or the step's beats. */
export function viseWindowBeats(world: World, step: ViseStep): number {
  return pinchStep(step) ? step.beats + world.cfg.viseGraceBeats : step.beats;
}

function lit(world: World, s: ViseState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  if (viseClosed(world, s)) {
    s.heldBeats += 1;
    if (s.heldBeats >= step.beats) {
      held(world, s, step);
      return;
    }
  }
  if (since < viseWindowBeats(world, step)) return;
  if (pinchStep(step)) slipped(world, s, step);
  else miss(world, s);
}

/** A pinch step kept shut its beats: a seam cracked, or both lobes held off the kernel. */
function held(world: World, s: ViseState, step: ViseStep): void {
  const col = midCol(world.cfg);
  if (step.ask === "both") {
    s.bared = true;
    world.events.push({ type: "viseBrace", col });
  } else {
    const side: 0 | 1 = step.ask === "left" ? 0 : 1;
    s.cracks[side] = Math.min(VISE_SEAMS_PER_LOBE, s.cracks[side] + 1);
    world.events.push({ type: "viseCrack", side, cracks: s.cracks[side], col });
    const open = s.cracks[0] >= VISE_SEAMS_PER_LOBE && s.cracks[1] >= VISE_SEAMS_PER_LOBE;
    if (open && !s.bared) {
      s.bared = true;
      world.events.push({ type: "viseBare", col });
    }
  }
  viseAnswered(world, s);
}

/** A pinch step ran out: the gap springs wide, or the lobes close over the kernel. */
function slipped(world: World, s: ViseState, step: ViseStep): void {
  const col = midCol(world.cfg);
  if (step.ask === "both") {
    s.bared = false;
    world.events.push({ type: "viseCover", col });
  } else world.events.push({ type: "viseSpring", side: step.ask === "left" ? 0 : 1, col });
  closeSlow(world);
  rest(world, s, false);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * case rests. Called by the shot and by a pinch's count.
 */
export function viseAnswered(world: World, s: ViseState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights under THE SLOW; or, with the script done, the case splits. */
function next(world: World, s: ViseState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "split";
    s.phaseBeat = world.beat;
    world.events.push({ type: "viseSplit", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.litTick = world.tick;
  s.heldBeats = 0;
  openSlow(world, viseWindowBeats(world, step), "ask");
  world.events.push({ type: "viseLight", ask: step.ask, col });
}

/**
 * A step with no second try ran out — the kernel unshot, the bite unshielded,
 * the seed left hanging: the hull takes it, and the wave is lost.
 */
function miss(world: World, s: ViseState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "viseMiss", col });
  closeSlow(world);
  rest(world, s, true);
  bossStrikesHull(world, "vise", col);
}

function rest(world: World, s: ViseState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (advance) s.cursor += 1;
}
