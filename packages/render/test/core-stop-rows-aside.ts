import type { BoltStops } from "../src/bolt-stop.js";
import { drawCyst } from "../src/cyst-draw.js";
import { CystFx } from "../src/cyst-fx.js";
import type { Layout } from "../src/layout.js";
import { drawOculus } from "../src/oculus-draw.js";
import { OculusFx } from "../src/oculus-fx.js";
import { drawTrivet } from "../src/trivet-draw.js";
import { TrivetFx } from "../src/trivet-fx.js";
import { drawVise } from "../src/vise-draw.js";
import { ViseFx } from "../src/vise-fx.js";
import { stubCanvas } from "./canvas-stub.js";
import type { Row } from "./core-stop-rows.js";
import * as cyst from "./cyst-harness.js";
import * as oculus from "./oculus-harness.js";
import * as trivet from "./trivet-harness.js";
import * as vise from "./vise-harness.js";

/**
 * The rows of `core-stop.test.ts` for the bosses whose step can ask for a
 * part in a column of its own besides the core — THE CYST's bud, THE
 * OCULUS's look, THE TRIVET's tip, THE VISE's spit — each with its `aside`.
 */

const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

function drawnCyst(stops: BoltStops, l: Layout, lit: typeof cyst.FIRE, bared: boolean): void {
  const world = cyst.stood();
  const s = cyst.posed(world, lit, (c) => {
    c.bared = bared;
  });
  drawCyst(paper(), l, world, s, world.beat, 0.5, 0, new CystFx(), stops);
}

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

function drawnTrivet(stops: BoltStops, l: Layout, lit: typeof trivet.FIRE, hubLit: boolean): void {
  const world = trivet.stood();
  const s = trivet.posed(world, lit, hubLit);
  drawTrivet(paper(), l, world, s, world.beat, 0.5, 0, new TrivetFx(), stops);
}

export const ASIDE_ROWS: Row[] = [
  {
    name: "THE CYST",
    draw: (stops, l, open) => drawnCyst(stops, l, cyst.FIRE, open),
    wide: true,
    aside: { offset: 2, draw: (stops, l) => drawnCyst(stops, l, cyst.BUD, false) },
  },
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
  {
    name: "THE TRIVET",
    draw: (stops, l, open) => drawnTrivet(stops, l, trivet.FIRE, open),
    wide: true,
    aside: { offset: -2, draw: (stops, l) => drawnTrivet(stops, l, trivet.TIP, true) },
  },
];
