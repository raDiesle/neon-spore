import { bossStrikesHull } from "./boss-strike.js";
import {
  type CapstanState,
  type CapstanStep,
  capstanBand,
  capstanBright,
  capstanFace,
  freshCapstan,
} from "./capstan.js";
import { midCol } from "./config.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE CAPSTAN's clock: the drum settling in, each step lighting, a hold's
 * beats counted, a window running out, and the cap swinging open.
 *
 * Every pull and every reversal is heard on the tick (`capstan-hand.ts`), and
 * a band cracks there — waiting for the beat would hold a finished band back
 * for nothing. The shot is judged where a bolt leaves the top of the field
 * (`capstan-shot.ts`). What is left to the beat is **a hold**: a whole beat
 * with a face bared and a fresh reversal on it counts one, and a beat without
 * is only not counted — the count is never set back inside its window, the
 * boss's own pause-not-reset.
 *
 * **A band window that runs out is tried again**, the step relit after a rest
 * with the cursor where it was and every reversal worn into either band kept.
 * A hold that runs out covers the core as well, and the same hold is asked
 * again until it is made. **A shot that runs out is the hull**, THE SEAM's
 * rule (`seam-step.ts`).
 */

export function installCapstan(world: World, steps: readonly CapstanStep[]): CapstanState {
  const s = freshCapstan(world.beat, steps);
  world.events.push({ type: "capstanEnter", col: midCol(world.cfg) });
  return s;
}

export function stepCapstan(world: World, s: CapstanState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "open") {
    if (since >= cfg.capstanOpenBeats) {
      world.events.push({ type: "capstanOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "rusted" && since >= cfg.capstanRustBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.capstanRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
  s.rubbed = false;
}

function lit(world: World, s: CapstanState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  const col = midCol(world.cfg);
  if (step.ask === "fire") {
    if (since >= step.beats) miss(world, s);
    return;
  }
  if (step.ask === "hold" && s.rubbed && capstanFace(world, s) !== null) {
    s.heldBeats += 1;
    if (s.heldBeats >= world.cfg.capstanHoldBeats) {
      s.bared = true;
      world.events.push({ type: "capstanKept", col });
      capstanAnswered(world, s);
      return;
    }
  }
  if (since < step.beats) return;
  if (step.ask === "hold") {
    s.bared = false;
    world.events.push({ type: "capstanCover", col });
  } else world.events.push({ type: "capstanStall", col });
  closeSlow(world);
  rest(world, s, false);
}

/**
 * A band worn to its threshold on the tick: it cracks bright, and with both
 * bright the core is bared. Called by the thumb (`capstan-hand.ts`), only
 * ever for the lit step's own band — a band not lit stops one short.
 */
export function capstanCracked(world: World, s: CapstanState, side: 0 | 1): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "capstanBright", side, col });
  if (capstanBright(world, s, 0) && capstanBright(world, s, 1) && !s.bared) {
    s.bared = true;
    world.events.push({ type: "capstanBare", col });
  }
  if (capstanBand(s) === side) capstanAnswered(world, s);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * drum rests. Called by the shot, by a band's crack and by a hold's count.
 */
export function capstanAnswered(world: World, s: CapstanState): void {
  closeSlow(world);
  rest(world, s, true);
}

/**
 * The next step lights; or, with the script done, the cap swings open. A
 * steer-and-rub step lights under THE SLOW, a shot without it, §37's rows.
 */
function next(world: World, s: CapstanState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "open";
    s.phaseBeat = world.beat;
    world.events.push({ type: "capstanOpen", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  s.rubbed = false;
  if (step.ask !== "fire") openSlow(world, step.beats + 1, "ask");
  world.events.push({ type: "capstanLight", ask: step.ask, col });
}

/** A fire step ran out with the core unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: CapstanState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "capstanMiss", col });
  rest(world, s, true);
  bossStrikesHull(world, "capstan", col);
}

function rest(world: World, s: CapstanState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (advance) s.cursor += 1;
}
