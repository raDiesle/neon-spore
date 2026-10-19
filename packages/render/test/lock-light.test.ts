import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, type SpawnEntry, ticksPerBeat, type World } from "@neon-spore/sim";
import { frame, type HullMood } from "../src/hull-frame.js";
import { computeLayout } from "../src/layout.js";
import { drawLockLight } from "../src/lock-light.js";
import { LOCK_LIGHT } from "../src/lock-light-look.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, ROLES, runFrames } from "./frame-harness.js";

/**
 * THE LOCK's light (`lock-light.ts`, `lock-light-look.ts`): lit while a lock
 * is ready, an arc filling while it rests, and nothing at all over a field
 * with nothing to lock.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const MOOD: HullMood = { armed: 0, intake: 0, chew: 0, charge: 0 };
const AT = { cannon: 4, shield: [] };
const SLICK: SpawnEntry = { beat: 0, col: 6, kind: "slick", color: "red" };

function light(world: World) {
  const { ctx } = stubCanvas();
  drawLockLight(ctx as unknown as CanvasRenderingContext2D, L, world, frame(L, 0, MOOD, AT), 0, 0);
  return ctx;
}

describe("the lock's light", () => {
  it("is not drawn over a field with nothing to lock", () => {
    expect(light(createWorld({ ...CFG }, 0, [])).calls).toBe(0);
  });

  it("is drawn while the lock rests, even with nothing on the field", () => {
    const w = createWorld({ ...CFG }, 0, []);
    w.lockRestTicks = 100;
    expect(light(w).calls).toBeGreaterThan(0);
  });

  it("is lit amber when ready, and an arc while it rests", () => {
    const at = { x: 100, y: 700, tile: 30, time: 0, beatPhase: 0, surface: () => 700 };
    const ready = stubCanvas().ctx;
    LOCK_LIGHT.paint(ready as unknown as CanvasRenderingContext2D, { ...at, charge: 1 });
    expect(ready.tally.get("stroke") ?? 0).toBe(0);
    expect(ready.tally.get("fill")).toBe(3);
    const resting = stubCanvas().ctx;
    LOCK_LIGHT.paint(resting as unknown as CanvasRenderingContext2D, { ...at, charge: 0.5 });
    expect(resting.tally.get("stroke")).toBe(1);
  });

  it("survives whole frames on every seat through a lock spent and resting", () => {
    const tpb = ticksPerBeat(CFG);
    for (const role of ROLES) {
      const world = createWorld({ ...CFG }, 0, [SLICK]);
      const { ctx } = runFrames(world, role, tpb * 3, {
        onTick: (tick, w) => {
          if (tick === tpb) w.lockRestTicks = 200;
        },
      });
      expect(ctx.calls).toBeGreaterThan(0);
    }
  });
});
