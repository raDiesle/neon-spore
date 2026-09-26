import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  type CystState,
  type CystStep,
  cystClosed,
  cystGuarding,
  cystSide,
  freshCyst,
} from "./cyst.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE CYST's clock: the sac settling, each step lighting, a lit flank waiting
 * for its tap, a stilled flank's pinch being counted, a window running out,
 * and the split.
 *
 * The shot is judged where a bolt leaves the top of the field
 * (`cyst-shot.ts`) and calls `cystAnswered` here; the tap and the gap are
 * heard on the tick (`cyst-hand.ts`), and the pinch only *counted* here, on
 * the beat, because what a flank step asks is a number of beats.
 *
 * **A tap or a pinch that runs out is tried again**, from the tap, the step
 * relit after a rest with the cursor where it was — §34's "retry from row 2".
 * A guard that runs out reseals the core as well, and the same guard is asked
 * again until it is made. **A shot that runs out is the hull**, THE SEAM's
 * rule (`seam-step.ts`).
 */

export function installCyst(world: World, steps: readonly CystStep[]): CystState {
  const s = freshCyst(world.beat, steps, world.cfg.cystOpenMilli);
  world.events.push({ type: "cystEnter", col: midCol(world.cfg) });
  return s;
}

export function stepCyst(world: World, s: CystState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "split") {
    if (since >= cfg.cystSplitBeats) {
      world.events.push({ type: "cystOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.cystStillBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.cystRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
  else if (s.phase === "frozen") frozen(world, s, since);
}

/** How long a stilled flank stays still: the pinch's own beats and the grace. */
export function cystFrozenBeats(world: World, step: CystStep): number {
  return step.beats + world.cfg.cystGraceBeats;
}

/** How long a step is lit before its tap or its shot: the tap's window, or a shot's beats. */
export function cystLitBeats(world: World, step: CystStep): number {
  return step.ask === "fire" ? step.beats : world.cfg.cystTapBeats;
}

function lit(world: World, s: CystState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined || since < cystLitBeats(world, step)) return;
  const side = cystSide(s);
  if (side === null) {
    miss(world, s);
    return;
  }
  world.events.push({ type: "cystShudder", side, col: midCol(world.cfg) });
  failed(world, s, side);
}

function frozen(world: World, s: CystState, since: number): void {
  const step = s.steps[s.cursor];
  const side = cystSide(s);
  if (step === undefined || side === null) return;
  if (cystClosed(world, s)) {
    s.heldBeats += 1;
    if (s.heldBeats >= step.beats) {
      held(world, s, side);
      return;
    }
  }
  if (since < cystFrozenBeats(world, step)) return;
  world.events.push({ type: "cystSpring", side, col: midCol(world.cfg) });
  failed(world, s, side);
}

/**
 * The partner's tap landed on the lit flank: it stops dead, and THE SLOW
 * holds for the pinch. Called from the tap (`cyst-hand.ts`).
 */
export function cystStilled(world: World, s: CystState, side: 0 | 1): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "frozen";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  openSlow(world, cystFrozenBeats(world, step) + 1, "ask");
  world.events.push({ type: "cystStill", side, col: midCol(world.cfg) });
}

/** A stilled flank kept shut its beats: it cracks, or a guard is made. */
function held(world: World, s: CystState, side: 0 | 1): void {
  const col = midCol(world.cfg);
  if (cystGuarding(s)) {
    s.bared = true;
    world.events.push({ type: "cystGuard", side, col });
  } else {
    s.cracks[side] = 1;
    world.events.push({ type: "cystCrack", side, col });
    if (s.cracks[0] > 0 && s.cracks[1] > 0 && !s.bared) {
      s.bared = true;
      world.events.push({ type: "cystBare", col });
    }
  }
  cystAnswered(world, s);
}

/** A flank step ran out, at its tap or its pinch: tried again, and a guard reseals the core. */
function failed(world: World, s: CystState, side: 0 | 1): void {
  if (cystGuarding(s) && s.bared) {
    s.bared = false;
    world.events.push({ type: "cystSeal", side, col: midCol(world.cfg) });
  }
  closeSlow(world);
  rest(world, s, false);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * sac rests. Called by the shot and by a pinch's count.
 */
export function cystAnswered(world: World, s: CystState): void {
  closeSlow(world);
  rest(world, s, true);
}

/**
 * The next step lights; or, with the script done, the sac splits. A flank
 * lights under THE SLOW for its tap; a shot lights without it, §34's rows.
 */
function next(world: World, s: CystState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "split";
    s.phaseBeat = world.beat;
    world.events.push({ type: "cystSplit", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (step.ask !== "fire") openSlow(world, cystLitBeats(world, step), "ask");
  world.events.push({ type: "cystLight", ask: step.ask, col });
}

/** A fire step ran out with the core unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: CystState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "cystMiss", col });
  rest(world, s, true);
  bossStrikesHull(world, "cyst", col);
}

function rest(world: World, s: CystState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (advance) s.cursor += 1;
}
