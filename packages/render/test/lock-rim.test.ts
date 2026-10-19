import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, type SpawnEntry, ticksPerBeat } from "@neon-spore/sim";
import { LAY_LOOK } from "../src/cannon-maw.js";
import { computeLayout } from "../src/layout.js";
import { lockRim } from "../src/lock-rim.js";
import type { MouthFrame } from "../src/muzzle.js";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, ROLES, runFrames } from "./frame-harness.js";

/**
 * THE LOCK on the cannon's egg (`lock-rim.ts`): its white border turns yellow
 * from the top as the rest runs, all of it when a lock is ready, and stays
 * white while there is nothing to lock.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const SLICK: SpawnEntry = { beat: 0, col: 6, kind: "slick", color: "red" };
const MOUTH: MouthFrame = {
  x: 100,
  y: L.hullY,
  tipY: L.hullY - 8,
  l: L,
  intake: 0,
  surface: (x) => ({ x, y: L.hullY }),
};

/** The colours one egg's border was stroked in. */
function strokes(lock: number | undefined): string[] {
  const { ctx } = stubCanvas();
  const seen: string[] = [];
  const c = ctx as unknown as CanvasRenderingContext2D;
  const stroke = c.stroke.bind(c);
  c.stroke = ((p?: Path2D) => {
    seen.push(String(c.strokeStyle).toUpperCase());
    stroke(p as Path2D);
  }) as typeof c.stroke;
  LAY_LOOK.draw(c, MOUTH, { phase: 0, time: 0, lock });
  return seen;
}

describe("the lock on the cannon's egg", () => {
  it("leaves the border white while there is nothing to lock", () => {
    expect(lockRim(createWorld({ ...CFG }, 0, []))).toBeUndefined();
    expect(strokes(undefined)).not.toContain(PALETTE.pod);
  });

  it("is the rest's share while it runs, even with nothing on the field", () => {
    const w = createWorld({ ...CFG }, 0, []);
    w.lockRestTicks = Math.round((CFG.lockRestMs * CFG.tickHz) / 2000);
    expect(lockRim(w)).toBeCloseTo(0.5, 2);
  });

  it("strokes white and yellow while resting, and only yellow when ready", () => {
    const resting = strokes(0.5);
    expect(resting).toContain(PALETTE.pod);
    expect(resting).toContain(PALETTE.hullRim);
    const ready = strokes(1);
    expect(ready).toContain(PALETTE.pod);
    expect(ready).not.toContain(PALETTE.hullRim);
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
