import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  startWave,
  step,
  type TasterState,
  tasterBladeAt,
  tasterBoss,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "../src/bolt-stop.js";
import type { Layout } from "../src/layout.js";
import { drawTaster } from "../src/taster-draw.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE TASTER set rather than played to, for `core-stop.test.ts`: the wave's
 * own fan a beat in, every blade grown with no colour on its edge, and the
 * middle one, `edged`, set red — so a cyan bolt pares it and a red one
 * thickens it.
 */

const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

export function body(world: World): TasterState {
  const t = tasterBoss(world);
  if (t === null) throw new Error("the taster wave grew no fan");
  return t;
}

export function stood(edged: boolean): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("taster");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG); i++) step(world, []);
  const t = body(world);
  for (const k of t.blades) {
    k.edge = null;
    k.layers = 1;
    k.growBeat = world.beat - CFG.tasterGrowBeats;
    k.shorn = false;
  }
  const mid = t.blades[tasterBladeAt(t, midCol(CFG))];
  if (mid !== undefined && edged) {
    mid.edge = "red";
    mid.setBeat = world.beat;
  }
  return world;
}

export function draw(world: World, stops: BoltStops, l: Layout): void {
  drawTaster(paper(), l, world, body(world), 0.5, 0, 0, 0, stops);
}
