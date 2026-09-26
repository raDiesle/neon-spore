import { describe, expect, it } from "bun:test";
import type { OculusStep } from "../src/oculus.js";
import { oculusStruck } from "../src/oculus-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  install,
  MID,
  oculus,
  runUntil,
  SCRIPT,
  shieldUnder,
  shot,
  toLit,
  toStep,
} from "./oculus-rig.js";

/**
 * THE OCULUS's story steps (§27): the open eye glaring down at the hull,
 * met by the shield under it, and the eye rolled aside to look down another
 * column, met by a shot up that column — each under THE SLOW, and each run
 * out a hull hit.
 */

const OPEN: OculusStep[] = [{ ask: "break", color: "either", beats: 1 }];
const GLARE: OculusStep = { ask: "glare", color: "either", beats: 3 };
const LOOK: OculusStep = { ask: "look", color: "red", beats: 3, offset: 2 };

/** The socket broken open and `step` lit after it. */
function lit(step: OculusStep) {
  return toStep(1, [...OPEN, step]);
}

describe("the glare", () => {
  it("lights under THE SLOW", () => {
    const world = lit(GLARE);
    expect(oculus(world).steps[oculus(world).cursor]?.ask).toBe("glare");
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot, only the shield under the eye", () => {
    const world = lit(GLARE);
    oculusStruck(world, shot("red"));
    expect(oculus(world).phase).toBe("lit");
    expect(oculus(world).hits).toBe(0);
    expect(shieldUnder(world)).toContain("oculusBlock");
    expect(oculus(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("left unshielded strikes the hull", () => {
    const world = lit(GLARE);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, GLARE.beats + 2);
    expect(seen.has("oculusMiss")).toBe(true);
  });
});

describe("the look", () => {
  it("wants the column it looks down, not the middle", () => {
    const world = lit(LOOK);
    oculusStruck(world, shot("red", MID));
    expect(oculus(world).phase).toBe("lit");
    oculusStruck(world, shot("red", MID + 2));
    expect(oculus(world).phase).toBe("rest");
  });

  it("wants its colour, and is not a hit on the core", () => {
    const world = lit(LOOK);
    oculusStruck(world, shot("cyan", MID + 2));
    expect(oculus(world).phase).toBe("lit");
    oculusStruck(world, shot("red", MID + 2));
    expect(world.events.some((e) => e.type === "oculusGlance" && e.col === MID + 2)).toBe(true);
    expect(oculus(world).hits).toBe(0);
  });

  it("left unanswered strikes the hull", () => {
    const world = lit(LOOK);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, LOOK.beats + 2);
    expect(seen.has("oculusMiss")).toBe(true);
  });
});

describe("the shipped script", () => {
  it("is eleven steps with both story steps, and answered through it shatters", () => {
    expect(SCRIPT.length).toBe(11);
    expect(SCRIPT.some((s) => s.ask === "glare")).toBe(true);
    expect(SCRIPT.some((s) => s.ask === "look")).toBe(true);
    const world = install();
    toLit(world);
    while (oculus(world).phase === "lit") {
      answer(world);
      runUntil(world, (w) => oculus(w).phase === "lit" || oculus(w).phase === "shatter");
    }
    expect(oculus(world).hits).toBe(3);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
