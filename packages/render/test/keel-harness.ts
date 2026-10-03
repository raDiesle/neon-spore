import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type KeelState,
  keelBoss,
  NO_JOINT,
  NO_ROCK,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { drawKeel } from "../src/keel-draw.js";
import { KeelFx } from "../src/keel-fx.js";
import type { Layout } from "../src/layout.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE KEEL set rather than played to, for `core-stop.test.ts` and
 * `keel-stop.test.ts`: the wave's own spine stood a few beats in, the outer
 * four locked and the middle at rest, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

/** The spine stood and at rest, its outer four segments locked and nothing thrown. */
export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = body(world);
  s.phase = "rest";
  s.phaseBeat = world.beat - 3;
  s.movement = 2;
  s.joint = NO_JOINT;
  s.locked = s.locked.map((_, k) => k < 2 || k >= s.locked.length - 2);
  s.marrow = [false, false];
  s.rockCol = NO_ROCK;
  return world;
}

export function body(world: World): KeelState {
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  return s;
}

/** The spine stood, posed by `arrange` a beat in, drawn through its own drawer with the bolts' stops. */
export function aimed(l: Layout, arrange: (s: KeelState, world: World) => void): BoltStops {
  const world = stood();
  const s = body(world);
  arrange(s, world);
  const stops = new BoltStops();
  drawKeel(paper(), l, world, s, world.beat, 0.5, 0, new KeelFx(), stops);
  return stops;
}

/** The midpoint split and its socket open, flashing cyan. */
export function socket(s: KeelState, world: World): void {
  s.phase = "socket";
  s.phaseBeat = world.beat - 1;
  s.socket = "cyan";
}
