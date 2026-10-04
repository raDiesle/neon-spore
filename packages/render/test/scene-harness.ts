import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_BEARING,
  NOT_DONE,
  type SceneState,
  sceneBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * A scene — THE INSTAR or THE NETTLE — set rather than played to, for
 * `nettle-stop.test.ts` and `instar-stop.test.ts`: the wave's own script a
 * few beats in, then put on a step by writing its state.
 */

const TPB = ticksPerBeat(CFG);

/** The wave's own scene of `kind`, a few beats along. */
export function hung(kind: "instar" | "nettle"): World {
  const world = createWorld(CFG, 3);
  const index = waveWith(kind);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

export function body(world: World): SceneState {
  const s = sceneBoss(world);
  if (s === null) throw new Error("the wave hung no scene");
  return s;
}

/** The first step of the script with a SHOOT mark. */
export function shootStep(s: SceneState): number {
  const at = s.steps.findIndex((st) => st.marks.some((m) => m.gesture === "shoot"));
  if (at < 0) throw new Error("the script asks for no shot");
  return at;
}

/**
 * Step `cursor` with its marks up, the window just opened, nothing answered,
 * THE SLOW open over it as `sim/instar-step.ts` opens it.
 */
export function acting(world: World, cursor: number): SceneState {
  const s = body(world);
  s.cursor = cursor;
  s.phase = "act";
  s.phaseBeat = world.beat;
  world.slowFromBeat = world.beat;
  world.slowToBeat = world.beat + (s.steps[cursor]?.windowBeats ?? 1);
  world.slowAsks = true;
  const n = s.steps[cursor]?.marks.length ?? 0;
  s.progress = Array.from({ length: n }, () => 0);
  s.doneBeat = Array.from({ length: n }, () => NOT_DONE);
  s.ref = Array.from({ length: n }, () => NO_BEARING);
  s.thumbs = Array.from({ length: n }, () => 0);
  return s;
}

/** Step `cursor` halfway through its morph, its marks down. */
export function morphing(world: World, cursor: number): SceneState {
  const s = acting(world, cursor);
  s.phase = "morph";
  s.phaseBeat = world.beat - Math.floor((s.steps[cursor]?.morphBeats ?? 2) / 2);
  return s;
}
