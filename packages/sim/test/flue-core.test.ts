import { describe, expect, it } from "bun:test";
import { flueStruck } from "../src/flue-shot.js";
import { hashWorld } from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  beats,
  flue,
  install,
  MID,
  runUntil,
  SCRIPT,
  shot,
  stir,
  toLit,
  toSteady,
  toStep,
} from "./flue-rig.js";

/**
 * THE FLUE, the core: two vents with the seats swapped bare it, a fire step
 * wants its colour into it, and a damper wants both hands off.
 *
 * What these pin: that the second vent is the first seat's to keep still;
 * that the core bares on the second vent and not the first; that a shot
 * needs the colour and the middle column; that a damper held keeps the core
 * bared and a damper run out shuts it until held; that a shot run out is the
 * wave; and that the whole script ends spent and then out.
 */

describe("the second vent", () => {
  it("swaps the seats: the first keeps still, the second taps", () => {
    const world = toStep(1);
    toSteady(world);
    expect(stir(world, 1)).toContain("flueStir");
  });

  it("bares the core when it is spent", () => {
    const world = toStep(1);
    expect(flue(world).bared).toBe(false);
    expect(answer(world).has("flueBare")).toBe(true);
    expect(flue(world).vents).toBe(2);
    expect(flue(world).bared).toBe(true);
  });
});

describe("the shot", () => {
  it("takes only the lit colour, in the middle column", () => {
    const world = toStep(2);
    flueStruck(world, shot("cyan"));
    flueStruck(world, shot("red", MID + 1));
    expect(flue(world).hits).toBe(0);
    expect(flue(world).phase).toBe("lit");
    flueStruck(world, shot("red"));
    expect(flue(world).hits).toBe(1);
    expect(flue(world).cursor).toBe(3);
  });

  it("does nothing while no fire step is lit", () => {
    const world = toStep(0);
    flueStruck(world, shot("red"));
    expect(flue(world).hits).toBe(0);
  });

  it("run out unshot is the hull, and the wave", () => {
    const world = toStep(2);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("flueMiss")).toBe(true);
  });
});

describe("the damper", () => {
  it("is held when both seats keep still to the threshold", () => {
    const world = toStep(3);
    const seen = runUntil(world, (w) => flue(w).phase !== "lit");
    expect(seen.has("flueHeld")).toBe(true);
    expect(flue(world).bared).toBe(true);
    expect(flue(world).cursor).toBe(4);
  });

  it("is not held while either seat keeps moving", () => {
    for (const seat of [1, 2] as const) {
      const world = toStep(3);
      const seen = new Set<string>();
      while (flue(world).phase === "lit") for (const e of stir(world, seat)) seen.add(e);
      expect(seen.has("flueHeld")).toBe(false);
      expect(seen.has("flueShut")).toBe(true);
      expect(flue(world).bared).toBe(false);
      expect(flue(world).cursor).toBe(3);
    }
  });

  it("shut, lights again and is held the second time", () => {
    const world = toStep(3);
    while (flue(world).phase === "lit") stir(world, 1);
    toLit(world);
    expect(flue(world).cursor).toBe(3);
    runUntil(world, (w) => flue(w).phase !== "lit");
    expect(flue(world).bared).toBe(true);
    expect(flue(world).cursor).toBe(4);
  });
});

describe("the whole script", () => {
  it("answered step by step, ends spent and then out", () => {
    const world = toStep(0);
    const seen = new Set<string>();
    for (let n = 0; n < SCRIPT.length; n += 1) {
      for (const e of answer(world)) seen.add(e);
      if (n < SCRIPT.length - 1) toLit(world);
    }
    for (const e of runUntil(world, (w) => w.boss === null)) seen.add(e);
    expect(seen.has("flueSpent")).toBe(true);
    expect(seen.has("flueOut")).toBe(true);
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
