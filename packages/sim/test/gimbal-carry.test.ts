import { describe, expect, it } from "bun:test";
import { BEARING_TURN, INNER, OUTER } from "../src/index.js";
import { CFG, carry, gimbal, grip, install, lit, runTo, TPB } from "./gimbal-harness.js";

/**
 * THE GIMBAL's carry: the inner ring is hung in the outer, so a turn of his
 * carries hers `gimbalCarryPct` of the way and a turn of hers carries nothing
 * back (`sim/gimbal-turn.ts`) — the reason the pair has an order to find.
 */
describe("the outer ring carries the inner", () => {
  it("the whole of a turn of his, at a hundred", () => {
    const world = install();
    lit(world);
    carry(world, 1, 250);
    expect(gimbal(world).atMilli).toEqual([250, 250]);
  });

  it("and none of a turn of hers", () => {
    const world = install();
    lit(world);
    carry(world, 2, BEARING_TURN - 100);
    expect(gimbal(world).atMilli).toEqual([0, 100]);
  });

  it("so a ring she had true is knocked off when he moves", () => {
    const world = install();
    lit(world);
    carry(world, 2, BEARING_TURN - 500);
    expect(gimbal(world).atMilli[INNER]).toBe(500);
    carry(world, 1, 250);
    expect(gimbal(world).atMilli[INNER]).toBe(750);
  });

  it("as far as the figure says", () => {
    const world = install(undefined, { gimbalCarryPct: 50 });
    lit(world);
    carry(world, 1, 200);
    expect(gimbal(world).atMilli).toEqual([200, 100]);
  });

  it("and his ring falling home takes hers with it", () => {
    const world = install();
    lit(world);
    carry(world, 1, 250);
    const t = world.tick;
    runTo(world, t + 1, [grip(t, 1, 0, false)]);
    runTo(world, world.tick + TPB);
    const s = gimbal(world);
    expect(s.atMilli[OUTER]).toBe(250 - CFG.gimbalDriftMilli);
    // Hers has no hand either, so it falls home on its own after riding his.
    expect(s.atMilli[INNER]).toBe(250 - 2 * CFG.gimbalDriftMilli);
  });
});
