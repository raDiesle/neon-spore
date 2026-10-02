import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  type FlueState,
  type FlueStep,
  flueDrifts,
  flueEmberCol,
  flueSeatIndex,
  flueSettled,
  flueSteady,
  freshFlue,
} from "./flue.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE FLUE's clock: the rest counted for each seat, the ember drifting on its
 * own or stopping dead, each step lighting, a window running out, and the
 * damper swung open for good.
 *
 * The commands are heard on the tick (`flue-hand.ts`) — every one of them,
 * THE HALTER's reason (`halter-hand.ts`) — and the taps judged there; the
 * rest is only *counted* here, on the beat, because a stillness is a number
 * of beats. The shot is judged where a bolt leaves the top of the field
 * (`flue-shot.ts`).
 *
 * **A vent or a damper that runs out is tried again**, the step relit after a
 * rest with the cursor where it was; a damper run out shuts over the core as
 * well, until it is held open. **A shot that runs out is the hull**, THE
 * SEAM's rule (`seam-step.ts`).
 */

export function installFlue(world: World, steps: readonly FlueStep[]): FlueState {
  const s = freshFlue(world.beat, steps);
  world.events.push({ type: "flueEnter", col: midCol(world.cfg) });
  return s;
}

export function stepFlue(world: World, s: FlueState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  countRest(world, s);
  drift(world, s);
  if (s.phase === "spent") {
    if (since >= cfg.flueSpentBeats) {
      world.events.push({ type: "flueOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "slack" && since >= cfg.flueSlackBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.fluePauseBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

/**
 * One more beat of rest for every seat that sent nothing in it, held at the
 * threshold; nought for one that did (`halter-step.ts`). The beat a lit
 * vent's rester comes to the threshold, the ember stops dead on the column
 * nearest it and says so, once.
 */
function countRest(world: World, s: FlueState): void {
  const threshold = world.cfg.flueRestThreshold;
  const was = flueSteady(world, s);
  for (const seat of [1, 2] as const) {
    const i = flueSeatIndex(seat);
    s.restBeats[i] = s.stirred[i] ? 0 : Math.min(s.restBeats[i] + 1, threshold);
    s.stirred[i] = false;
  }
  if (was || !flueSteady(world, s)) return;
  s.emberMilli = Math.round(s.emberMilli / 1000) * 1000;
  world.events.push({ type: "flueSteady", col: flueEmberCol(world.cfg, s) });
}

/** One beat of the ember loose: carried on along the slot, turned back off either end. */
function drift(world: World, s: FlueState): void {
  if (!flueDrifts(world, s)) return;
  const span = world.cfg.flueSpanMilli;
  let at = s.emberMilli + s.emberDir * world.cfg.flueDriftMilli;
  if (at > span) {
    at = 2 * span - at;
    s.emberDir = -1;
  } else if (at < -span) {
    at = -2 * span - at;
    s.emberDir = 1;
  }
  s.emberMilli = Math.max(-span, Math.min(span, at));
}

function lit(world: World, s: FlueState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  const col = midCol(world.cfg);
  if (step.ask === "damper" && flueSettled(world, s)) {
    s.bared = true;
    world.events.push({ type: "flueHeld", col });
    flueAnswered(world, s);
    return;
  }
  if (since < step.beats) return;
  if (step.ask === "fire") {
    miss(world, s);
    return;
  }
  if (step.ask === "damper") {
    s.bared = false;
    world.events.push({ type: "flueShut", col });
  } else world.events.push({ type: "flueChoke", col });
  closeSlow(world);
  rest(world, s, false);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * flue rests. Called by the third tap, by a damper held and by the shot.
 */
export function flueAnswered(world: World, s: FlueState): void {
  closeSlow(world);
  rest(world, s, true);
}

/**
 * The next step lights, a vent or a damper under THE SLOW, with every seat's
 * rest counted from nought — a stillness is proved inside the step that asks
 * for it; or, with the script done, the damper swings open for good.
 */
function next(world: World, s: FlueState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "spent";
    s.phaseBeat = world.beat;
    world.events.push({ type: "flueSpent", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.taps = 0;
  s.restBeats = [0, 0];
  s.stirred = [false, false];
  const kind = step.ask === "damper" ? "hold" : "ask";
  if (step.ask !== "fire") openSlow(world, step.beats + 1, kind);
  const at = step.ask === "vent" ? flueEmberCol(world.cfg, s) : col;
  world.events.push({ type: "flueLight", ask: step.ask, col: at });
}

/** A fire step ran out with the core unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: FlueState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "flueMiss", col });
  rest(world, s, true);
  bossStrikesHull(world, "flue", col);
}

/** Between steps: the taps of the step go with it, so a relit vent starts from nought. */
function rest(world: World, s: FlueState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.taps = 0;
  if (advance) s.cursor += 1;
}
