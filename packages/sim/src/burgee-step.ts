import { bossStrikesHull } from "./boss-strike.js";
import {
  BURGEE_CATCHES,
  type BurgeeState,
  type BurgeeStep,
  burgeeAims,
  burgeeHeld,
  burgeeLitStep,
  burgeeMarkCol,
  freshBurgee,
} from "./burgee.js";
import { midCol } from "./config.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE BURGEE's clock: the flag swinging on its own, a freeze running out, the
 * beats a draw is held being counted, each step lighting, a window running
 * out, and the flag swung spent.
 *
 * The taps and the draws are heard on the tick (`burgee-hand.ts`), judged at
 * the tap and at the lift, and only *counted* here, on the beat, because a
 * freeze lasts a number of beats and a draw asks for one. The shot is judged
 * where a bolt leaves the top of the field (`burgee-shot.ts`).
 *
 * **A catch or a recatch that runs out is tried again**, the step relit after
 * a rest with the cursor where it was; a recatch run out dims the spindle as
 * well, so no fire step lights until it is made. **A shot that runs out is
 * the hull**, THE SEAM's rule (`seam-step.ts`).
 */

export function installBurgee(world: World, steps: readonly BurgeeStep[]): BurgeeState {
  const s = freshBurgee(world.beat, steps);
  world.events.push({ type: "burgeeEnter", col: midCol(world.cfg) });
  return s;
}

export function stepBurgee(world: World, s: BurgeeState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  swing(world, s);
  if (s.phase === "spent") {
    if (since >= cfg.burgeeSpentBeats) {
      world.events.push({ type: "burgeeOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "slack" && since >= cfg.burgeeSlackBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.burgeeRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

/**
 * One beat of the flag: a freeze counted down, and let go when it runs out;
 * or, not frozen and not held on the spindle, the swing carried on, turned
 * back off either end of the span.
 */
function swing(world: World, s: BurgeeState): void {
  const cfg = world.cfg;
  if (s.frozenBeats > 0) {
    s.frozenBeats -= 1;
    if (s.frozenBeats > 0) return;
    s.frozenBy = null;
    world.events.push({ type: "burgeeLapse", col: midCol(cfg) });
    return;
  }
  if (burgeeHeld(s)) return;
  const step = burgeeLitStep(s);
  const sweep = step !== null && step.ask !== "fire" ? step.sweepMilli : cfg.burgeeSweepMilli;
  const span = cfg.burgeeSpanMilli;
  let at = s.swingMilli + s.swingDir * sweep;
  if (at > span) {
    at = 2 * span - at;
    s.swingDir = -1;
  } else if (at < -span) {
    at = -2 * span - at;
    s.swingDir = 1;
  }
  s.swingMilli = Math.max(-span, Math.min(span, at));
}

function lit(world: World, s: BurgeeState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  for (const side of [0, 1] as const) {
    if (!s.holding[side] || !burgeeAims(s, side)) continue;
    if (s.drawnBeats[side] < world.cfg.burgeeDrawBeats) s.drawnBeats[side] += 1;
  }
  if (since < step.beats) return;
  if (step.ask === "fire") {
    miss(world, s);
    return;
  }
  const col = midCol(world.cfg);
  if (step.ask === "recatch") {
    s.spindleLit = false;
    world.events.push({ type: "burgeeDim", col });
  } else world.events.push({ type: "burgeeSway", col });
  closeSlow(world);
  rest(world, s, false);
}

/**
 * A seat loosed its draw true — held its beats, lifted while the flag was
 * still frozen over the lit column and swiped toward it — in a step that
 * asked it: a catch landed, or the flag caught again under the spindle.
 * Called by the lift (`burgee-hand.ts`).
 */
export function burgeeCaught(world: World, s: BurgeeState, side: 0 | 1): void {
  const col = burgeeMarkCol(world.cfg, s) ?? midCol(world.cfg);
  if (burgeeLitStep(s)?.ask === "recatch") {
    s.spindleLit = true;
    world.events.push({ type: "burgeeRecatch", side, col });
    burgeeAnswered(world, s);
    return;
  }
  s.catches = Math.min(BURGEE_CATCHES, s.catches + 1);
  world.events.push({ type: "burgeeCatch", side, catches: s.catches, col });
  if (s.catches >= BURGEE_CATCHES && !s.spindleLit) {
    s.spindleLit = true;
    world.events.push({ type: "burgeeSpindle", col: midCol(world.cfg) });
  }
  burgeeAnswered(world, s);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * boom rests. Called by the shot and by a catch.
 */
export function burgeeAnswered(world: World, s: BurgeeState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights, a catch under THE SLOW; or, with the script done, the flag swings spent. */
function next(world: World, s: BurgeeState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "spent";
    s.phaseBeat = world.beat;
    world.events.push({ type: "burgeeSpent", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.drawnBeats = [0, 0];
  if (step.ask !== "fire") openSlow(world, step.beats + 1, "ask");
  const at = step.ask === "fire" ? col : col + step.offset;
  world.events.push({ type: "burgeeLight", ask: step.ask, offset: step.offset, col: at });
}

/** A fire step ran out with the spindle unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: BurgeeState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "burgeeMiss", col });
  rest(world, s, true);
  bossStrikesHull(world, "burgee", col);
}

/** Between steps: the freeze let go with the step, so a relit catch is tapped still again. */
function rest(world: World, s: BurgeeState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.drawnBeats = [0, 0];
  s.frozenBeats = 0;
  s.frozenBy = null;
  if (advance) s.cursor += 1;
}
