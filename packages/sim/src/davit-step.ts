import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  DAVIT_LOOSES_PER_SWING,
  type DavitState,
  type DavitStep,
  davitDraws,
  davitSteered,
  davitSteering,
  freshDavit,
} from "./davit.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE DAVIT's clock: the boom settling, each step lighting, the beats a
 * steered draw is held being counted, the boom swinging back when nobody
 * steers it, a window running out, and the boom swung spent.
 *
 * The shot is judged where a bolt leaves the top of the field
 * (`davit-shot.ts`) and calls `davitAnswered` here; the leans and the draws
 * are heard on the tick (`davit-hand.ts`), judged at the lift and only
 * *counted* here, on the beat, because what a swing asks is a number of beats
 * held while steered.
 *
 * **A swing or a reland that runs out is tried again**, the step relit after
 * a rest with the cursor where it was — §35's "retry". A reland run out dims
 * the pivot as well, so no fire step lights until it is relanded. **A shot
 * that runs out is the hull**, THE SEAM's rule (`seam-step.ts`).
 */

export function installDavit(world: World, steps: readonly DavitStep[]): DavitState {
  const s = freshDavit(world.beat, steps);
  world.events.push({ type: "davitEnter", col: midCol(world.cfg) });
  return s;
}

export function stepDavit(world: World, s: DavitState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  swing(world, s);
  if (s.phase === "spent") {
    if (since >= cfg.davitSpentBeats) {
      world.events.push({ type: "davitOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.davitStillBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.davitRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

/** How long the lit step stays lit: a swing's own beats and the grace, or a shot's beats. */
export function davitWindowBeats(world: World, step: DavitStep): number {
  return step.ask === "fire" ? step.beats : step.beats + world.cfg.davitGraceBeats;
}

/**
 * The boom follows the lean steering it, or with nobody steering swings back
 * toward hanging by `davitDriftMilli` a beat.
 */
function swing(world: World, s: DavitState): void {
  const steer = davitSteering(s);
  if (steer !== null) {
    s.aimMilli = s.tiltMilli[steer];
    return;
  }
  const drift = world.cfg.davitDriftMilli;
  if (s.aimMilli > 0) s.aimMilli = Math.max(0, s.aimMilli - drift);
  else if (s.aimMilli < 0) s.aimMilli = Math.min(0, s.aimMilli + drift);
}

function lit(world: World, s: DavitState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  for (const side of [0, 1] as const) {
    if (!davitDraws(s, side) || !s.holding[side] || !davitSteered(s, side)) continue;
    if (s.drawnBeats[side] < step.beats) s.drawnBeats[side] += 1;
  }
  if (since < davitWindowBeats(world, step)) return;
  const col = midCol(world.cfg);
  if (step.ask === "fire") {
    miss(world, s);
    return;
  }
  if (step.ask === "reland") {
    s.pivotLit = false;
    world.events.push({ type: "davitDim", col });
  } else world.events.push({ type: "davitSway", swing: step.ask === "left" ? 0 : 1, col });
  closeSlow(world);
  rest(world, s, false);
}

/**
 * A seat loosed its draw true — held its beats steered, lifted while the
 * steer still held and swiped toward the lean's half — in a step that asked
 * it: a swing landed, or the boom relanded under the pivot. Called by the
 * lift (`davit-hand.ts`).
 */
export function davitLoosed(world: World, s: DavitState, side: 0 | 1): void {
  const col = midCol(world.cfg);
  const step = s.steps[s.cursor];
  if (step?.ask === "reland") {
    s.pivotLit = true;
    world.events.push({ type: "davitReland", side, col });
    davitAnswered(world, s);
    return;
  }
  const at: 0 | 1 = step?.ask === "left" ? 0 : 1;
  s.swings[at] = Math.min(DAVIT_LOOSES_PER_SWING, s.swings[at] + 1);
  world.events.push({ type: "davitLoose", swing: at, looses: s.swings[at], col });
  const landed = s.swings[0] >= DAVIT_LOOSES_PER_SWING && s.swings[1] >= DAVIT_LOOSES_PER_SWING;
  if (landed && !s.pivotLit) {
    s.pivotLit = true;
    world.events.push({ type: "davitPivot", col });
  }
  davitAnswered(world, s);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * boom rests. Called by the shot and by a true loose.
 */
export function davitAnswered(world: World, s: DavitState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights under THE SLOW; or, with the script done, the boom swings spent. */
function next(world: World, s: DavitState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "spent";
    s.phaseBeat = world.beat;
    world.events.push({ type: "davitSpent", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.drawnBeats = [0, 0];
  openSlow(world, davitWindowBeats(world, step), "ask");
  world.events.push({ type: "davitLight", ask: step.ask, leanMilli: step.leanMilli, col });
}

/** A fire step ran out with the pivot unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: DavitState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "davitMiss", col });
  closeSlow(world);
  rest(world, s, true);
  bossStrikesHull(world, "davit", col);
}

function rest(world: World, s: DavitState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.drawnBeats = [0, 0];
  if (advance) s.cursor += 1;
}
