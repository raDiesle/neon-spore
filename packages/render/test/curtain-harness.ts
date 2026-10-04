import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CurtainState,
  createWorld,
  curtainBody,
  curtainBoss,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "../src/bolt-stop.js";
import { drawCurtain } from "../src/curtain-draw.js";
import type { Layout } from "../src/layout.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE CURTAIN set rather than played to, for `core-stop.test.ts`: the wave's
 * own fabric a beat in, its core cyan up the middle column, then the sheet
 * hung over it or shoved off it.
 */

const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;
const MID = midCol(CFG);

export function body(world: World): CurtainState {
  const c = curtainBoss(world);
  if (c === null) throw new Error("the curtain wave hung no fabric");
  return c;
}

/** The fabric hung, its core cyan up the middle, covered by the sheet or, `bare`, shoved out from under it. */
export function stood(bare: boolean): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("curtain");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG); i++) step(world, []);
  const c = body(world);
  c.coreColor = "cyan";
  c.coreCol = MID;
  const sheet = curtainBody(world, c);
  if (sheet === undefined) throw new Error("the fabric is gone already");
  sheet.fromCol = sheet.col;
  sheet.col = bare ? MID + 1 : MID - 3;
  return world;
}

export function draw(world: World, stops: BoltStops, l: Layout): void {
  const c = body(world);
  drawCurtain(paper(), l, world, c, world.beat, 0.5, 0, undefined, 0, undefined, 0, stops);
}
