import { describe, expect, it } from "bun:test";
import { hashWorld } from "../src/index.js";
import { keelLit, keelLoose, keelSegCol, NO_ROCK } from "../src/keel.js";
import { keelStruck } from "../src/keel-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  CFG,
  COLS,
  install,
  isLit,
  keel,
  runUntil,
  shot,
  toRock,
  toTempo,
} from "./keel-rig.js";

/**
 * THE KEEL's last movement: the fast run in the wave's own order, a miss that
 * works a segment loose, the tail's rock, and the fingerprint
 * (`keel.test.ts` has the first two movements).
 */

describe("movement three", () => {
  it("runs the wave's own order at tempo, with no SLOW", () => {
    const world = install();
    toTempo(world);
    expect(keelLoose(keel(world))).toBe(0);
    const order: number[] = [];
    for (let i = 0; i < 3; i++) {
      runUntil(world, isLit);
      expect(slowing(world)).toBe(false);
      order.push(keel(world).joint);
      answer(world);
    }
    expect(order).toEqual([4, 3, 0]);
    const seen = runUntil(world, (w) => keel(w).phase === "rock");
    expect(seen.has("keelRigid")).toBe(true);
    expect(keel(world).rockCol).toBe(keelSegCol(CFG.keelSegments - 1, CFG.keelSegments, COLS));
  });

  it("works a missed joint loose, and lights it again once the order is spent", () => {
    const world = install();
    toTempo(world);
    runUntil(world, isLit);
    const seen = runUntil(world, (w) => !keelLit(keel(w)), CFG.keelTempoBeats + 2);
    expect(seen.has("keelSlip")).toBe(true);
    expect(keel(world).locked[4]).toBe(false);
    const order: number[] = [];
    for (let i = 0; i < 3; i++) {
      runUntil(world, isLit);
      order.push(keel(world).joint);
      answer(world);
    }
    expect(order).toEqual([3, 0, 4]);
  });
});

describe("the tail's rock", () => {
  it("is shot out in either colour, and the spine lies straight and goes", () => {
    const world = install("red");
    toRock(world);
    keelStruck(world, shot(keel(world).rockCol, "cyan"));
    expect(keel(world).rockCol).toBe(NO_ROCK);
    const seen = runUntil(world, (w) => w.boss === null, CFG.keelOpenBeats + 3);
    expect(seen.has("keelStraight")).toBe(true);
    expect(seen.has("keelOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("left in the air reaches the hull", () => {
    const world = install();
    toRock(world);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, CFG.keelRockBeats + 2);
    expect(seen.has("keelRockHit")).toBe(true);
  });
});

describe("the fingerprint", () => {
  const run = (reprise: readonly number[]): number => {
    const world = install("red", reprise);
    runUntil(world, isLit);
    answer(world);
    runUntil(world, isLit);
    return hashWorld(world);
  };

  it("is the same for two runs given the same thumbs", () => {
    expect(run([4, 3, 0])).toBe(run([4, 3, 0]));
  });

  it("and differs when the wave authored a different order", () => {
    expect(run([4, 3, 0])).not.toBe(run([4, 3, 1]));
  });
});
