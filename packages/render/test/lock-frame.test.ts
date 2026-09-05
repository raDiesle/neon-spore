import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, isLockedOn, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { lockLink } from "../src/lock-mark.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, VIEWPORT } from "./frame-harness.js";

/**
 * THE LOCK, as a picture: the frame over the body player 1 is holding, and the
 * bolt that curves into it.
 *
 * Both halves are drawn from world state rather than from events, and both
 * carry a number that was zero for the whole life of this game until now — a
 * bullet standing between two columns, and a tail laid down at an angle. So
 * what this asserts is what every frame test here asserts: that no value
 * handed to the canvas is one a real canvas would refuse.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

/** A body seven columns from the cannon, a hand on it, and a shot sent after
 * it — which is a bolt that spends its whole flight between two columns. */
function lockedFrames(role: (typeof ROLES)[number], queue: SpawnEntry[]) {
  return runFrames(createWorld(CFG, 5, queue), role, TPB * 5, {
    every: 2,
    onTick: (tick, w) => {
      if (tick === 0) step(w, [{ tick, player: 1, command: { kind: "cannonCol", col: 1 } }]);
      else if (tick === TPB) step(w, [{ tick, player: 1, command: { kind: "grip", id: 1 } }]);
      else if (tick === TPB * 2)
        step(w, [{ tick, player: 2, command: { kind: "fire", color: "red" } }]);
      else step(w, []);
    },
  });
}

const SLICK: SpawnEntry[] = [{ beat: 0, col: 8, kind: "slick", color: "red" }];
const ROCK: SpawnEntry[] = [{ beat: 0, col: 8, kind: "meteor", color: null }];

describe("a locked body and the bolt going to it", () => {
  for (const role of ROLES) {
    it(`draws the frame and the curve for ${role} without the canvas refusing a value`, () => {
      const { ctx } = lockedFrames(role, SLICK);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("is drawn on both screens, because the seat that fires is the other one", () => {
    const p1 = lockedFrames("p1", SLICK);
    const p2 = lockedFrames("p2", SLICK);
    expect(p1.ctx.calls).toBeGreaterThan(0);
    expect(p2.ctx.calls).toBeGreaterThan(0);
  });

  it("wears no frame over a rock, which is held and cannot be shot", () => {
    const { world } = lockedFrames("p1", ROCK);
    expect(world.gripP1).toBe(1);
    expect(isLockedOn(world, 1)).toBe(false);
  });

  it("wears one over the body it is actually promised to", () => {
    const { world } = lockedFrames("p1", SLICK);
    // The slick is shot down partway through, so the run is checked at the
    // moment the hand went on rather than at the end.
    const w = createWorld(CFG, 5, SLICK);
    for (let t = 0; t <= TPB; t++) {
      step(w, t === TPB ? [{ tick: t, player: 1, command: { kind: "grip", id: 1 } }] : []);
    }
    expect(isLockedOn(w, 1)).toBe(true);
    expect(world.creatures).toHaveLength(0);
  });
});

/**
 * The owner's line, and the one that makes the rule legible: the frame says
 * *this one is picked out* and says nothing about what picked it out, so a
 * dotted line runs back to the cannon.
 *
 * Its geometry is tested rather than its stroke, for the reason `lockLink`
 * gives: a line in the wrong colour is seen at once, and a line pointing a
 * tenth of a column off is not. `drawBodies` takes the eased column as an
 * argument with a default, so a caller that quietly stopped passing it would
 * compile, would still draw a line, and would draw it to the wrong place.
 */
describe("the line back to the cannon", () => {
  const l = computeLayout(VIEWPORT, CFG, "p1");

  it("starts at the cannon's own column on the hull", () => {
    const a = lockLink(l, 2, 400, 100, 10);
    const b = lockLink(l, 7, 400, 100, 10);
    if (!a || !b) throw new Error("both of those lines have somewhere to go");
    expect(a.fromY).toBe(l.hullY);
    expect(b.fromY).toBe(l.hullY);
    // Five columns apart at one end and the same point at the other.
    expect(b.fromX - a.fromX).toBeCloseTo(5 * l.tile, 5);
    expect(a.toX).not.toBeCloseTo(b.toX, 5);
  });

  it("follows the eased column rather than jumping between whole ones", () => {
    const whole = lockLink(l, 3, 400, 100, 10);
    const part = lockLink(l, 3.5, 400, 100, 10);
    if (!whole || !part) throw new Error("both of those lines have somewhere to go");
    expect(part.fromX - whole.fromX).toBeCloseTo(l.tile / 2, 5);
  });

  it("stops short of the body, so it never crosses the frame it points at", () => {
    const clear = 40;
    const line = lockLink(l, 2, 400, 100, clear);
    if (!line) throw new Error("that line has somewhere to go");
    const short = Math.hypot(400 - line.toX, 100 - line.toY);
    expect(short).toBeCloseTo(clear, 5);
  });

  it("is nothing at all once the body is inside the frame it would point at", () => {
    const x = tileCXOf(l, 4);
    expect(lockLink(l, 4, x, l.hullY - 5, 40)).toBeNull();
  });
});

/** The cannon's own x, so the test above can put a body on top of it. */
function tileCXOf(l: ReturnType<typeof computeLayout>, col: number): number {
  const line = lockLink(l, col, 10_000, 10_000, 0);
  if (!line) throw new Error("a line to the far corner always has somewhere to go");
  return line.fromX;
}
