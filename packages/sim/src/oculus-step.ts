import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  freshOculus,
  type OculusState,
  type OculusStep,
  oculusIsHold,
  oculusIsPair,
} from "./oculus.js";
import type { World } from "./world.js";

/**
 * THE OCULUS's clock: the lens settling, each step lighting, a fuse running
 * out, and the shatter.
 *
 * The shot is judged where a bolt leaves the top of the field
 * (`oculus-shot.ts`) and calls `oculusAnswered` here; the leaves are heard
 * on the tick (`oculus-hand.ts`) and a pair's count is kept and judged on the
 * tick too (`oculus-level.ts`), because a hold is worth every tick both
 * thumbs are down, not every beat.
 *
 * **No slow** since 2 October 2026: the wave goes on round the lens and the
 * pair work it between what falls, so a slow that stretched the field's
 * time would stretch the wave's with it. What presses instead is the step's
 * fuse, drawn over the lens.
 *
 * **A pair's fuse that runs out springs it open and lights it again**, the
 * count back to nought and the cursor where it was: §27's missed shut, and a
 * missed reseal swallows the socket. Neither is a hull hit. **A fire step
 * authored with no beats waits for its shot**, as the three-level script's
 * do; one with beats that runs out is the hull, THE SEAM's rule
 * (`seam-step.ts`) — and so is a glare left unshielded and a look left
 * unanswered, the two story steps (`oculus-guard.ts`, `oculus-shot.ts`).
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

/**
 * How long the lit step stays lit, in beats, nought for a step that waits: a
 * hold's own `fuse`, or its beats and the grace; every other step's beats.
 */
export function oculusWindowBeats(world: World, step: OculusStep): number {
  if (oculusIsHold(step)) return step.fuse ?? step.beats + world.cfg.oculusGraceBeats;
  return step.beats;
}

function lit(world: World, s: OculusState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  const lasts = oculusWindowBeats(world, step);
  if (lasts <= 0 || since < lasts) return;
  if (step.ask === "break") rest(world, s, true);
  else if (oculusIsPair(step)) sprung(world, s, step);
  else miss(world, s);
}

/** A pair's count reached: its leaves shut, or the socket kept open. Called on the tick (`oculus-level.ts`). */
export function oculusPairDone(world: World, s: OculusState, step: OculusStep): void {
  const col = midCol(world.cfg);
  if (step.ask === "reseal") {
    s.socketOpen = true;
    world.events.push({ type: "oculusReseal", col });
  } else {
    s.leavesShut += 2;
    world.events.push({ type: "oculusShut", shut: s.leavesShut, col });
  }
  oculusAnswered(world, s);
}

/** A pair's fuse ran out: the pair springs open, or the socket swallows itself. */
function sprung(world: World, s: OculusState, step: OculusStep): void {
  const col = midCol(world.cfg);
  if (step.ask === "reseal") {
    s.socketOpen = false;
    world.events.push({ type: "oculusSwallow", col });
  } else world.events.push({ type: "oculusSpring", col });
  rest(world, s, false);
}

/** The lit step has its answer: the cursor moves on and the lens rests. Called by the shot and by a pair's count. */
export function oculusAnswered(world: World, s: OculusState): void {
  rest(world, s, true);
}

/** The next step lights; or, with the script done, the lens shatters. */
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
  if (step.ask === "break") {
    s.socketOpen = true;
    world.events.push({ type: "oculusBreak", col });
    return;
  }
  world.events.push({ type: "oculusLight", ask: step.ask, col });
}

/**
 * A step with no second try ran out — the core unshot, the glare unshielded,
 * the look unanswered: the hull takes it, and the wave is lost.
 */
function miss(world: World, s: OculusState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "oculusMiss", col });
  rest(world, s, true);
  bossStrikesHull(world, "oculus", col);
}

/**
 * Between steps: the count of the step just gone back to nought — its own
 * kept progress is the only kind there is, and a new step starts from none.
 * A lever still taken is taken again from where it stands.
 */
function rest(world: World, s: OculusState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.heldTicks = 0;
  s.taps = [0, 0];
  s.turned = [0, 0];
  s.leverBest = [s.leverAt[0], s.leverAt[1]];
  if (advance) s.cursor += 1;
}
