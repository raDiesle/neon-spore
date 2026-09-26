import { describe, expect, it } from "bun:test";
import { NO_SPARK } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beat,
  brace,
  CFG,
  install,
  lit,
  mantle,
  pull,
  runTo,
  story,
  tapCore,
} from "./mantle-rig.js";

/**
 * THE MANTLE fighting back (§23 rows 7 to 12, `sim/mantle-story.ts`): the
 * buckle, the vent and the crosswise crack between the shear before the last
 * pair and the brace, and the guided turn between the last shear and the core.
 *
 * What these pin: that each beat asks under THE SLOW, or shows under it; that
 * the buckle wants both thumbs down and eased, never pulling; that the vent
 * shuts to one tap from either seat; that a missed buckle or vent leaks one
 * spark and never a second; and that the turn's window resets rather than
 * strikes.
 */

/** The first of two pairs sheared: the valve is bulging. */
function toBuckle(): ReturnType<typeof install> {
  const world = install();
  lit(world);
  const t = world.tick;
  runTo(world, t + 1, [pull(t, 1, 800), pull(t, 2, 800)]);
  if (!beat(world).has("mantleBuckle")) throw new Error("the valve never buckled");
  return world;
}

/** Pressed flat: the vent is open. */
function toVent(): ReturnType<typeof install> {
  const world = toBuckle();
  const t = world.tick;
  runTo(world, t + 1, [pull(t, 1, 0), pull(t, 2, 0)]);
  if (!beat(world, CFG.mantleBuckleBeats + 1).has("mantleVent")) throw new Error("no vent");
  return world;
}

/** The last pair split: the halves are swinging. */
function toTurn(): ReturnType<typeof install> {
  const world = toBuckle();
  story(world);
  brace(world);
  const t = world.tick;
  runTo(world, t + 1, [pull(t, 1, 1200), pull(t, 2, 1200)]);
  if (!beat(world).has("mantleTurn")) throw new Error("the halves never swung");
  return world;
}

describe("the buckle", () => {
  it("comes on the shear before the last pair, under THE SLOW, asking", () => {
    const world = toBuckle();
    expect(mantle(world).phase).toBe("buckle");
    expect(slowing(world)).toBe(true);
    expect(world.slowAsks).toBe(true);
  });

  it("lies flat under both thumbs eased, and opens the vent without a leak", () => {
    const world = toBuckle();
    const t = world.tick;
    const seen = runTo(world, t + 1, [pull(t, 1, 0), pull(t, 2, 0)]);
    for (const e of beat(world, CFG.mantleBuckleBeats + 1)) seen.add(e);
    expect(seen.has("mantleFlat")).toBe(true);
    expect(seen.has("mantleLeak")).toBe(false);
    expect(mantle(world).phase).toBe("vent");
  });

  it("is not pressed by pulling, and tears into one spark when its window runs out", () => {
    const world = toBuckle();
    const t = world.tick;
    const seen = runTo(world, t + 1, [pull(t, 1, 1200), pull(t, 2, 1200)]);
    for (const e of beat(world, CFG.mantleBuckleWindowBeats + 1)) seen.add(e);
    expect(seen.has("mantleFlat")).toBe(false);
    expect(seen.has("mantleLeak")).toBe(true);
    expect(mantle(world).phase).toBe("vent");
    expect(mantle(world).sparkCol).not.toBe(NO_SPARK);
  });
});

describe("the vent", () => {
  it.each([1, 2] as const)("shuts to one tap from player %i, and leaks nothing", (player) => {
    const world = toVent();
    const t = world.tick;
    const seen = runTo(world, t + 1, [tapCore(t, player)]);
    expect(seen.has("mantleSeal")).toBe(true);
    expect(mantle(world).phase).toBe("cross");
    expect(mantle(world).sparkCol).toBe(NO_SPARK);
  });

  it("left open for its beats, feeds a spark and moves on", () => {
    const world = toVent();
    const seen = beat(world, CFG.mantleVentBeats + 1);
    expect(seen.has("mantleLeak")).toBe(true);
    expect(seen.has("mantleCross")).toBe(true);
    expect(mantle(world).phase).not.toBe("vent");
  });

  it("feeds no second spark while one is already leaking", () => {
    const world = toBuckle();
    world.cfg.mantleSparkBeats = 99; // the torn buckle's spark, kept leaking
    beat(world, CFG.mantleBuckleWindowBeats + 1);
    const col = mantle(world).sparkCol;
    const seen = beat(world, CFG.mantleVentBeats + 1);
    expect(seen.has("mantleLeak")).toBe(false);
    expect(mantle(world).sparkCol).toBe(col);
  });
});

describe("the crosswise crack", () => {
  it("shows under THE SLOW, asking nothing, and then the seam glows", () => {
    const world = toVent();
    const t = world.tick;
    runTo(world, t + 1, [tapCore(t, 1)]);
    expect(world.slowAsks).toBe(false);
    expect(slowing(world)).toBe(true);
    const seen = beat(world, CFG.mantleCrossBeats + 1);
    expect(seen.has("mantleGlow")).toBe(true);
    expect(mantle(world).phase).toBe("brace");
  });
});

describe("the turn", () => {
  it("swings the halves after the last shear, under THE SLOW, asking", () => {
    const world = toTurn();
    expect(mantle(world).phase).toBe("turn");
    expect(world.slowAsks).toBe(true);
  });

  it("opens to both handles past the floor, and bares the core", () => {
    const world = toTurn();
    const t = world.tick;
    const seen = runTo(world, t + 1, [pull(t, 1, 1200), pull(t, 2, 1200)]);
    for (const e of beat(world)) seen.add(e);
    expect(seen.has("mantleTurned")).toBe(true);
    expect(mantle(world).phase).toBe("heartbeat");
  });

  it("opens to nothing one-handed, and its window run out swings back rather than strikes", () => {
    const world = toTurn();
    const t = world.tick;
    const seen = runTo(world, t + 1, [pull(t, 1, 2000)]);
    for (const e of beat(world, CFG.mantleTurnBeats + 1)) seen.add(e);
    expect(seen.has("mantleTurned")).toBe(false);
    expect(seen.has("mantleSwing")).toBe(true);
    expect(mantle(world).phase).toBe("turn");
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
