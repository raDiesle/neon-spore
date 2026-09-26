import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { freshSeam, type SeamState, type SeamStep, seamStepCol } from "./seam.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE SEAM's clock: the ridge settling, each step of the script lighting and
 * running out, the rest between steps, and the split.
 *
 * The answers are judged elsewhere — a shot where a bolt leaves the top of
 * the field (`seam-shot.ts`), the shield on the tick (`seam-guard.ts`) — and
 * both call `seamAnswered` here once a step has all it asked for.
 *
 * Steps light on a beat, so unlike THE VALVE's windows a step's own beats are
 * whole: it closes once `since` reaches them.
 */

export function installSeam(world: World, steps: readonly SeamStep[]): SeamState {
  const s = freshSeam(world.beat, steps);
  world.events.push({ type: "seamEnter", col: midCol(world.cfg) });
  return s;
}

export function stepSeam(world: World, s: SeamState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "split") {
    if (since >= cfg.seamSplitBeats) {
      world.events.push({ type: "seamOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.seamStillBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.seamRestBeats) next(world, s);
  else if (s.phase === "lit" && since >= seamStepBeats(world, s)) miss(world, s);
}

/** How long the lit step stays lit, by what it asks. */
export function seamStepBeats(world: World, s: SeamState): number {
  const cfg = world.cfg;
  const ask = s.steps[s.cursor]?.ask ?? "point";
  if (ask === "grit") return cfg.seamGritBeats;
  if (ask === "rock") return cfg.seamRockBeats;
  if (ask === "both") return cfg.seamBothBeats;
  if (ask === "blind") return cfg.seamBlindBeats;
  if (ask === "glow") return cfg.seamGlowBeats;
  return cfg.seamPointBeats;
}

/**
 * The lit step has everything it asked for: THE SLOW lets go, the cursor moves
 * on and the ridge rests. Called by the shot and the shield, never the beat.
 */
export function seamAnswered(world: World, s: SeamState): void {
  closeSlow(world);
  rest(world, s);
}

/** The next step lights under THE SLOW, or, with the script done, the ridge
 * splits. */
function next(world: World, s: SeamState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) {
    s.phase = "split";
    s.phaseBeat = world.beat;
    world.events.push({ type: "seamSplit", col: midCol(world.cfg) });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.litTick = world.tick;
  s.shot = false;
  s.guarded = false;
  s.quenched = 0;
  openSlow(world, seamStepBeats(world, s), "ask");
  world.events.push({ type: "seamLight", ask: step.ask, col: seamStepCol(world, step) });
}

/**
 * A step ran out with an answer still owed: **the hull takes it, and the wave
 * is lost** — the owner's rule of 12 September 2026 (`wave-fail.ts`). Where
 * §26 says the point stays lit, this game has no hull hit that is not the wave.
 */
function miss(world: World, s: SeamState): void {
  const step = s.steps[s.cursor];
  const col = step === undefined ? midCol(world.cfg) : seamStepCol(world, step);
  world.events.push({ type: "seamMiss", col });
  closeSlow(world);
  rest(world, s);
  bossStrikesHull(world, "seam", col);
}

function rest(world: World, s: SeamState): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.cursor += 1;
}
