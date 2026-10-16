import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld, step, ticksPerBeat, type World } from "@neon-spore/sim";
import type { BossCue } from "../src/boss-cue-shape.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawShipButtonMarks, markedShipButtons } from "../src/ship-button-mark.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **SHIELD and SUCK wear the shot's mark when something asks for them** —
 * the owner, 16 October 2026 (`ship-button-mark.ts`): a boss's cue saying the
 * word, or the field itself, on any wave.
 */

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);
const SET = controlSet("default");

beforeAll(installCanvasGlobals);

function rockAt(col: number): World {
  const world = createWorld(CFG, 3, [{ beat: 0, col, kind: "meteor", color: null }]);
  for (let t = 0; t < ticksPerBeat(CFG) * 2; t++) step(world, []);
  return world;
}

function said(word: string): BossCue {
  return { seat: 1, kind: "PRESS", word, x: 200, y: 300, halfW: 40, halfH: 25, seed: 1 };
}

const asks = (world: World, cue: BossCue | null = null): string[] =>
  markedShipButtons(layout("p1"), world, cue, SET).map((b) => b.ask);

describe("the SHIELD and SUCK buttons' mark", () => {
  it("rings SHIELD while a rock stands in the shield's column, and not after it moves", () => {
    const world = rockAt(4);
    world.shieldCol = 4;
    expect(asks(world)).toEqual(["guard"]);
    world.shieldCol = 8;
    expect(asks(world)).toEqual([]);
  });

  it("rings the button a boss's cue names, with nothing on the field", () => {
    const world = createWorld(CFG, 3);
    expect(asks(world, said("SHIELD"))).toEqual(["guard"]);
    expect(asks(world, said("SUCK"))).toEqual(["intake"]);
    expect(asks(world, said("FIRE"))).toEqual([]);
  });

  it("draws nothing on the screen without the button", () => {
    const world = rockAt(4);
    world.shieldCol = 4;
    expect(markedShipButtons(layout("p2"), world, null, SET)).toEqual([]);
  });

  it("draws without throwing", () => {
    const world = rockAt(4);
    world.shieldCol = 4;
    const { ctx } = stubCanvas();
    drawShipButtonMarks(
      ctx as unknown as CanvasRenderingContext2D,
      layout("p1"),
      world,
      null,
      1.2,
      SET,
    );
  });
});
