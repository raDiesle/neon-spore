import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, type SpawnEntry, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { creatureCenter } from "../src/creature-place.js";
import { drawCarryArrows } from "../src/grip-arrows.js";
import { computeLayout } from "../src/layout.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The two arrows beside a held rock, and the one thing they have to say that
 * nothing on the field said before: **not yet**. The owner, 30 September 2026,
 * took away the other half — *you may carry this* — because the guide teaches
 * that once and the standard set wears no helper (`docs/controls-catalogue.md`).
 *
 * Counted rather than looked at. What is being pinned is that the arrows are
 * the beat of quiet a carry costs (`sim/grip-push.ts`) and nothing else, and
 * that a direction the simulation would refuse — a wall on one side — is not
 * drawn; a test that named an arc would pass the day the chevron became a
 * triangle while still pointing into the wall.
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
  const at = creatureCenter(L, world, c, 0);
  drawCarryArrows(ctx as unknown as CanvasRenderingContext2D, L, world, c, at.x, at.y, L.tile);
  return ctx.calls;
}

/** The brightest alpha the arrows were stroked at, for the one body here. */
function alphaOf(world: World): number {
  const c = world.creatures[0];
  if (!c) throw new Error("the field is empty");
  const { ctx } = stubCanvas();
  let peak = 0;
  const stroke = ctx.stroke.bind(ctx);
  ctx.stroke = () => {
    peak = Math.max(peak, ctx.globalAlpha);
    stroke();
  };
  const at = creatureCenter(L, world, c, 0);
  drawCarryArrows(ctx as unknown as CanvasRenderingContext2D, L, world, c, at.x, at.y, L.tile);
  return peak;
}

/** The same rock, carried on the beat the world is on. */
function justCarried(col: number): World {
  const world = heldRock(col);
  const c = world.creatures[0];
  if (!c) throw new Error("the field is empty");
  c.pushBeat = world.beat;
  return world;
}

describe("the arrows beside a held rock", () => {
  it("are not drawn while the rock may be carried", () => {
    expect(marks(heldRock(4))).toBe(0);
  });

  it("are drawn on the beat the rock is carried", () => {
    expect(marks(justCarried(4))).toBeGreaterThan(0);
  });

  it("point fewer ways against a wall than in the open", () => {
    expect(marks(justCarried(0))).toBeLessThan(marks(justCarried(4)));
    expect(marks(justCarried(CFG.cols - 1))).toBeLessThan(marks(justCarried(4)));
  });

  it("are gone once the wait the simulation counts has passed", () => {
    const world = justCarried(4);
    world.beat += CFG.gripPushPauseBeats;
    expect(marks(world)).toBeGreaterThan(0);
    world.beat += 1;
    expect(marks(world)).toBe(0);
  });

  it("fade over the pause rather than stepping off", () => {
    const world = justCarried(4);
    const early = alphaOf(world);
    world.beat += CFG.gripPushPauseBeats;
    const late = alphaOf(world);
    expect(late).toBeGreaterThan(0);
    expect(late).toBeLessThan(early);
  });
});
