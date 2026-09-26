import { midCol } from "./config.js";
import {
  freshGrindstone,
  GRINDSTONE_FULL_MILLI,
  GRINDSTONE_PASSES_PER_FLAT,
  type GrindstoneState,
  type GrindstoneStep,
  grinding,
  grindstoneClamped,
} from "./grindstone.js";
import { breachHull } from "./hull-damage.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE GRINDSTONE's clock: the wheel settling, each step lighting, the lit
 * flat regritting through a beat nobody ground it, the beats a clamp is held
 * being counted, a window running out, and the snap free.
 *
 * A pass is heard and answered on the tick (`grindstone-hand.ts`), and the
 * shot where a bolt leaves the top of the field (`grindstone-shot.ts`); each
 * calls `grindstoneAnswered` here. What only the beat can see is **a beat gone
 * by without a thumb on the lit flat**, THE RIME's (`rime-step.ts`), and **a
 * beat the caliper was held**, THE TRIVET's (`trivet-step.ts`).
 *
 * **A pass that runs out is tried again from that flat's first pass**, §33's
 * rows 3 and 5, and **a clamp that runs out is the clamp asked again**; neither
 * is a hull hit. **A shot that runs out is the hull**, THE SEAM's rule
 * (`seam-step.ts`): this game has no hull hit that is not the wave.
 */

export function installGrindstone(world: World, steps: readonly GrindstoneStep[]): GrindstoneState {
  const s = freshGrindstone(world.beat, steps);
  world.events.push({ type: "grindstoneEnter", col: midCol(world.cfg) });
  return s;
}

export function stepGrindstone(world: World, s: GrindstoneState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "free") {
    if (since >= cfg.grindstoneFreeBeats) {
      world.events.push({ type: "grindstoneOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.grindstoneStillBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.grindstoneRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

/** How long the lit step stays lit: a clamp's own beats and the grace, or a pass's or a shot's beats. */
export function grindstoneWindowBeats(world: World, step: GrindstoneStep): number {
  return step.ask === "clamp" ? step.beats + world.cfg.grindstoneGraceBeats : step.beats;
}

function lit(world: World, s: GrindstoneState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  const side = grinding(s);
  if (side !== null && !s.rubbed[side])
    s.gritMilli[side] = Math.min(
      GRINDSTONE_FULL_MILLI,
      s.gritMilli[side] + world.cfg.grindstoneRegrowMilli,
    );
  s.rubbed = [false, false];
  if (grindstoneClamped(s)) {
    s.heldBeats += 1;
    if (s.heldBeats >= step.beats) {
      clamped(world, s);
      return;
    }
  }
  if (since < grindstoneWindowBeats(world, step)) return;
  if (step.ask === "fire") miss(world, s);
  else if (side !== null) regritted(world, s, side);
  else sprung(world, s);
}

/**
 * A pass ran out: the flat regrits solid and the cursor goes back to the
 * first of this run of passes on it, so the film is never the flat's first.
 */
function regritted(world: World, s: GrindstoneState, side: 0 | 1): void {
  const ask = s.steps[s.cursor]?.ask;
  while (s.cursor > 0 && s.steps[s.cursor - 1]?.ask === ask) {
    s.cursor -= 1;
    s.passes[side] = Math.max(0, s.passes[side] - 1);
  }
  s.gritMilli[side] = GRINDSTONE_FULL_MILLI;
  world.events.push({ type: "grindstoneRegrit", side, col: midCol(world.cfg) });
  closeSlow(world);
  rest(world, s, false);
}

/** A clamp step ran out: the caliper springs loose and the axle goes dark until a clamp holds. */
function sprung(world: World, s: GrindstoneState): void {
  s.locked = false;
  world.events.push({ type: "grindstoneLoose", col: midCol(world.cfg) });
  closeSlow(world);
  rest(world, s, false);
}

/** Both jaws held the clamp's beats: the caliper is locked on the wheel. */
function clamped(world: World, s: GrindstoneState): void {
  s.locked = true;
  world.events.push({ type: "grindstoneClamp", col: midCol(world.cfg) });
  grindstoneAnswered(world, s);
}

/** A flat ground to nought: one more pass on it, and with every pass on both, the caliper bites. */
export function grindstoneCleared(world: World, s: GrindstoneState, side: 0 | 1): void {
  const col = midCol(world.cfg);
  s.passes[side] = Math.min(GRINDSTONE_PASSES_PER_FLAT, s.passes[side] + 1);
  world.events.push({ type: "grindstoneClear", side, passes: s.passes[side], col });
  const clean =
    s.passes[0] >= GRINDSTONE_PASSES_PER_FLAT && s.passes[1] >= GRINDSTONE_PASSES_PER_FLAT;
  if (clean && !s.locked) {
    s.locked = true;
    world.events.push({ type: "grindstoneBite", col });
  }
  grindstoneAnswered(world, s);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * wheel rests. Called by a pass, a clamp and the shot.
 */
export function grindstoneAnswered(world: World, s: GrindstoneState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights under THE SLOW; or, with the script done, the wheel spins free. */
function next(world: World, s: GrindstoneState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "free";
    s.phaseBeat = world.beat;
    world.events.push({ type: "grindstoneFree", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.rubbed = [false, false];
  s.heldBeats = 0;
  const side = grinding(s);
  if (side !== null)
    s.gritMilli[side] =
      s.passes[side] === 0 ? GRINDSTONE_FULL_MILLI : world.cfg.grindstoneFilmMilli;
  openSlow(world, grindstoneWindowBeats(world, step), "ask");
  world.events.push({ type: "grindstoneLight", ask: step.ask, col });
}

/** A fire step ran out with the axle unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: GrindstoneState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "grindstoneMiss", col });
  closeSlow(world);
  rest(world, s, true);
  breachHull(world, col, "meteorFastest", 0, "heavy");
}

function rest(world: World, s: GrindstoneState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.heldBeats = 0;
  if (advance) s.cursor += 1;
}
