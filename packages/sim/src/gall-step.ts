import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  freshGall,
  GALL_CLOSES,
  GALL_POINTS,
  type GallState,
  type GallStep,
  gallPointCol,
  gallShut,
} from "./gall.js";
import { nextInt } from "./rng.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE GALL's clock: the seam rising, each step lighting, the beats a pinch is
 * kept shut being counted, a window running out, and the seam smoothing flat.
 *
 * The pinch is heard on the tick (`gall-hand.ts`) and only *counted* here, on
 * the beat, THE VISE's split (`vise-step.ts`): what a close asks is a number
 * of beats shut. The shot is judged where a bolt leaves the top of the field
 * (`gall-shot.ts`).
 *
 * **A close landed jumps the gall** to one of the other three points, drawn
 * off the seeded `Rng`, and the pinch that closed it is left on nothing: the
 * gap is open again until a pinch goes down where the gall now sits.
 *
 * **A close that runs out is tried again**, the step relit after a rest with
 * the gall where it was. **A shot that runs out is the hull**, THE SEAM's rule
 * (`seam-step.ts`): a boss whose every window is tried again cannot be lost.
 */

export function installGall(world: World, steps: readonly GallStep[]): GallState {
  const s = freshGall(world.beat, steps, world.cfg.gallOpenMilli);
  world.events.push({ type: "gallEnter", point: s.point, col: gallPointCol(world.cfg, s.point) });
  return s;
}

export function stepGall(world: World, s: GallState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "flat") {
    if (since >= cfg.gallFlatBeats) {
      world.events.push({ type: "gallOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "slack" && since >= cfg.gallSlackBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.gallRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

function lit(world: World, s: GallState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  if (step.ask === "fire") {
    if (since >= step.beats) miss(world, s);
    return;
  }
  if (gallShut(world, s)) {
    s.heldBeats += 1;
    if (s.heldBeats >= world.cfg.gallShutBeats) {
      closed(world, s);
      return;
    }
  }
  if (since < step.beats) return;
  world.events.push({ type: "gallSwell", point: s.point, col: gallPointCol(world.cfg, s.point) });
  closeSlow(world);
  rest(world, s, false);
}

/** A close landed: the gall jumps to another point, and the last close bares the root. */
function closed(world: World, s: GallState): void {
  const from = s.point;
  const k = nextInt(world.rng, GALL_POINTS - 1);
  const to = k >= from ? k + 1 : k;
  s.point = to;
  s.closes = Math.min(GALL_CLOSES, s.closes + 1);
  s.gapMilli = world.cfg.gallOpenMilli;
  const col = gallPointCol(world.cfg, to);
  world.events.push({ type: "gallClose", from, to, closes: s.closes, col });
  if (s.closes >= GALL_CLOSES && !s.bared) {
    s.bared = true;
    world.events.push({ type: "gallBare", col: midCol(world.cfg) });
  }
  gallAnswered(world, s);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * seam rests. Called by the shot and by a close.
 */
export function gallAnswered(world: World, s: GallState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights, a close under THE SLOW; or, with the script done, the seam goes flat. */
function next(world: World, s: GallState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) {
    s.phase = "flat";
    s.phaseBeat = world.beat;
    world.events.push({ type: "gallFlat", col: midCol(world.cfg) });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (step.ask === "close") openSlow(world, step.beats + 1, "ask");
  const col = step.ask === "close" ? gallPointCol(world.cfg, s.point) : midCol(world.cfg);
  world.events.push({ type: "gallLight", ask: step.ask, point: s.point, col });
}

/** A fire step ran out with the root unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: GallState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "gallMiss", col });
  rest(world, s, true);
  bossStrikesHull(world, "gall", col);
}

function rest(world: World, s: GallState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (advance) s.cursor += 1;
}
