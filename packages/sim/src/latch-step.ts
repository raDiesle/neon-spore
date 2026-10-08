import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import type { LatchSlipWhy } from "./events-latch.js";
import { freshLatch, type LatchState, type LatchStep, latchLitStep, latchYanks } from "./latch.js";
import type { World } from "./world.js";

/**
 * THE LATCH's clock: each level lighting and running out, the slime rearing
 * and yanking in a level that yanks, and the slime torn loose after the last.
 *
 * The grips are heard on the tick (`latch-hand.ts`), and a knot is pulled in
 * there, the instant the tendril passes it (`latchHauled`). **No level opens
 * THE SLOW**: a tug of war is a rhythm the pair keep between them, THE
 * TRAPEZE's reason (`trapeze-step.ts`), and the owner's of 6 October 2026 — a
 * pull is a hand on the boss's own tendril, not a shot.
 */

export function installLatch(world: World, steps: readonly LatchStep[]): LatchState {
  const s = freshLatch(world.beat, steps);
  world.events.push({ type: "latchEnter", col: midCol(world.cfg) });
  return s;
}

/**
 * One beat of THE LATCH: a level lit, a yank warned of and then yanked, a
 * level run out, the slime gone.
 */
export function stepLatch(world: World, s: LatchState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.latchSpentBeats) {
      world.events.push({ type: "latchOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "enter" && since >= cfg.latchEnterBeats) light(world, s);
  else if (s.phase === "rest" && since >= cfg.latchRestBeats) light(world, s);
  else if (s.phase === "level") {
    const step = latchLitStep(s);
    if (step !== null && since >= step.beats) miss(world, s);
    else yank(world, s);
  }
}

/**
 * The next level lights. **A thumb still down keeps its hold**: one resting
 * on its grip through the rest sends nothing, and dropping it here would slip
 * the rope on the first pull with no hand seen to let go. It is taken hold of
 * again where the rope now is. A grip that changed hands was let go of when
 * it did (`latchHauled`).
 */
function light(world: World, s: LatchState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "level";
  s.phaseBeat = world.beat;
  s.levelKnots = 0;
  for (const g of [0, 1] as const) s.anchorMilli[g] = s.hauledMilli - s.depthMilli[g];
  s.turn = 0;
  s.yankBeat = latchYanks(s) ? world.beat + world.cfg.latchYankEveryBeats : -1;
  world.events.push({ type: "latchLevel", ask: step.ask, col: midCol(world.cfg) });
}

/** A level that yanks: the rear the beats before, and the yank on its beat. */
function yank(world: World, s: LatchState): void {
  if (s.yankBeat < 0) return;
  const col = midCol(world.cfg);
  if (s.yankBeat - world.beat === world.cfg.latchRearBeats) {
    world.events.push({ type: "latchRear", col });
    return;
  }
  if (world.beat !== s.yankBeat) return;
  s.yankBeat = world.beat + world.cfg.latchYankEveryBeats;
  if (s.down[0] && s.down[1]) world.events.push({ type: "latchBraced", col });
  else latchSlips(world, s, "yank");
}

/** A level ran out before its knots were in: the slime tears the hull, and the wave is lost. */
function miss(world: World, s: LatchState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "latchMiss", col });
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.yankBeat = -1;
  bossStrikesHull(world, "latch", col);
}

/**
 * The tendril slips back to the last knot. Every grip still held is taken
 * hold of again where it now is, so a pull goes on from there rather than
 * snapping back down. Said even when nothing was lost, so a yank that found
 * a hand off is seen to have been one.
 */
export function latchSlips(world: World, s: LatchState, why: LatchSlipWhy): void {
  const lostMilli = s.hauledMilli - s.floorMilli;
  s.hauledMilli = s.floorMilli;
  for (const g of [0, 1] as const) s.anchorMilli[g] = s.hauledMilli - s.depthMilli[g];
  world.events.push({ type: "latchSlip", why, lostMilli, col: midCol(world.cfg) });
}

/**
 * The tendril pulled down as far as a grip has it, and every knot it passed
 * pulled in: a lobe torn off, and the floor it can never slip past moved
 * down. The level's last knot ends the level, and the script's last the
 * fight.
 */
export function latchHauled(world: World, s: LatchState, toMilli: number): void {
  const step = latchLitStep(s);
  if (step === null) return;
  s.hauledMilli = Math.max(s.hauledMilli, toMilli);
  const knot = world.cfg.latchKnotMilli;
  const col = midCol(world.cfg);
  while (s.hauledMilli - s.floorMilli >= knot && s.levelKnots < step.knots) {
    s.floorMilli += knot;
    s.knots += 1;
    s.levelKnots += 1;
    world.events.push({ type: "latchKnot", knots: s.knots, col });
  }
  if (s.levelKnots < step.knots) return;
  s.hauledMilli = s.floorMilli;
  s.cursor += 1;
  // The grips change hands into or out of a `cross`: the thumbs on them are
  // now the partner's, and hold nothing until the right thumb takes hold.
  if ((s.steps[s.cursor]?.ask === "cross") !== (step.ask === "cross")) {
    s.down = [false, false];
    s.depthMilli = [0, 0];
  }
  s.phaseBeat = world.beat;
  s.yankBeat = -1;
  if (s.cursor >= s.steps.length) {
    s.phase = "spent";
    world.events.push({ type: "latchSpent", col });
    return;
  }
  s.phase = "rest";
}
