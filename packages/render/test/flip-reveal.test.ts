import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Creature, createWorld } from "@neon-spore/sim";
import { flatCenter } from "../src/creature-place.js";
import { creatureAt } from "../src/creature-under.js";
import { burstFor } from "../src/effects-spark.js";
import { bodyCol, FLIP_TRUTH_TILES, fieldX, tilesAboveHull } from "../src/field-flip.js";
import { drawProjected } from "../src/flip-reveal.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { under } from "./bodies-under.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE FLIP tells the truth for the last two tiles** (`field-flip.ts`,
 * `flip-reveal.ts`). High up the turned field a body is drawn in the mirror of
 * its column. Within `FLIP_TRUTH_TILES` of the hull it is drawn where it
 * really is, so it lands on the crater the ship digs for it. A finger and a
 * burst follow it across the switch, and the tear is drawn on the turned
 * screen and nowhere else.
 */

beforeAll(installCanvasGlobals);

const flat = computeLayout(VIEWPORT, CFG, "p1");
const turned = { ...flat, flip: true };
/** The last row a body is still a projection on, and the first it is not. */
const high = Math.floor(flat.rows - 1.5 - FLIP_TRUTH_TILES - 0.01);
const low = high + 1;

describe("bodyCol", () => {
  it("mirrors a body high up a turned field and not near the hull", () => {
    expect(tilesAboveHull(turned, high)).toBeGreaterThan(FLIP_TRUTH_TILES);
    expect(tilesAboveHull(turned, low)).toBeLessThanOrEqual(FLIP_TRUTH_TILES);
    expect(bodyCol(turned, 0, high)).toBe(turned.cols - 1);
    expect(bodyCol(turned, 0, low)).toBe(0);
  });

  it("is the column itself on a screen that is not turned", () => {
    for (const row of [0, high, low, flat.rows - 1]) expect(bodyCol(flat, 2, row)).toBe(2);
  });
});

describe("a body crossing the switch", () => {
  const body = { id: 1, kind: "slick", col: 1, row: low, color: "red" } as unknown as Creature;

  it("is drawn in its true column, and a finger finds it there", () => {
    const at = flatCenter(turned, body, 0);
    expect(at.x).toBeCloseTo(tileCX(flat, 1), 6);
    const world = createWorld(CFG, 3);
    world.creatures.push(body);
    expect(creatureAt(turned, under(world, 0, 1), at.x, at.y)).toBe(body);
  });

  it("bursts where it was drawn: the mirror up high, the truth down low", () => {
    const up = burstFor({ type: "destroy", col: 1, row: high, color: "red" } as never, turned, CFG);
    const down = burstFor(
      { type: "destroy", col: 1, row: low, color: "red" } as never,
      turned,
      CFG,
    );
    expect(up?.x).toBeCloseTo(fieldX(turned, 1), 6);
    expect(down?.x).toBeCloseTo(tileCX(flat, 1), 6);
  });
});

describe("the tear", () => {
  const paints = (flip: boolean, row: number): number => {
    const { ctx } = stubCanvas();
    let n = 0;
    const l = flip ? turned : flat;
    const y = flat.gridTop + row * flat.tile;
    drawProjected(ctx as unknown as CanvasRenderingContext2D, l, 7, row, 100, y, 1.3, () => n++);
    return n;
  };
  const edge = flat.rows - 1.5 - FLIP_TRUTH_TILES;

  it("paints a body once, whole, away from the switch or on a true screen", () => {
    expect(paints(true, 2)).toBe(1);
    expect(paints(true, flat.rows - 1)).toBe(1);
    expect(paints(false, edge - 0.1)).toBe(1);
    expect(paints(false, edge + 0.1)).toBe(1);
  });

  it("paints it in pieces on either side of the switch on the turned one", () => {
    expect(paints(true, edge - 0.2)).toBeGreaterThan(1);
    // Past the switch: the afterimage and the arriving body, both in strips.
    expect(paints(true, edge + 0.2)).toBeGreaterThan(2);
  });
});
