import { midCol } from "./config.js";
import { breachHull } from "./hull-damage.js";
import { closeSlow, openSlow } from "./slow.js";
import {
  freshTrivet,
  TRIVET_PLANTS_PER_FOOT,
  type TrivetState,
  type TrivetStep,
  trivetClosed,
} from "./trivet.js";
import type { World } from "./world.js";

/**
 * THE TRIVET's clock: the stand settling, each step lighting, the beats a
 * chord is held being counted, a window running out, and the collapse.
 *
 * The shot is judged where a bolt leaves the top of the field
 * (`trivet-shot.ts`) and calls `trivetAnswered` here; the pads are heard on
 * the tick (`trivet-hand.ts`) and only *counted* here, on the beat, because
 * what a chord step asks is a number of beats.
 *
 * **A chord that runs out is tried again**, the step relit after a rest with
 * the cursor where it was: §30 has a foot spring back up and a hub rock back
 * up, and neither is a hull hit. **A shot that runs out is the hull**, THE
 * VISE's rule (`vise-step.ts`): this game has no hull hit that is not the wave.
 */

export function installTrivet(world: World, steps: readonly TrivetStep[]): TrivetState {
  const s = freshTrivet(world.beat, steps);
  world.events.push({ type: "trivetEnter", col: midCol(world.cfg) });
  return s;
}

export function stepTrivet(world: World, s: TrivetState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "collapse") {
    if (since >= cfg.trivetCollapseBeats) {
      world.events.push({ type: "trivetOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.trivetStillBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.trivetRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

/** How long the lit step stays lit: a chord's own beats and the grace, or a shot's beats. */
export function trivetWindowBeats(world: World, step: TrivetStep): number {
  return step.ask === "fire" ? step.beats : step.beats + world.cfg.trivetGraceBeats;
}

function lit(world: World, s: TrivetState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  if (trivetClosed(s)) {
    s.heldBeats += 1;
    if (s.heldBeats >= step.beats) {
      held(world, s, step);
      return;
    }
  }
  if (since < trivetWindowBeats(world, step)) return;
  if (step.ask === "fire") miss(world, s);
  else slipped(world, s, step);
}

/** A chord step held its beats: a foot planted, or both feet kept down under the hub. */
function held(world: World, s: TrivetState, step: TrivetStep): void {
  const col = midCol(world.cfg);
  if (step.ask === "both") {
    s.hubLit = true;
    world.events.push({ type: "trivetBrace", col });
  } else {
    const side: 0 | 1 = step.ask === "front" ? 0 : 1;
    s.feet[side] = Math.min(TRIVET_PLANTS_PER_FOOT, s.feet[side] + 1);
    world.events.push({ type: "trivetPlant", side, level: s.feet[side], col });
    const home = s.feet[0] >= TRIVET_PLANTS_PER_FOOT && s.feet[1] >= TRIVET_PLANTS_PER_FOOT;
    if (home && !s.hubLit) {
      s.hubLit = true;
      world.events.push({ type: "trivetHub", col });
    }
  }
  trivetAnswered(world, s);
}

/** A chord step ran out: the foot springs back up, or the hub rocks up off the feet. */
function slipped(world: World, s: TrivetState, step: TrivetStep): void {
  const col = midCol(world.cfg);
  if (step.ask === "both") {
    s.hubLit = false;
    world.events.push({ type: "trivetRock", col });
  } else world.events.push({ type: "trivetSpring", side: step.ask === "front" ? 0 : 1, col });
  closeSlow(world);
  rest(world, s, false);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * stand rests. Called by the shot and by a chord's count.
 */
export function trivetAnswered(world: World, s: TrivetState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights under THE SLOW; or, with the script done, the stand collapses. */
function next(world: World, s: TrivetState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "collapse";
    s.phaseBeat = world.beat;
    world.events.push({ type: "trivetCollapse", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  openSlow(world, trivetWindowBeats(world, step), "ask");
  world.events.push({ type: "trivetLight", ask: step.ask, col });
}

/** A fire step ran out with the hub unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: TrivetState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "trivetMiss", col });
  closeSlow(world);
  rest(world, s, true);
  breachHull(world, col, "meteorFastest", 0, "heavy");
}

function rest(world: World, s: TrivetState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (advance) s.cursor += 1;
}
