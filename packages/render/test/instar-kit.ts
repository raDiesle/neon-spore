import { buildBoss, buildQueue, controlSetForWave } from "@neon-spore/content";
import {
  type BossSequenceStep,
  createWorld,
  type InstarState,
  instarBoss,
  NO_BEARING,
  NOT_DONE,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { Field } from "../src/touch.js";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * **THE INSTAR stood up for a test**: the wave's body hung, a step's marks
 * put up untouched, and the field a thumb on one screen sees. Every INSTAR
 * render test stands the body up with these; a variant one test needs — the
 * frame test's `morphing` or `down` — is a local wrapper over `acting`.
 */

export const TPB = ticksPerBeat(CFG);

/** A world with the body hung and a few beats of the wave behind it. */
export function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("instar");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/**
 * The body acting on a step, its marks untouched — or `put` in that step's
 * place, for a shape of step the shipped script does not have. THE SLOW is
 * left shut, so no mark is drawn: `asking` is the step as the game plays it.
 */
export function acting(world: World, cursor: number, put?: BossSequenceStep): InstarState {
  const s = instarBoss(world);
  if (s === null) throw new Error("the instar wave hung no body");
  if (put !== undefined) s.steps[cursor] = put;
  s.cursor = cursor;
  s.phase = "act";
  s.phaseBeat = world.beat;
  const n = s.steps[cursor]?.marks.length ?? 0;
  s.progress = Array.from({ length: n }, () => 0);
  s.doneBeat = Array.from({ length: n }, () => NOT_DONE);
  s.ref = Array.from({ length: n }, () => NO_BEARING);
  s.thumbs = Array.from({ length: n }, () => 0);
  return s;
}

/**
 * `acting` with THE SLOW open over the step's window, as `sim/instar-step.ts`
 * opens it: the only state a mark is drawn in (`instar-marks.ts`
 * `instarMarksUp`).
 */
export function asking(world: World, cursor: number, put?: BossSequenceStep): InstarState {
  const s = acting(world, cursor, put);
  world.slowFromBeat = world.beat;
  world.slowToBeat = world.beat + (s.steps[cursor]?.windowBeats ?? 1);
  world.slowAsks = true;
  return s;
}

/** The field as a thumb on this screen sees it, standing on one beat of it. */
export function field(world: World, beat: number, beatPhase: number): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase,
    skinY: null,
    beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat: 1,
    cfg: CFG,
    boss: world.boss,
    slow: world,
    controls: controlSetForWave(waveWith("instar")),
    faults: [],
    well: false,
  };
}
