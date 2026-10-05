import { describe, expect, it } from "bun:test";
import { flueEmberAlong } from "../src/flue.js";
import { hashWorld, slowRateMilli } from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  CFG,
  flue,
  install,
  LEVELS,
  MID,
  runUntil,
  shoot,
  TPB,
  tick,
  toLevel,
  toLit,
} from "./flue-rig.js";

/**
 * THE FLUE, the ember and the levels: it runs end to end and back on its
 * own, from the left end at every level; the cannon is held under the
 * middle; each level plays THE SLOW at its own strength; and the whole run of
 * levels ends spent and out.
 */

describe("the ember", () => {
  it("runs from the left end to the right and back, at the level's speed", () => {
    const span = CFG.flueSpanMilli;
    expect(flueEmberAlong(CFG, 2000, 0)).toEqual({ milli: -span, dir: 1 });
    // Two columns a beat: the middle after two and a quarter beats.
    expect(flueEmberAlong(CFG, 2000, (TPB * 9) / 4).milli).toBe(0);
    expect(flueEmberAlong(CFG, 2000, (TPB * 9) / 2)).toEqual({ milli: span, dir: -1 });
    expect(flueEmberAlong(CFG, 2000, TPB * 9)).toEqual({ milli: -span, dir: 1 });
  });

  it("runs only while a level is lit, and starts every level at the left end", () => {
    const world = install();
    expect(flue(world).emberMilli).toBe(-CFG.flueSpanMilli);
    tick(world);
    expect(flue(world).emberMilli).toBe(-CFG.flueSpanMilli);
    toLit(world);
    runUntil(world, (w) => flue(w).emberMilli > 0);
    shoot(world);
    expect(flue(world).phase).toBe("rest");
    expect(flue(world).emberMilli).toBe(-CFG.flueSpanMilli);
  });
});

describe("the cannon", () => {
  it("is held under the middle column: a slide is refused", () => {
    const world = install();
    toLit(world);
    tick(world, [{ player: 1, command: { kind: "cannonCol", col: 1 } }]);
    expect(world.cannonCol).toBe(MID);
  });
});

describe("THE SLOW", () => {
  it("plays each level at its own strength, and not at all on a level that asks none", () => {
    const fast = toLevel(0);
    expect(slowRateMilli(fast)).toBe(1000);
    const half = toLevel(2);
    tick(half);
    expect(slowRateMilli(half)).toBe(500);
    const quarter = toLevel(4);
    tick(quarter);
    expect(slowRateMilli(quarter)).toBe(250);
    expect(quarter.slowAsks).toBe(false);
  });

  it("lets go the instant the level is cleared", () => {
    const world = toLevel(2);
    shoot(world);
    expect(slowRateMilli(world)).toBe(1000);
  });
});

describe("the whole fight", () => {
  it("every level cleared, ends spent and then out", () => {
    const world = toLevel(0);
    const seen = new Set<string>();
    for (let n = 0; n < LEVELS.length; n += 1) {
      for (const e of shoot(world)) seen.add(e);
      expect(flue(world).hits).toBe(n + 1);
      if (n < LEVELS.length - 1) toLit(world);
    }
    for (const e of runUntil(world, (w) => w.boss === null)) seen.add(e);
    expect(seen.has("flueSpent")).toBe(true);
    expect(seen.has("flueOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("plays the same twice from the same seed", () => {
    const a = toLevel(1);
    const b = toLevel(1);
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
