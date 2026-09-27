import { describe, expect, it } from "bun:test";
import { burgeeStruck } from "../src/burgee-shot.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import { beats, burgee, MID, runUntil, shot, toLit } from "./burgee-rig.js";
import { answer, catchLit, toStep } from "./burgee-rig-steps.js";

/**
 * THE BURGEE, the spindle: two catches light it and hold the flag, a fire
 * step wants its colour into it, and a recatch keeps it lit.
 *
 * What these pin: that the flag stops swinging once the spindle is lit and
 * swings again under a recatch; that a shot needs the colour and the middle
 * column; that either seat may freeze a recatch; that a recatch run out dims
 * the spindle; that a shot run out is the wave; and that the whole script
 * swings the flag spent and out.
 */

describe("the spindle", () => {
  it("lights on the second catch and holds the flag still", () => {
    const world = toStep(1);
    expect(catchLit(world).has("burgeeSpindle")).toBe(true);
    toLit(world);
    const at = burgee(world).swingMilli;
    beats(world, 2);
    expect(burgee(world).swingMilli).toBe(at);
  });

  it("takes only the lit colour, in the middle column", () => {
    const world = toStep(2);
    burgeeStruck(world, shot("cyan"));
    burgeeStruck(world, shot("red", MID + 1));
    expect(burgee(world).hits).toBe(0);
    expect(burgee(world).phase).toBe("lit");
    burgeeStruck(world, shot("red"));
    expect(burgee(world).hits).toBe(1);
    expect(burgee(world).cursor).toBe(3);
  });

  it("run out unshot is the hull, and the wave", () => {
    const world = toStep(2);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("burgeeMiss")).toBe(true);
  });
});

describe("the recatch", () => {
  it("swings the flag again", () => {
    const world = toStep(3);
    const at = burgee(world).swingMilli;
    beats(world, 1);
    expect(burgee(world).swingMilli).not.toBe(at);
  });

  it("is caught with either seat freezing it", () => {
    for (const freezer of [1, 2] as const) {
      const world = toStep(3);
      expect(catchLit(world, freezer).has("burgeeRecatch")).toBe(true);
      expect(burgee(world).spindleLit).toBe(true);
      expect(burgee(world).cursor).toBe(4);
    }
  });

  it("run out dims the spindle, and the step is tried again", () => {
    const world = toStep(3);
    const seen = runUntil(world, (w) => burgee(w).phase === "rest");
    expect(seen.has("burgeeDim")).toBe(true);
    expect(burgee(world).spindleLit).toBe(false);
    toLit(world);
    expect(burgee(world).cursor).toBe(3);
    catchLit(world);
    expect(burgee(world).spindleLit).toBe(true);
  });
});

describe("the whole script", () => {
  it("swings the flag spent, and out", () => {
    const world = toStep(6);
    const seen = answer(world);
    for (const t of runUntil(world, (w) => w.boss === null)) seen.add(t);
    expect(seen.has("burgeeSpent")).toBe(true);
    expect(seen.has("burgeeOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
