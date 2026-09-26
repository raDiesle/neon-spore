import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  freshPlumb,
  PLUMB_SETTLES_PER_WEIGHT,
  type PlumbState,
  type PlumbStep,
  plumbTrue,
} from "./plumb.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE PLUMB's clock: the bob settling, each step lighting, the beats a lean
 * is held being counted, a window running out, and the bob swinging free.
 *
 * The shot is judged where a bolt leaves the top of the field
 * (`plumb-shot.ts`) and calls `plumbAnswered` here; the leans are heard on
 * the tick (`plumb-hand.ts`) and only *counted* here, on the beat, because
 * what a level step asks is a number of beats.
 *
 * **A level that runs out is tried again**, the step relit after a rest with
 * the cursor where it was: §31 has a weight swing loose and a core dim, and
 * neither is a hull hit. **A shot that runs out is the hull**, THE VISE's rule
 * (`vise-step.ts`): this game has no hull hit that is not the wave.
 */

export function installPlumb(world: World, steps: readonly PlumbStep[]): PlumbState {
  const s = freshPlumb(world.beat, steps);
  world.events.push({ type: "plumbEnter", col: midCol(world.cfg) });
  return s;
}

export function stepPlumb(world: World, s: PlumbState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "free") {
    if (since >= cfg.plumbFreeBeats) {
      world.events.push({ type: "plumbOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.plumbStillBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.plumbRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

/** How long the lit step stays lit: a level's own beats and the grace, or a shot's beats. */
export function plumbWindowBeats(world: World, step: PlumbStep): number {
  return step.ask === "fire" ? step.beats : step.beats + world.cfg.plumbGraceBeats;
}

function lit(world: World, s: PlumbState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  if (plumbTrue(s)) {
    s.heldBeats += 1;
    if (s.heldBeats >= step.beats) {
      held(world, s, step);
      return;
    }
  }
  if (since < plumbWindowBeats(world, step)) return;
  if (step.ask === "fire") miss(world, s);
  else swung(world, s, step);
}

/** A level step held its beats: a weight settled, or both held true under the core. */
function held(world: World, s: PlumbState, step: PlumbStep): void {
  const col = midCol(world.cfg);
  if (step.ask === "both") {
    s.coreLit = true;
    world.events.push({ type: "plumbSteady", col });
  } else {
    const side: 0 | 1 = step.ask === "left" ? 0 : 1;
    s.weights[side] = Math.min(PLUMB_SETTLES_PER_WEIGHT, s.weights[side] + 1);
    world.events.push({ type: "plumbSettle", side, level: s.weights[side], col });
    const plumb =
      s.weights[0] >= PLUMB_SETTLES_PER_WEIGHT && s.weights[1] >= PLUMB_SETTLES_PER_WEIGHT;
    if (plumb && !s.coreLit) {
      s.coreLit = true;
      world.events.push({ type: "plumbCore", col });
    }
  }
  plumbAnswered(world, s);
}

/** A level step ran out: the weight swings loose, or the core dims off true. */
function swung(world: World, s: PlumbState, step: PlumbStep): void {
  const col = midCol(world.cfg);
  if (step.ask === "both") {
    s.coreLit = false;
    world.events.push({ type: "plumbDim", col });
  } else world.events.push({ type: "plumbSwing", side: step.ask === "left" ? 0 : 1, col });
  closeSlow(world);
  rest(world, s, false);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * bob rests. Called by the shot and by a level's count.
 */
export function plumbAnswered(world: World, s: PlumbState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights under THE SLOW; or, with the script done, the bob swings free. */
function next(world: World, s: PlumbState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "free";
    s.phaseBeat = world.beat;
    world.events.push({ type: "plumbFree", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  openSlow(world, plumbWindowBeats(world, step), "ask");
  world.events.push({ type: "plumbLight", ask: step.ask, col });
}

/** A fire step ran out with the core unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: PlumbState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "plumbMiss", col });
  closeSlow(world);
  rest(world, s, true);
  bossStrikesHull(world, "plumb", col);
}

function rest(world: World, s: PlumbState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (advance) s.cursor += 1;
}
