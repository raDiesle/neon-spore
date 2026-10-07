import { describe, expect, it } from "bun:test";
import { governorFiring } from "../src/governor.js";
import { governorFlightTicks, governorStruck, governorTicksToTip } from "../src/governor-shot.js";
import { hashWorld } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  beats,
  CFG,
  governor,
  governorTicksDown,
  install,
  MID,
  runUntil,
  SCRIPT,
  shot,
  tick,
  toDown,
  toLit,
  toStep,
} from "./governor-rig.js";

/**
 * THE GOVERNOR, the shot: the taps before the first shot light the hub, and
 * the needle's tip is shot in the step's colour as it passes the gap at the
 * bottom of the rim, each shot after the first earned back by a retap. The needle and the taps:
 * `governor.test.ts`.
 */

describe("the hub", () => {
  it("lights with the last mark before the first shot, and not before", () => {
    const world = toStep(1);
    expect(governor(world).taps).toEqual([1, 1]);
    expect(governor(world).hubLit).toBe(false);
    const seen = answer(world);
    expect(seen.has("governorHub")).toBe(true);
    expect(governor(world).hubLit).toBe(true);
  });

  it("is shot under THE SLOW", () => {
    const world = toStep(2);
    expect(governorFiring(governor(world))).toBe(true);
    expect(slowing(world)).toBe(true);
  });

  it("wants the step's colour; the other is a colour missed and the step stays lit", () => {
    const world = toStep(2);
    toDown(world);
    governorStruck(world, shot("cyan"));
    expect(governor(world).hits).toBe(0);
    expect(governor(world).phase).toBe("lit");
    governorStruck(world, shot("red"));
    expect(governor(world).hits).toBe(1);
  });

  it("takes a bolt only if the tip is in the gap as the bolt meets it", () => {
    const world = toStep(2);
    toDown(world);
    // Forty ticks on, the tip has run out of the gap.
    for (let i = 0; i < 40; i += 1) tick(world);
    governorStruck(world, shot("red"));
    expect(governor(world).hits).toBe(0);
    toDown(world);
    governorStruck(world, shot("red"));
    expect(governor(world).hits).toBe(1);
  });

  it("counts the ticks a bolt has left to climb to the tip", () => {
    const flight = governorFlightTicks(CFG);
    const at = (row: number) => governorTicksToTip(CFG, { ...shot("red"), row });
    expect(at(CFG.rows - 2)).toBe(flight);
    expect(at(12)).toBeGreaterThan(0);
    expect(at(12)).toBeLessThan(flight);
    expect(at(0)).toBe(0);
    expect(governorTicksToTip(CFG, { ...shot("red"), lance: true })).toBe(0);
  });

  it("fired as the tip comes to the gap, meets it there", () => {
    const world = toStep(2);
    const flight = governorFlightTicks(CFG);
    const pace = SCRIPT[2]?.paceMilli ?? 0;
    // The tip will be in the middle of the gap as a bolt fired now arrives.
    runUntil(world, (w) => governorTicksDown(w, flight * pace));
    expect(governor(world).needleMilli).not.toBe(500);
    for (let i = 0; i < flight; i += 1) tick(world);
    governorStruck(world, shot("red"));
    expect(governor(world).hits).toBe(1);
  });

  it("takes a shot only in the middle column", () => {
    const world = toStep(2);
    toDown(world);
    governorStruck(world, shot("red", MID + 1));
    expect(governor(world).hits).toBe(0);
  });

  it("run out unshot is the hull, and the wave", () => {
    const world = toStep(2);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("governorMiss")).toBe(true);
  });
});

describe("the retap", () => {
  it("landed keeps the hub lit for the next shot", () => {
    const world = toStep(3);
    const seen = answer(world);
    expect(seen.has("governorRetap")).toBe(true);
    toLit(world);
    expect(governorFiring(governor(world))).toBe(true);
  });

  it("run out dims the hub, and the retap is asked again before any shot", () => {
    const world = toStep(3);
    const seen = runUntil(world, (w) => governor(w).phase !== "lit");
    expect(seen.has("governorDim")).toBe(true);
    expect(governor(world).hubLit).toBe(false);
    toLit(world);
    expect(governor(world).cursor).toBe(3);
    answer(world);
    expect(governor(world).hubLit).toBe(true);
  });
});

describe("the whole fight", () => {
  it("answered step by step is spent, then gone, and the wave stands", () => {
    const world = toStep(0);
    const seen = new Set<string>();
    for (let n = 0; n < SCRIPT.length; n += 1) {
      for (const e of answer(world)) seen.add(e);
      if (n < SCRIPT.length - 1) toLit(world);
    }
    for (const e of runUntil(world, (w) => w.boss === null)) seen.add(e);
    expect(seen.has("governorSpent")).toBe(true);
    expect(seen.has("governorOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("plays the same twice from the same seed", () => {
    const a = install();
    const b = install();
    for (const w of [a, b]) {
      toLit(w);
      answer(w);
      beats(w, 2);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
