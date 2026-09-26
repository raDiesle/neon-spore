import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  freshRime,
  RIME_FULL_MILLI,
  RIME_WIPES_PER_HALF,
  type RimeState,
  type RimeStep,
  rimeWiping,
} from "./rime.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE RIME's clock: the lens settling, each step lighting, the lit half's
 * frost growing back through a beat nobody rubbed it, a window running out,
 * and the shatter.
 *
 * A wipe is heard and answered on the tick (`rime-hand.ts`), the shield too
 * (`rime-guard.ts`), and the shot where a bolt leaves the top of the field
 * (`rime-shot.ts`); each calls `rimeAnswered` here. What only the beat can see
 * is **a beat gone by without a thumb on the lit half**, which is what lets
 * the frost win back ground.
 *
 * **A wipe that runs out is tried again from that half's first wipe**, §29's
 * row 3, and **a surge that runs out is the shield asked again**; neither is a
 * hull hit. **A shot that runs out is the hull**, THE SEAM's rule
 * (`seam-step.ts`): this game has no hull hit that is not the wave.
 */

export function installRime(world: World, steps: readonly RimeStep[]): RimeState {
  const s = freshRime(world.beat, steps);
  world.events.push({ type: "rimeEnter", col: midCol(world.cfg) });
  return s;
}

export function stepRime(world: World, s: RimeState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "shattered") {
    if (since >= cfg.rimeShatterBeats) {
      world.events.push({ type: "rimeOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.rimeStillBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.rimeRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

function lit(world: World, s: RimeState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  const side = rimeWiping(s);
  if (side !== null && !s.rubbed[side])
    s.rimeMilli[side] = Math.min(RIME_FULL_MILLI, s.rimeMilli[side] + world.cfg.rimeRegrowMilli);
  s.rubbed = [false, false];
  if (since < step.beats) return;
  if (step.ask === "fire") miss(world, s);
  else if (side !== null) frosted(world, s, side);
  else clouded(world, s);
}

/**
 * A wipe ran out: the half frosts back solid and the cursor goes back to the
 * first of this run of wipes on it, so the film is never the half's first.
 */
function frosted(world: World, s: RimeState, side: 0 | 1): void {
  const ask = s.steps[s.cursor]?.ask;
  while (s.cursor > 0 && s.steps[s.cursor - 1]?.ask === ask) {
    s.cursor -= 1;
    s.wipes[side] = Math.max(0, s.wipes[side] - 1);
  }
  s.rimeMilli[side] = RIME_FULL_MILLI;
  world.events.push({ type: "rimeFrost", side, col: midCol(world.cfg) });
  closeSlow(world);
  rest(world, s, false);
}

/** A shield step ran out: the surge frosts the lens over the core, until a shield turns one. */
function clouded(world: World, s: RimeState): void {
  s.bared = false;
  s.rimeMilli = [RIME_FULL_MILLI, RIME_FULL_MILLI];
  world.events.push({ type: "rimeCloud", col: midCol(world.cfg) });
  closeSlow(world);
  rest(world, s, false);
}

/** A half wiped to nought: one more wipe on it, and with every wipe on both, the core. */
export function rimeCleared(world: World, s: RimeState, side: 0 | 1): void {
  const col = midCol(world.cfg);
  s.wipes[side] = Math.min(RIME_WIPES_PER_HALF, s.wipes[side] + 1);
  world.events.push({ type: "rimeClear", side, wipes: s.wipes[side], col });
  const open = s.wipes[0] >= RIME_WIPES_PER_HALF && s.wipes[1] >= RIME_WIPES_PER_HALF;
  if (open && !s.bared) {
    s.bared = true;
    world.events.push({ type: "rimeBare", col });
  }
  rimeAnswered(world, s);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * lens rests. Called by a wipe, the shield and the shot.
 */
export function rimeAnswered(world: World, s: RimeState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights under THE SLOW; or, with the script done, the lens shatters. */
function next(world: World, s: RimeState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "shattered";
    s.phaseBeat = world.beat;
    world.events.push({ type: "rimeShatter", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.litTick = world.tick;
  s.rubbed = [false, false];
  const side = rimeWiping(s);
  if (side !== null)
    s.rimeMilli[side] = s.wipes[side] === 0 ? RIME_FULL_MILLI : world.cfg.rimeFilmMilli;
  openSlow(world, step.beats, "ask");
  world.events.push({ type: "rimeLight", ask: step.ask, col });
}

/** A fire step ran out with the core unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: RimeState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "rimeMiss", col });
  closeSlow(world);
  rest(world, s, true);
  bossStrikesHull(world, "rime", col);
}

function rest(world: World, s: RimeState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  if (advance) s.cursor += 1;
}
