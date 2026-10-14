import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type ChrysalisSkin,
  type ChrysalisState,
  chrysalisBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE CHRYSALIS set rather than played to, for `chrysalis-frame.test.ts`: the
 * wave's own cocoon hung past its arrival, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);

export function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("chrysalis");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.chrysalisEnterBeats + 1); i++) step(world, []);
  return world;
}

/**
 * `skin`'s first course lit a beat in, phase "skin" — or the phase named, the
 * cursor on that course: nothing rubbed or pulled, nothing off, no sac
 * swelling — unless `arrange` says otherwise.
 */
export function posed(
  world: World,
  skin: ChrysalisSkin,
  phase: ChrysalisState["phase"] = "skin",
  arrange: (s: ChrysalisState) => void = () => {},
): ChrysalisState {
  const s = chrysalisBoss(world);
  if (s === null) throw new Error("the chrysalis wave hung no cocoon");
  const cursor = s.steps.findIndex((st) => st.skin === skin);
  if (cursor < 0) throw new Error(`the chrysalis wave has no ${skin}`);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = cursor;
  s.goneMask = 0;
  s.down = [false, false];
  s.pullMilli = [0, 0];
  s.tore = [false, false];
  s.rubAt = [-1, -1];
  s.rubbed = [0, 0];
  s.sprayBeat = -1;
  s.nextSwellBeat = -1;
  arrange(s);
  return s;
}

/** The frames of a pose, joined, the world held where it was posed. */
export function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = hung();
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
