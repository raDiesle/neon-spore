import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type HydraHead,
  type HydraState,
  hydraBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE HYDRA set rather than played to, for `hydra-frame.test.ts`: the
 * wave's own body hung past its arrival, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);

export function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("hydra");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.hydraEnterBeats + 1); i++) step(world, []);
  return world;
}

/**
 * `head`'s first level lit a beat in, phase "heads" — or the phase named,
 * the cursor on that level: nothing cut, turned or tapped, every eye shut —
 * unless `arrange` says otherwise. `nth` picks a later level of that kind.
 */
export function posed(
  world: World,
  head: HydraHead,
  phase: HydraState["phase"] = "heads",
  arrange: (s: HydraState) => void = () => {},
  nth = 0,
): HydraState {
  const s = hydraBoss(world);
  if (s === null) throw new Error("the hydra wave hung no body");
  const levels = s.steps.flatMap((st, i) => (st.head === head ? [i] : []));
  const cursor = levels[nth] ?? -1;
  if (cursor < 0) throw new Error(`the hydra wave has no ${head}`);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = cursor;
  s.goneMask = 0;
  s.down = [false, false];
  s.cutMilli = [0, 0];
  s.spent = [false, false];
  s.turning = [false, false];
  s.turnAtMilli = [0, 0];
  s.unwoundMilli = [0, 0];
  s.lidOpen = [false, false];
  s.blinkBeat = [-1, -1];
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
