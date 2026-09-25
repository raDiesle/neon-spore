import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, type World } from "@neon-spore/sim";
import { drawBand } from "../src/band.js";
import { type FireShot, FireVein } from "../src/fire-vein.js";
import { computeLayout } from "../src/layout.js";
import type { ViewRole } from "../src/view-role.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A shot running from its button up the cord to the cannon (`fire-vein.ts`).
 *
 * The three things about it an eye on one frame cannot check: that it is drawn
 * at all on every screen a cord runs to the cannon, that it stops — a clock
 * that outlived its life would leave a lit cord on the panel for the rest of
 * the wave — and that `clear()` takes it off, because `world.tick` restarts
 * and nothing else would (`restart.test.ts`).
 */

beforeAll(installCanvasGlobals);

/** TWO COLOURS: both fire buttons on the panel. */
function world(): World {
  const w = createWorld(CFG, 5);
  w.wave = 2;
  return w;
}

function calls(role: ViewRole, shots: readonly FireShot[]): number {
  const l = computeLayout(VIEWPORT, CFG, role);
  const { ctx } = stubCanvas();
  drawBand(
    ctx as unknown as CanvasRenderingContext2D,
    l,
    world(),
    false,
    false,
    1,
    undefined,
    0,
    () => l.hullY,
    shots,
  );
  return ctx.calls;
}

describe("a shot running up the cord", () => {
  for (const role of ["p1", "p2", "test"] as const) {
    for (const age of [0.05, 0.12, 0.3]) {
      it(`is drawn on ${role}'s panel at ${age}s`, () => {
        expect(calls(role, [{ color: "red", age }])).toBeGreaterThan(calls(role, []));
        expect(calls(role, [{ color: "cyan", age }])).toBeGreaterThan(calls(role, []));
      });
    }
  }

  it("is gone once its life is spent", () => {
    const vein = new FireVein();
    vein.start("cyan");
    vein.update(0.2);
    expect(vein.shots).toHaveLength(1);
    vein.update(1);
    expect(vein.shots).toHaveLength(0);
    expect(calls("p2", [{ color: "cyan", age: 1 }])).toBe(calls("p2", []));
  });

  it("is taken off by clear()", () => {
    const vein = new FireVein();
    vein.start("red");
    vein.start("cyan");
    vein.clear();
    expect(vein.shots).toHaveLength(0);
  });
});
