import { describe, expect, it } from "bun:test";
import { governorFiring } from "../src/governor.js";
import { governorStruck } from "../src/governor-shot.js";
import { hashWorld } from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  beats,
  governor,
  install,
  MID,
  runUntil,
  SCRIPT,
  shot,
  toLit,
  toStep,
} from "./governor-rig.js";

/**
 * THE GOVERNOR, the hub: three taps from each seat light it, and it is shot
 * in the step's colour, each shot after the first earned back by a retap.
 * The needle and the taps: `governor.test.ts`.
 */

describe("the hub", () => {
  it("lights on the sixth tap, three from each seat, and not before", () => {
    const world = toStep(5);
    expect(governor(world).taps).toEqual([3, 2]);
    expect(governor(world).hubLit).toBe(false);
    const seen = answer(world);
    expect(seen.has("governorHub")).toBe(true);
    expect(governor(world).hubLit).toBe(true);
  });

  it("wants the step's colour; the other is a colour missed and the step stays lit", () => {
    const world = toStep(6);
    expect(governorFiring(governor(world))).toBe(true);
    governorStruck(world, shot("cyan"));
    expect(governor(world).hits).toBe(0);
    expect(governor(world).phase).toBe("lit");
    governorStruck(world, shot("red"));
    expect(governor(world).hits).toBe(1);
  });

  it("takes a shot only in the middle column", () => {
    const world = toStep(6);
    governorStruck(world, shot("red", MID + 1));
    expect(governor(world).hits).toBe(0);
  });

  it("run out unshot is the hull, and the wave", () => {
    const world = toStep(6);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("governorMiss")).toBe(true);
  });
});

describe("the retap", () => {
  it("landed keeps the hub lit for the next shot", () => {
    const world = toStep(7);
    const seen = answer(world);
    expect(seen.has("governorRetap")).toBe(true);
    toLit(world);
    expect(governorFiring(governor(world))).toBe(true);
  });

  it("run out dims the hub, and the retap is asked again before any shot", () => {
    const world = toStep(7);
    const seen = runUntil(world, (w) => governor(w).phase !== "lit");
    expect(seen.has("governorDim")).toBe(true);
    expect(governor(world).hubLit).toBe(false);
    toLit(world);
    expect(governor(world).cursor).toBe(7);
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
