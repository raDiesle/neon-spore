import { describe, expect, it } from "bun:test";
import { trapezeStruck } from "../src/trapeze-shot.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import { beats, MID, runUntil, shot, toLit, trapeze } from "./trapeze-rig.js";
import { answer, catchLit, toStep } from "./trapeze-rig-steps.js";

/**
 * THE TRAPEZE, the spindle: two catches light it and hold the flag, a fire
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
    expect(catchLit(world).has("trapezeSpindle")).toBe(true);
    toLit(world);
    const at = trapeze(world).swingMilli;
    beats(world, 2);
    expect(trapeze(world).swingMilli).toBe(at);
  });

  it("takes only the lit colour, in the middle column", () => {
    const world = toStep(2);
    trapezeStruck(world, shot("cyan"));
    trapezeStruck(world, shot("red", MID + 1));
    expect(trapeze(world).hits).toBe(0);
    expect(trapeze(world).phase).toBe("lit");
    trapezeStruck(world, shot("red"));
    expect(trapeze(world).hits).toBe(1);
    expect(trapeze(world).cursor).toBe(3);
  });

  it("run out unshot is the hull, and the wave", () => {
    const world = toStep(2);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("trapezeMiss")).toBe(true);
  });
});

describe("the recatch", () => {
  it("swings the flag again", () => {
    const world = toStep(3);
    const at = trapeze(world).swingMilli;
    beats(world, 1);
    expect(trapeze(world).swingMilli).not.toBe(at);
  });

  it("is caught with either seat freezing it", () => {
    for (const freezer of [1, 2] as const) {
      const world = toStep(3);
      expect(catchLit(world, freezer).has("trapezeRecatch")).toBe(true);
      expect(trapeze(world).spindleLit).toBe(true);
      expect(trapeze(world).cursor).toBe(4);
    }
  });

  it("run out dims the spindle, and the step is tried again", () => {
    const world = toStep(3);
    const seen = runUntil(world, (w) => trapeze(w).phase === "rest");
    expect(seen.has("trapezeDim")).toBe(true);
    expect(trapeze(world).spindleLit).toBe(false);
    toLit(world);
    expect(trapeze(world).cursor).toBe(3);
    catchLit(world);
    expect(trapeze(world).spindleLit).toBe(true);
  });
});

describe("the whole script", () => {
  it("swings the flag spent, and out", () => {
    const world = toStep(6);
    const seen = answer(world);
    for (const t of runUntil(world, (w) => w.boss === null)) seen.add(t);
    expect(seen.has("trapezeSpent")).toBe(true);
    expect(seen.has("trapezeOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
