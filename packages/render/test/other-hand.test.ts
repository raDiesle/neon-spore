import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, DEFAULT_CONFIG, step } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawOtherHand } from "../src/other-hand.js";
import { installCanvasGlobals, StubContext } from "./canvas-stub.js";

/**
 * THE OTHER HAND: presence, not progress. A thumb on the lance is the only
 * hold the simulation can honestly report back (`other-hand.ts` says why),
 * so this checks exactly that boundary — on while primed, off the instant
 * `prime` ends, and never a crash on the strict canvas either way.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const MOOD = { armed: 0, intake: 0, chew: 0, charge: 0 };
const AT = { cannon: L.cols / 2, shield: [] };

beforeAll(installCanvasGlobals);

function primedWorld() {
  const world = createWorld(CFG, 1);
  step(world, [{ tick: world.tick, player: 1, command: { kind: "prime", on: true } }]);
  return world;
}

describe("drawOtherHand", () => {
  it("draws nothing while no thumb is on the lance", () => {
    const world = createWorld(CFG, 1);
    const ctx = new StubContext();
    drawOtherHand(ctx as unknown as CanvasRenderingContext2D, L, world, 0, MOOD, AT);
    expect(ctx.calls).toBe(0);
  });

  it("draws a glow the instant the lance is held", () => {
    const world = primedWorld();
    const ctx = new StubContext();
    drawOtherHand(ctx as unknown as CanvasRenderingContext2D, L, world, 0, MOOD, AT);
    expect(ctx.calls).toBeGreaterThan(0);
  });

  it("stops the moment the thumb lifts, same tick it would end the fill", () => {
    const world = primedWorld();
    step(world, [{ tick: world.tick, player: 1, command: { kind: "prime", on: false } }]);
    const ctx = new StubContext();
    drawOtherHand(ctx as unknown as CanvasRenderingContext2D, L, world, 0, MOOD, AT);
    expect(ctx.calls).toBe(0);
  });

  it("never throws through the strict canvas, across a full fill", () => {
    const world = primedWorld();
    const ctx = new StubContext();
    for (let t = 0; t < 4; t += 1 / 30) {
      expect(() =>
        drawOtherHand(ctx as unknown as CanvasRenderingContext2D, L, world, t, MOOD, AT),
      ).not.toThrow();
      step(world, []);
    }
  });

  it("is a pure function of the world and the clock — two runs from the same state agree", () => {
    const world = primedWorld();
    const a = new StubContext();
    const b = new StubContext();
    drawOtherHand(a as unknown as CanvasRenderingContext2D, L, world, 1.25, MOOD, AT);
    drawOtherHand(b as unknown as CanvasRenderingContext2D, L, world, 1.25, MOOD, AT);
    expect(a.calls).toBe(b.calls);
  });
});
