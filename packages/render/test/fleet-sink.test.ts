import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, type FleetState, startWave, ticksPerBeat, type World } from "@neon-spore/sim";
import { FleetFx } from "../src/fleet-fx.js";
import { drawFleetHulls } from "../src/fleet-hulls.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A hull pulled under goes under at once** (`fleet-hulls.ts` `sinkPhase`).
 *
 * The sinking used to wait `FLEET_SHELL_BEATS` for a shell that had sunk the
 * ship to land; nothing but the navigator's pull sinks one now, and for two
 * beats the wreck sat afloat after the blow was over. Read on the navigator's
 * screen, which draws no hull that is afloat — so anything it draws is the
 * sinking.
 */

beforeAll(installCanvasGlobals);

function fleetWorld(): { world: World; boss: FleetState } {
  const world = createWorld(CFG, 3);
  const index = waveWith("fleet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const boss = world.boss;
  if (boss?.kind !== "fleet") throw new Error("the fleet wave installed no fleet");
  return { world, boss };
}

/** Draw calls one frame of the hulls makes on the navigator's screen. */
function navigatorCalls(world: World, boss: FleetState, beatPhase: number): number {
  const { ctx } = stubCanvas();
  const l = computeLayout(VIEWPORT, CFG, "p2");
  drawFleetHulls(
    ctx as unknown as CanvasRenderingContext2D,
    l,
    world,
    boss,
    beatPhase,
    0,
    new FleetFx(),
  );
  return ctx.calls;
}

describe("a sunk hull", () => {
  it("is not drawn on the navigator's screen while it floats", () => {
    const { world, boss } = fleetWorld();
    expect(navigatorCalls(world, boss, 0.5)).toBe(0);
  });

  it("is sinking on the next frame after the pull", () => {
    const { world, boss } = fleetWorld();
    // What `sinkFleetWreck` writes on the pull's tick; set from the outside,
    // because this rig has no thumb to pull with.
    boss.sunkBeat[0] = world.beat;
    expect(navigatorCalls(world, boss, 1 / ticksPerBeat(CFG))).toBeGreaterThan(0);
  });
});
