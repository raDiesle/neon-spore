import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type BastionLayer,
  type BastionState,
  bastionBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE BASTION set rather than played to, for `bastion-frame.test.ts`: the
 * wave's own moon stood past its arrival, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("bastion");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.bastionEnterBeats + 1); i++) step(world, []);
  return world;
}

/**
 * `layer` lit a beat in, `phase` "layer" — or the phase named, the cursor
 * on the shell named: nothing pulled, nothing off, the moon unturned, no
 * node charging — unless `arrange` says otherwise.
 */
export function posed(
  world: World,
  layer: BastionLayer,
  phase: BastionState["phase"] = "layer",
  arrange: (s: BastionState) => void = () => {},
): BastionState {
  const s = bastionBoss(world);
  if (s === null) throw new Error("the bastion wave hung no moon");
  const cursor = s.steps.findIndex((st) => st.layer === layer);
  if (cursor < 0) throw new Error(`the bastion wave has no ${layer}`);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = cursor;
  s.goneMask = 0;
  s.down = [false, false];
  s.pullMilli = [0, 0];
  s.tore = [false, false];
  s.yawMilli = 0;
  s.spinning = false;
  s.dischargeBeat = -1;
  s.nextChargeBeat = -1;
  arrange(s);
  return s;
}

/** The frames of a pose, joined, the world held where it was posed. */
export function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

export function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}
