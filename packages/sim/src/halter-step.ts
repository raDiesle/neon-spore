import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  freshHalter,
  type HalterState,
  type HalterStep,
  halterGuarding,
  halterLitStep,
  halterPairing,
  halterResters,
  halterSeatIndex,
  halterSide,
} from "./halter.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE HALTER's clock: the seam settling in, each step lighting, each seat's
 * rest counted, a pair held together being counted, a window running out,
 * and the split.
 *
 * The shot is judged where a bolt leaves the top of the field
 * (`halter-shot.ts`) and calls `halterAnswered` here; every command and every
 * grip is heard on the tick (`halter-hand.ts`), and the rest and the pair are
 * only *counted* here, on the beat, because what `RestraintGate` asks is a
 * number of whole beats with nothing in them.
 *
 * **A rest-and-chord window that runs out is tried again**, the step relit
 * after a pause with the cursor where it was — §36's "retry from row 2". A
 * guard that runs out shuts the plating over the centre as well, and the same
 * guard is asked again until it is made. **A shot that runs out is the
 * hull**, THE SEAM's rule (`seam-step.ts`).
 */

export function installHalter(world: World, steps: readonly HalterStep[]): HalterState {
  const s = freshHalter(world.beat, steps);
  world.events.push({ type: "halterEnter", col: midCol(world.cfg) });
  return s;
}

export function stepHalter(world: World, s: HalterState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.halterSpentBeats) {
      world.events.push({ type: "halterOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  countRest(world, s);
  if (s.phase === "alarmed" && since >= cfg.halterAlarmBeats) next(world, s);
  else if (s.phase === "pause" && since >= cfg.halterPauseBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

/**
 * One more beat of rest for every seat that sent nothing in it, held at the
 * threshold; nought for one that did. A resting seat of the lit step that
 * comes to the threshold with no grip down says so, once.
 */
function countRest(world: World, s: HalterState): void {
  const threshold = world.cfg.halterRestThreshold;
  const resters = halterLitStep(s)?.ask === "fire" ? [] : halterResters(s);
  for (const seat of [1, 2] as const) {
    const i = halterSeatIndex(seat);
    const was = s.restBeats[i];
    s.restBeats[i] = s.stirred[i] ? 0 : Math.min(was + 1, threshold);
    s.stirred[i] = false;
    if (
      was < threshold &&
      s.restBeats[i] >= threshold &&
      s.grips[i] === 0 &&
      resters.includes(seat)
    ) {
      world.events.push({ type: "halterSettle", seat, col: midCol(world.cfg) });
    }
  }
}

function lit(world: World, s: HalterState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  if (step.ask === "fire") {
    if (since >= step.beats) miss(world, s);
    return;
  }
  if (halterPairing(world, s) !== null) {
    s.heldBeats += 1;
    if (s.heldBeats >= world.cfg.halterHoldBeats) {
      held(world, s);
      return;
    }
  } else s.heldBeats = 0;
  if (since < step.beats) return;
  world.events.push({ type: "halterShut", col: midCol(world.cfg) });
  halterSeal(world, s);
  closeSlow(world);
  pause(world, s, false);
}

/** The pair held together its beats: a segment cracks, or a guard is made. */
function held(world: World, s: HalterState): void {
  const col = midCol(world.cfg);
  const side = halterSide(s);
  if (side === null) {
    s.bared = true;
    world.events.push({ type: "halterGuard", col });
  } else {
    s.cracks[side] = 1;
    world.events.push({ type: "halterCrack", side, col });
    if (s.cracks[0] > 0 && s.cracks[1] > 0 && !s.bared) {
      s.bared = true;
      world.events.push({ type: "halterBare", col });
    }
  }
  halterAnswered(world, s);
}

/**
 * A guard failing shuts the plating over a bared centre, to be held off
 * again: its window running out, or its pair coming apart
 * (`halter-hand.ts`). Anything else it is not about is left alone.
 */
export function halterSeal(world: World, s: HalterState): void {
  if (!halterGuarding(s) || !s.bared) return;
  s.bared = false;
  world.events.push({ type: "halterSeal", col: midCol(world.cfg) });
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * seam pauses. Called by the shot and by a pair's count.
 */
export function halterAnswered(world: World, s: HalterState): void {
  closeSlow(world);
  pause(world, s, true);
}

/**
 * The next step lights; or, with the script done, the seam splits. Both
 * counts start from nought as it lights, so a settle is always an answer to
 * the mark. A rest-and-chord step lights under THE SLOW; a shot without it,
 * §36's rows.
 */
function next(world: World, s: HalterState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "spent";
    s.phaseBeat = world.beat;
    world.events.push({ type: "halterSplit", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  s.restBeats = [0, 0];
  s.stirred = [false, false];
  if (step.ask !== "fire") openSlow(world, step.beats + 1, "ask");
  world.events.push({ type: "halterLight", ask: step.ask, col });
}

/** A fire step ran out with the centre unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: HalterState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "halterMiss", col });
  pause(world, s, true);
  bossStrikesHull(world, "halter", col);
}

function pause(world: World, s: HalterState, advance: boolean): void {
  s.phase = "pause";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (advance) s.cursor += 1;
}
