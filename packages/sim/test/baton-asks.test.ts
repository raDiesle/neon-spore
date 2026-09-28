import { describe, expect, it } from "bun:test";
import { batonDrawAsks, batonMergeSocket, batonStripAsks, step } from "../src/index.js";
import { acts, arm, CFG, merging, open, QUIET, swelling, thumb } from "./baton-fixture.js";

/**
 * **Which ring on THE BATON's arm asks a seat for a thumb** (`src/baton-hand.ts`
 * `batonStripAsks`, `batonDrawAsks`) — what `render/baton-marks.ts` haloes, read
 * off the simulation rather than re-derived there.
 */

describe("THE BATON's strip asks", () => {
  it("the locked seat alone, and stops asking while its thumb is down", () => {
    const world = open();
    const socket = swelling(world);
    acts(world, 2);
    const b = arm(world);
    expect(batonStripAsks(b, 2, world.beat)).toBe(true);
    expect(batonStripAsks(b, 1, world.beat)).toBe(false);
    step(world, [thumb(world, 2, socket, true)]);
    expect(CFG.batonSwellStrips).toBeGreaterThan(1);
    expect(batonStripAsks(b, 2, world.beat)).toBe(false);
    step(world, [thumb(world, 2, socket, false)]);
    expect(batonStripAsks(b, 2, world.beat)).toBe(true);
  });

  it("nobody while no shell is coming away", () => {
    const world = open();
    swelling(world);
    acts(world, 2);
    const b = arm(world);
    b.swellSocket = -1;
    expect(batonStripAsks(b, 2, world.beat)).toBe(false);
  });
});

describe("THE BATON's draw asks", () => {
  it("each seat for its own bead until that thumb is down, and only under merging", () => {
    const world = open(QUIET);
    const b = arm(world);
    expect(batonDrawAsks(b, 1)).toBe(false);
    merging(world);
    expect(batonDrawAsks(b, 1)).toBe(true);
    expect(batonDrawAsks(b, 2)).toBe(true);
    step(world, [thumb(world, 1, batonMergeSocket(CFG, 1), true)]);
    expect(batonDrawAsks(b, 1)).toBe(false);
    expect(batonDrawAsks(b, 2)).toBe(true);
  });
});
