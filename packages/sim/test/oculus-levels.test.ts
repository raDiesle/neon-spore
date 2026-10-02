import { describe, expect, it } from "bun:test";
import { oculusLevelShare } from "../src/oculus-level.js";
import { oculusStruck } from "../src/oculus-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  CFG,
  holdBoth,
  LEVELS,
  leaf,
  lever,
  oculus,
  releaseBoth,
  runUntil,
  shot,
  TPB,
  tapOnce,
  ticks,
  toLit,
  toStep,
} from "./oculus-rig.js";

/**
 * THE OCULUS in three levels (the owner, 2 October 2026): a pair held shut,
 * a pair tapped shut, a pair turned shut by a lever each, every level's count
 * kept when a hand comes off, a fuse that springs it back to nought, and a
 * shot after each that waits — with no slow anywhere, since a wave goes on
 * round the lens.
 */

const TAP = 3;
const SHOT_RED = 2;
const TURN = 5;

describe("the first level, a hold", () => {
  it("shuts once both thumbs have been down its beats, however many times they let go", () => {
    const world = toStep(0, LEVELS);
    const need = (LEVELS[0]?.beats ?? 0) * TPB;
    // Three goes, each a third of it, a gap between: kept, then done.
    for (let go = 0; go < 3 && oculus(world).phase === "lit"; go++) {
      holdBoth(world);
      ticks(world, Math.ceil(need / 3));
      releaseBoth(world);
      ticks(world, TPB);
    }
    expect(oculus(world).leavesShut).toBe(2);
    expect(slowing(world)).toBe(false);
  });

  it("run out, springs open with its count back at nought, and lights again", () => {
    const world = toStep(0, LEVELS);
    holdBoth(world);
    ticks(world, TPB);
    releaseBoth(world);
    expect(oculus(world).heldTicks).toBeGreaterThan(0);
    const seen = runUntil(world, (w) => oculus(w).phase === "rest");
    expect(seen.has("oculusSpring")).toBe(true);
    expect(oculus(world).heldTicks).toBe(0);
    toLit(world);
    expect(oculus(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("a shot after a level", () => {
  it("waits for it: no fuse, no hull hit, however long", () => {
    const world = toStep(SHOT_RED, LEVELS);
    ticks(world, 60 * TPB);
    expect(oculus(world).phase).toBe("lit");
    expect(oculus(world).cursor).toBe(SHOT_RED);
    expect(world.failTick).toBe(NOT_FAILED);
    oculusStruck(world, shot("red"));
    expect(oculus(world).hits).toBe(1);
  });
});

describe("the second level, a tap", () => {
  it("counts each press, half the taps from each seat", () => {
    const world = toStep(TAP, LEVELS);
    const each = (LEVELS[TAP]?.need ?? 0) / 2;
    for (let i = 0; i < each; i++) tapOnce(world, "left");
    expect(oculus(world).taps).toEqual([each, 0]);
    expect(oculus(world).phase).toBe("lit");
    expect(oculusLevelShare(CFG, oculus(world))).toBe(0.5);
    // Taps past a seat's half are not the other seat's.
    tapOnce(world, "left");
    expect(oculusLevelShare(CFG, oculus(world))).toBe(0.5);
    for (let i = 0; i < each && oculus(world).phase === "lit"; i++) tapOnce(world, "right");
    expect(oculus(world).leavesShut).toBe(4);
  });

  it("does not count a thumb kept down", () => {
    const world = toStep(TAP, LEVELS);
    leaf(world, "left", true);
    leaf(world, "left", true);
    ticks(world, TPB);
    expect(oculus(world).taps).toEqual([1, 0]);
  });
});

describe("the third level, a turn", () => {
  it("counts only what both levers turn together, and the lever behind is the pair's", () => {
    const world = toStep(TURN, LEVELS);
    leaf(world, "left", true);
    lever(world, "left", 400);
    expect(oculus(world).turned).toEqual([0, 0]);
    leaf(world, "right", true);
    lever(world, "left", 800);
    expect(oculus(world).turned[0]).toBeGreaterThan(0);
    expect(oculusLevelShare(CFG, oculus(world))).toBe(0);
    lever(world, "right", 400);
    expect(oculusLevelShare(CFG, oculus(world))).toBeGreaterThan(0);
  });

  it("never counts the way back, nor the same arc twice", () => {
    const world = toStep(TURN, LEVELS);
    holdBoth(world);
    lever(world, "left", 500);
    const once = oculus(world).turned[0];
    lever(world, "left", 100);
    lever(world, "left", 500);
    expect(oculus(world).turned[0]).toBe(once);
  });

  it("goes past the far side of the lens as the short way round, lap after lap", () => {
    const world = toStep(TURN, LEVELS);
    holdBoth(world);
    // The thumb's reading comes back round each half lap; carried on, it keeps counting.
    const lap = Math.round((6283 * CFG.oculusLeverRadiusMilli) / 1000);
    let at = 0;
    for (let i = 0; i < 40 && oculus(world).phase === "lit"; i++) {
      at += 300;
      const read = ((at + lap / 2) % lap) - lap / 2;
      lever(world, "left", Math.round(read));
      lever(world, "right", Math.round(read));
    }
    expect(oculus(world).leavesShut).toBe(6);
  });
});

describe("the three levels", () => {
  it("answered in turn, every leaf shuts, three shots land and the lens shatters", () => {
    const world = toStep(LEVELS.length - 1, LEVELS);
    oculusStruck(world, shot("cyan"));
    expect(oculus(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("oculusShatter")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(slowing(world)).toBe(false);
  });
});
