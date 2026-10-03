import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Color,
  createWorld,
  midCol,
  type ScuttleState,
  scuttleBoss,
  scuttleSocketCol,
  scuttleSocketRow,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "../src/bolt-stop.js";
import type { Layout } from "../src/layout.js";
import { drawScuttle } from "../src/scuttle-draw.js";
import { ScuttleFx } from "../src/scuttle-fx.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE SCUTTLE set rather than played to, for `core-stop.test.ts` and
 * `scuttle-stop.test.ts`: the wave's own frame hung once it has come in,
 * every part seated, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

/** The frame hung and whole, nothing loose. */
export function stood(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("scuttle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.scuttleOutBeats + 2); i++) step(world, []);
  const s = body(world);
  s.loose = [];
  s.live = -1;
  s.cycleBeat = world.beat;
  return world;
}

export function body(world: World): ScuttleState {
  const s = scuttleBoss(world);
  if (s === null) throw new Error("the scuttle wave hung no frame");
  return s;
}

/** The bottom row's socket over `col`, or -1 for a column the frame is not over. */
export function socketOver(col: number): number {
  let found = -1;
  for (let i = 0; i < CFG.scuttleRows * CFG.scuttleCols; i++)
    if (
      scuttleSocketCol(CFG, i) === col &&
      (found < 0 || scuttleSocketRow(CFG, i) > scuttleSocketRow(CFG, found))
    )
      found = i;
  return found;
}

/** Socket `i`'s part let loose and live, in `color`, half way down its thread. */
export function live(
  world: World,
  i = socketOver(midCol(CFG)),
  color: Color = "cyan",
): ScuttleState {
  const s = body(world);
  const part = s.parts[i];
  if (part) part.color = color;
  s.loose = [i];
  s.live = i;
  s.cycleBeat = world.beat - 1;
  return s;
}

export function draw(world: World, stops: BoltStops, l: Layout): void {
  drawScuttle(paper(), l, world, body(world), world.beat, 0.5, 0, new ScuttleFx(), stops);
}
