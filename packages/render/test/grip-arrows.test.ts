import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SpawnEntry, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { creatureCenter } from "../src/creature-place.js";
import { drawCarryArrows } from "../src/grip-arrows.js";
import { computeLayout } from "../src/layout.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

/**
 * The two arrows beside a held rock, and the two things they have to say that
 * nothing on the field said before: **you may carry this**, and **not yet**.
 *
 * Both are counted rather than looked at. What is being pinned is that a
 * direction the simulation would refuse is a direction the picture does not
 * offer — a wall on one side, and the beat of quiet a carry costs
 * (`sim/grip-push.ts`) — and a test that named an arc would pass the day the
 * chevron became a triangle while still promising a lane that is not there.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const TPB = ticksPerBeat(CFG);

/** One rock in `col`, held by player 1 from the first beat. */
function heldRock(col: number): World {
  const queue: SpawnEntry[] = [{ beat: 0, col, kind: "meteor", color: null }];
  const world = createWorld({ ...CFG, rows: 200 }, 3, queue);
  for (let tick = 0; tick <= TPB * 2; tick++) {
    step(world, tick === TPB ? [{ tick, player: 1, command: { kind: "grip", id: 1 } }] : []);
  }
  return world;
}

/** What the arrows alone put on the screen for the one body in this world. */
function marks(world: World): number {
  const c = world.creatures[0];
  if (!c) throw new Error("the field is empty");
  const { ctx } = stubCanvas();
  const at = creatureCenter(L, c, 0);
  drawCarryArrows(
    ctx as unknown as CanvasRenderingContext2D,
    L,
    world,
    c,
    at.x,
    at.y,
    L.tile,
    0.25,
  );
  return ctx.calls;
}

describe("the arrows beside a held rock", () => {
  it("offers both lanes in the middle of the field", () => {
    expect(marks(heldRock(4))).toBeGreaterThan(0);
  });

  it("offers fewer against a wall than in the open", () => {
    expect(marks(heldRock(0))).toBeLessThan(marks(heldRock(4)));
    expect(marks(heldRock(CFG.cols - 1))).toBeLessThan(marks(heldRock(4)));
  });

  it("goes out for the beat the body has to stand still", () => {
    const world = heldRock(4);
    const c = world.creatures[0];
    if (!c) throw new Error("the field is empty");
    expect(marks(world)).toBeGreaterThan(0);
    // Carried on this beat: `carryIsReady` is false until the pause is over,
    // and the arrows are that pause drawn.
    c.pushBeat = world.beat;
    expect(marks(world)).toBe(0);
    // And back, once the wait the simulation counts has passed.
    world.beat += CFG.gripPushPauseBeats + 1;
    expect(marks(world)).toBeGreaterThan(0);
  });
});
