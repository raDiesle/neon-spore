import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type MimicState,
  type MimicStep,
  mimicBoss,
  mimicFrame,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE MIMIC set rather than played to, for `mimic-frame.test.ts`: the wave's
 * own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
/** A sign the pilot reads and the navigator draws. */
export const SIGN: MimicStep = {
  ask: "sign",
  reader: 1,
  changes: false,
  size: 3,
  beats: 10,
};
/** A split skin: each seat reads the other's half. */
export const SPLIT: MimicStep = { ...SIGN, ask: "split" };
/** The bare core. */
export const CORE: MimicStep = { ...SIGN, ask: "core", size: 0, beats: 4 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("mimic");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  return world;
}

/**
 * `phase` a beat in on `lit` — a picture the pilot reads by default, the
 * navigator's to paint as the cross — nothing peeled, nothing painted and no
 * arm reached, unless `arrange` says otherwise.
 */
export function posed(
  world: World,
  phase: MimicState["phase"] = "sign",
  lit: MimicStep = SIGN,
  arrange: (s: MimicState) => void = () => {},
): MimicState {
  const s = mimicBoss(world);
  if (s === null) throw new Error("the mimic wave stood no mimic");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.steps[0] = lit;
  s.signs = lit.ask === "split" ? [1, 3] : lit.ask === "sign" ? [-1, 0] : [-1, -1];
  if (lit.ask === "sign" && lit.reader === 2) s.signs = [0, -1];
  // Each picture in its own frame, as the simulation stands it, and a bare board.
  const at = (seat: 1 | 2) => {
    const f = mimicFrame(CFG, lit, seat);
    return f.col + f.row * CFG.cols;
  };
  s.origins = [at(1), at(2)];
  s.paint.fill(0);
  s.peeled = [false, false];
  s.changed = false;
  s.reaches = 0;
  s.peels = 0;
  s.hits = 0;
  arrange(s);
  return s;
}

/** The frames of a pose, joined, the world held where it was posed. */
export function frame(role: ViewRole, arrange: (world: World) => void, thrown?: SimEvent): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      if (tick === 0 && thrown) w.events.push(thrown);
    },
  });
  return log.join("|");
}

export function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}
