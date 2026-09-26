import { describe, expect, it } from "bun:test";
import { mantlePairsLeft } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import { beat, brace, CFG, install, lit, mantle, pull, runTo } from "./mantle-rig.js";

/**
 * THE MANTLE's brace (§23 rows 7 and 8): before the last pair the seam glows
 * and the shell shudders, and the pair hold both handles still for
 * `mantleBraceBeats` before the last pull lights with a window of its own.
 *
 * What these pin: that the glow comes on the shear before the last pair and
 * asks under THE SLOW; that the hold needs both thumbs, and either lifting
 * starts it over; that no pull counts while bracing; and that the last pull's
 * window run out resets rather than strikes.
 */

/** The first of two pairs sheared: the shell is glowing. */
function toGlow(): ReturnType<typeof install> {
  const world = install();
  lit(world);
  const t = world.tick;
  runTo(world, t + 1, [pull(t, 1, 800), pull(t, 2, 800)]);
  const seen = beat(world);
  if (!seen.has("mantleGlow")) throw new Error("the shell never glowed");
  return world;
}

describe("the glow", () => {
  it("comes on the shear before the last pair, under THE SLOW, asking", () => {
    const world = toGlow();
    expect(mantle(world).phase).toBe("brace");
    expect(mantlePairsLeft(mantle(world))).toBe(1);
    expect(slowing(world)).toBe(true);
    expect(world.slowAsks).toBe(true);
  });

  it("is not asked of a shell with one pair only", () => {
    const world = install([1400]);
    lit(world);
    const t = world.tick;
    const seen = runTo(world, t + 1, [pull(t, 1, 800), pull(t, 2, 800)]);
    for (const e of beat(world)) seen.add(e);
    expect(seen.has("mantleGlow")).toBe(false);
    expect(mantle(world).phase).toBe("heartbeat");
  });
});

describe("the brace", () => {
  it("held by both thumbs for its beats, steadies and lights the last pull", () => {
    const world = toGlow();
    const seen = brace(world);
    expect(seen.has("mantleSteady")).toBe(true);
    expect(seen.has("mantleLight")).toBe(true);
    expect(mantle(world).phase).toBe("pull");
    expect(mantle(world).depthMilli).toEqual([0, 0]);
  });

  it("counts nothing with one thumb down", () => {
    const world = toGlow();
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 2, 0, false)]);
    beat(world, CFG.mantleBraceBeats + 2);
    expect(mantle(world).phase).toBe("brace");
    expect(mantle(world).braceBeats).toBe(0);
  });

  it("slips when either hand lifts, and starts over from the glow", () => {
    const world = toGlow();
    beat(world, CFG.mantleBraceBeats - 1);
    expect(mantle(world).braceBeats).toBeGreaterThan(0);
    const t = world.tick;
    const seen = runTo(world, t + 1, [pull(t, 1, 0, false)]);
    expect(seen.has("mantleSlip")).toBe(true);
    expect(mantle(world).braceBeats).toBe(0);
    expect(mantle(world).phase).toBe("brace");
    expect(slowing(world)).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("shears nothing, however hard both pull", () => {
    const world = toGlow();
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 0, false), pull(t, 2, 0, false)]);
    const t2 = world.tick;
    runTo(world, t2 + 1, [pull(t2, 1, 2000)]);
    expect(mantle(world).depthMilli).toEqual([0, 0]);
    expect(mantle(world).cursor).toBe(1);
  });
});

describe("the last pull", () => {
  it("asks under THE SLOW, and its window run out resets rather than strikes", () => {
    const world = toGlow();
    brace(world);
    expect(slowing(world)).toBe(true);
    const seen = beat(world, CFG.mantleLastBeats + 1);
    expect(seen.has("mantleLapse")).toBe(true);
    expect(mantle(world).phase).toBe("pull");
    expect(mantle(world).cursor).toBe(1);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("pulled together in its window, splits the shell", () => {
    const world = toGlow();
    brace(world);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 1200), pull(t, 2, 1200)]);
    expect(beat(world).has("mantleSplit")).toBe(true);
    expect(mantle(world).phase).toBe("heartbeat");
  });
});
