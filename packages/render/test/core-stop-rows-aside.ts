import type { BoltStops } from "../src/bolt-stop.js";
import type { Layout } from "../src/layout.js";
import { drawOculus } from "../src/oculus-draw.js";
import { OculusFx } from "../src/oculus-fx.js";
import { drawVise } from "../src/vise-draw.js";
import { ViseFx } from "../src/vise-fx.js";
import { stubCanvas } from "./canvas-stub.js";
import type { Row } from "./core-stop-rows.js";
import * as oculus from "./oculus-harness.js";
import * as vise from "./vise-harness.js";

/**
 * The rows of `core-stop.test.ts` for the bosses whose step can ask for a
 * part in a column of its own besides the core — THE OCULUS's look and THE
 * VISE's spit — each with its `aside`.
 */

const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

function drawnOculus(stops: BoltStops, l: Layout, lit: typeof oculus.FIRE, open: boolean): void {
  const world = oculus.stood();
  const s = oculus.posed(world, lit, open);
  drawOculus(paper(), l, world, s, world.beat, 0.5, 0, new OculusFx(), stops);
}

function drawnVise(stops: BoltStops, l: Layout, lit: typeof vise.FIRE, bared: boolean): void {
  const world = vise.stood();
  const s = vise.posed(world, lit, bared);
  drawVise(paper(), l, world, s, world.beat, 0.5, 0, new ViseFx(), stops);
}

export const ASIDE_ROWS: Row[] = [
  {
    name: "THE OCULUS",
    draw: (stops, l, open) => drawnOculus(stops, l, oculus.FIRE, open),
    wide: true,
    aside: {
      offset: -2,
      draw: (stops, l) => drawnOculus(stops, l, oculus.LOOK, true),
      unmet: true,
    },
  },
  {
    name: "THE VISE",
    draw: (stops, l, open) => drawnVise(stops, l, vise.FIRE, open),
    wide: true,
    aside: { offset: 2, draw: (stops, l) => drawnVise(stops, l, vise.SPIT, true) },
  },
];
