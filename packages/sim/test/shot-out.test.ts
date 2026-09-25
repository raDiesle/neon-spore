import { describe, expect, it } from "bun:test";
import { advanceBullets } from "../src/bullets.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import type { SimEvent } from "../src/events.js";
import { createWorld } from "../src/world.js";

/**
 * **A shot out of the top says so**, with where it stood — the picture flies
 * it on from there to the top of the screen (`render/shot-out.ts`), and a bolt
 * that jumped or went missing at the seam would be the first thing an eye
 * following it saw.
 */

function climbOut(col: number, driftMilli: number): SimEvent[] {
  const world = createWorld({ ...DEFAULT_CONFIG }, 1);
  world.bullets.push({
    id: 9,
    col,
    row: 1,
    subMilli: 0,
    color: "red",
    lance: false,
    driftMilli,
    aimMilli: 0,
  });
  const said: SimEvent[] = [];
  for (let t = 0; t < 40 && world.bullets.length > 0; t++) {
    advanceBullets(world);
    said.push(...world.events);
    world.events.length = 0;
  }
  expect(world.bullets).toHaveLength(0);
  return said;
}

describe("a shot leaving the top of the field", () => {
  it("is reported once, just past row 0, in its own column and colour", () => {
    const out = climbOut(3, 0).filter((e) => e.type === "shotOut");
    expect(out).toHaveLength(1);
    const e = out[0];
    if (e?.type !== "shotOut") throw new Error("no shotOut");
    expect(e.col).toBe(3);
    expect(e.color).toBe("red");
    expect(e.taken).toBe(false);
    expect(e.atMilli).toBeLessThan(0);
    // No further than one tick's climb past the centre of row 0.
    expect(e.atMilli).toBeGreaterThan(-1000);
  });

  it("carries the sideways offset a lock left on it", () => {
    const e = climbOut(2, 250).find((x) => x.type === "shotOut");
    expect(e?.type === "shotOut" && e.driftMilli).toBe(250);
  });
});
