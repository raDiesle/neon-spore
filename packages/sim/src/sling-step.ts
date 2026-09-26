import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  freshSling,
  SLING_DRAWS_PER_ARM,
  type SlingState,
  type SlingStep,
  slingAsks,
} from "./sling.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE SLING's clock: the fork settling, each step lighting, the beats a draw
 * is held being counted, a window running out, and the fork snapping free.
 *
 * The shot is judged where a bolt leaves the top of the field
 * (`sling-shot.ts`) and calls `slingAnswered` here; the draws are heard on
 * the tick (`sling-hand.ts`), judged at their lift and only *counted* here, on
 * the beat, because what a draw step asks is a number of beats held.
 *
 * **A draw that runs out is tried again**, the step relit after a rest with
 * the cursor where it was: §32 has an arm spring slack and a yoke spring
 * loose, and neither is a hull hit. **A shot that runs out is the hull**, THE
 * VISE's rule (`vise-step.ts`): this game has no hull hit that is not the wave.
 */

export function installSling(world: World, steps: readonly SlingStep[]): SlingState {
  const s = freshSling(world.beat, steps);
  world.events.push({ type: "slingEnter", col: midCol(world.cfg) });
  return s;
}

export function stepSling(world: World, s: SlingState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "free") {
    if (since >= cfg.slingFreeBeats) {
      world.events.push({ type: "slingOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.slingStillBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.slingRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

/** How long the lit step stays lit: a draw's own beats and the grace, or a shot's beats. */
export function slingWindowBeats(world: World, step: SlingStep): number {
  return step.ask === "fire" ? step.beats : step.beats + world.cfg.slingGraceBeats;
}

function lit(world: World, s: SlingState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  for (const side of [0, 1] as const) {
    if (slingAsks(s, side) && s.holding[side] && s.drawnBeats[side] < step.beats)
      s.drawnBeats[side] += 1;
  }
  if (since < slingWindowBeats(world, step)) return;
  const col = midCol(world.cfg);
  if (step.ask === "fire") {
    miss(world, s);
    return;
  }
  if (step.ask === "both") {
    s.yokeLit = false;
    world.events.push({ type: "slingDim", col });
  } else world.events.push({ type: "slingSpring", side: step.ask === "left" ? 0 : 1, col });
  closeSlow(world);
  rest(world, s, false);
}

/**
 * A seat loosed its draw true — held its beats and swiped toward the aim —
 * in a step that asked it: an arm drawn home, or one half of a redraw under
 * the yoke. Called by the lift (`sling-hand.ts`).
 */
export function slingLoosed(world: World, s: SlingState, side: 0 | 1): void {
  const col = midCol(world.cfg);
  const step = s.steps[s.cursor];
  if (step?.ask === "both") {
    s.loosed[side] = true;
    world.events.push({ type: "slingLoose", side, draws: s.arms[side], col });
    if (!s.loosed[0] || !s.loosed[1]) return;
    s.yokeLit = true;
    world.events.push({ type: "slingSteady", col });
    slingAnswered(world, s);
    return;
  }
  s.arms[side] = Math.min(SLING_DRAWS_PER_ARM, s.arms[side] + 1);
  world.events.push({ type: "slingLoose", side, draws: s.arms[side], col });
  const drawn = s.arms[0] >= SLING_DRAWS_PER_ARM && s.arms[1] >= SLING_DRAWS_PER_ARM;
  if (drawn && !s.yokeLit) {
    s.yokeLit = true;
    world.events.push({ type: "slingYoke", col });
  }
  slingAnswered(world, s);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * fork rests. Called by the shot and by a true loose.
 */
export function slingAnswered(world: World, s: SlingState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights under THE SLOW; or, with the script done, the fork snaps free. */
function next(world: World, s: SlingState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "free";
    s.phaseBeat = world.beat;
    world.events.push({ type: "slingFree", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.drawnBeats = [0, 0];
  s.loosed = [false, false];
  openSlow(world, slingWindowBeats(world, step), "ask");
  world.events.push({ type: "slingLight", ask: step.ask, aim: step.aim, col });
}

/** A fire step ran out with the yoke unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: SlingState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "slingMiss", col });
  closeSlow(world);
  rest(world, s, true);
  bossStrikesHull(world, "sling", col);
}

function rest(world: World, s: SlingState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.drawnBeats = [0, 0];
  s.loosed = [false, false];
  if (advance) s.cursor += 1;
}
