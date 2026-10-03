import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type TrivetState,
  type TrivetStep,
  ticksPerBeat,
  trivetBoss,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE TRIVET set rather than played to, for `core-stop.test.ts`: the wave's
 * own stand planted a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: TrivetStep = { ask: "fire", pads: 2, color: "cyan", beats: 3 };
/** A lurch onto the front foot, two columns left, its three pads held down. */
export const TIP: TrivetStep = { ask: "tip", pads: 3, color: "cyan", beats: 4, offset: -2 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("trivet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The stand planted, `lit` under the cursor a beat in, its hub lit if `lit`, the front chord held for a tip. */
export function posed(world: World, lit: TrivetStep, hubLit: boolean): TrivetState {
  const s = trivetBoss(world);
  if (s === null) throw new Error("the trivet wave installed no stand");
  s.phase = "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.feet = [0, 0];
  s.hubLit = hubLit;
  s.padsDown = [lit.ask === "tip" ? (1 << lit.pads) - 1 : 0, 0];
  s.heldBeats = 0;
  s.steps[0] = lit;
  return s;
}
