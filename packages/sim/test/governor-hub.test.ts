import { describe, expect, it } from "bun:test";
import { governorFiring } from "../src/governor.js";
import { governorFlightTicks, governorFlownTicks, governorStruck } from "../src/governor-shot.js";
import { hashWorld } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  beats,
  CFG,
  governor,
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
 * THE GOVERNOR, the hub: the taps before the first shot light it, and it is
 * shot in the step's colour as the needle points down at the cannon, each
 * shot after the first earned back by a retap. The needle and the taps:
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

  it("takes a bolt only if it left with the needle pointing down", () => {
    const world = toStep(2);
    toDown(world);
    // Eighty ticks on, a bolt met now left a third of a lap past the bottom.
    for (let i = 0; i < 80; i += 1) tick(world);
    governorStruck(world, shot("red"));
    expect(governor(world).hits).toBe(0);
    toDown(world);
    governorStruck(world, shot("red"));
    expect(governor(world).hits).toBe(1);
  });

  it("counts a bolt's flight from the muzzle, up to where the hub meets it", () => {
    const flight = governorFlightTicks(CFG);
    const at = (row: number) => governorFlownTicks(CFG, { ...shot("red"), row });
    expect(at(CFG.rows - 2)).toBe(0);
    expect(at(8)).toBeGreaterThan(0);
    expect(at(8)).toBeLessThan(flight);
    expect(at(0)).toBe(flight);
    expect(governorFlownTicks(CFG, { ...shot("red"), lance: true })).toBe(0);
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
