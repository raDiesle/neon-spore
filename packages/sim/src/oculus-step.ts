import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { freshOculus, type OculusState, type OculusStep, oculusBothHeld } from "./oculus.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE OCULUS's clock: the lens settling, each step lighting, the beats both
 * leaves are held being counted, a window running out, and the shatter.
 *
 * The shot is judged where a bolt leaves the top of the field
 * (`oculus-shot.ts`) and calls `oculusAnswered` here; the two leaves are
 * heard on the tick (`oculus-hand.ts`) and only *counted* here, on the beat,
 * because what a hold step asks is a number of beats.
 *
 * **A hold that runs out is tried again**, the step relit after a rest with
 * the cursor where it was: §27 has a missed shut spring the pair back open and
 * a missed reseal swallow the socket, and neither is a hull hit. **A shot that
 * runs out is the hull**, THE SEAM's rule (`seam-step.ts`): this game has no
 * hull hit that is not the wave. So is a glare left unshielded and a look
 * left unanswered, the two story steps (`oculus-guard.ts`, `oculus-shot.ts`).
 */

export function installOculus(world: World, steps: readonly OculusStep[]): OculusState {
  const s = freshOculus(world.beat, steps);
  world.events.push({ type: "oculusEnter", col: midCol(world.cfg) });
  return s;
}

export function stepOculus(world: World, s: OculusState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "shatter") {
    if (since >= cfg.oculusShatterBeats) {
      world.events.push({ type: "oculusOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.oculusStillBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.oculusRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

/** How long the lit step stays lit: a hold's own beats and the grace, or the step's beats. */
export function oculusWindowBeats(world: World, step: OculusStep): number {
  const hold = step.ask === "shut" || step.ask === "reseal";
  return hold ? step.beats + world.cfg.oculusGraceBeats : step.beats;
}

function lit(world: World, s: OculusState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  const hold = step.ask === "shut" || step.ask === "reseal";
  if (hold && oculusBothHeld(s)) {
    s.heldBeats += 1;
    if (s.heldBeats >= step.beats) {
      held(world, s, step);
      return;
    }
  }
  if (since < oculusWindowBeats(world, step)) return;
  if (step.ask === "break") rest(world, s, true);
  else if (hold) slipped(world, s, step);
  else miss(world, s);
}

/** A hold step held its beats: a pair of leaves shut, or the socket kept open. */
function held(world: World, s: OculusState, step: OculusStep): void {
  const col = midCol(world.cfg);
  if (step.ask === "shut") {
    s.leavesShut += 2;
    world.events.push({ type: "oculusShut", shut: s.leavesShut, col });
  } else {
    s.socketOpen = true;
    world.events.push({ type: "oculusReseal", col });
  }
  oculusAnswered(world, s);
}

/** A hold step ran out: the pair springs open, or the socket swallows itself. */
function slipped(world: World, s: OculusState, step: OculusStep): void {
  const col = midCol(world.cfg);
  if (step.ask === "shut") world.events.push({ type: "oculusSpring", col });
  else {
    s.socketOpen = false;
    world.events.push({ type: "oculusSwallow", col });
  }
  closeSlow(world);
  rest(world, s, false);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * lens rests. Called by the shot and by a hold's count.
 */
export function oculusAnswered(world: World, s: OculusState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights, under THE SLOW unless it is a break; or, with the script done, the lens shatters. */
function next(world: World, s: OculusState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "shatter";
    s.phaseBeat = world.beat;
    world.events.push({ type: "oculusShatter", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.litTick = world.tick;
  s.heldBeats = 0;
  if (step.ask === "break") {
    s.socketOpen = true;
    world.events.push({ type: "oculusBreak", col });
    return;
  }
  openSlow(world, oculusWindowBeats(world, step), "ask");
  world.events.push({ type: "oculusLight", ask: step.ask, col });
}

/**
 * A step with no second try ran out — the core unshot, the glare unshielded,
 * the look unanswered: the hull takes it, and the wave is lost.
 */
function miss(world: World, s: OculusState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "oculusMiss", col });
  closeSlow(world);
  rest(world, s, true);
  bossStrikesHull(world, "oculus", col);
}

function rest(world: World, s: OculusState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (advance) s.cursor += 1;
}
