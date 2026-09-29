import { describe, expect, it } from "bun:test";
import { PLUMB_SETTLES_PER_WEIGHT } from "../src/plumb.js";
import { plumbStruck } from "../src/plumb-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  balance,
  beats,
  CFG,
  install,
  plumb,
  pull,
  runUntil,
  SCRIPT,
  shot,
  toLit,
  toStep,
} from "./plumb-rig.js";

/**
 * THE PLUMB: each seat pulling its own stone, the bob skewed further than one
 * pull can bring back, so it hangs true only while the two pulls together
 * cancel the skew — inside as narrow a range as a step asks, for as many
 * beats as it asks — then the ordinary shot into the core the two true
 * weights light.
 *
 * What these pin is the gate a thumb cannot show: that the sum only counts
 * inside the step's range, that one seat alone cannot reach it, that drifting
 * out starts the count again, that a thumb let go is a pull of nought, that
 * the wrong seat's pull is not heard, that a level run out is tried again
 * rather than lost, that a shot outside its step or in the wrong colour does
 * nothing, and that a shot run out is the wave.
 */

describe("THE PLUMB comes in", () => {
  it("still, both weights loose, the core dark, neither stone pulled", () => {
    const world = install();
    const s = plumb(world);
    expect(s.phase).toBe("still");
    expect(s.weights).toEqual([0, 0]);
    expect(s.coreLit).toBe(false);
    expect(s.pullMilli).toEqual([0, 0]);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "plumbEnter")).toBe(true);
  });

  it("lights the first level after it settles, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("plumbLight")).toBe(true);
    expect(world.beat).toBe(CFG.plumbStillBeats);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the core is dark", () => {
    const world = install();
    toLit(world);
    plumbStruck(world, shot("red"));
    expect(plumb(world).hits).toBe(0);
    expect(plumb(world).phase).toBe("lit");
  });
});

describe("a one-weight level", () => {
  // The first step: skewed 3000 left, true within 600 — the pulls must sum
  // to between 2400 and 3600 to the right.
  it("counts the beats the pulls hold the bob true, and settles the weight at the step's count", () => {
    const world = install();
    toLit(world);
    pull(world, "left", 1500);
    pull(world, "right", 1200);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(2);
    expect(plumb(world).phase).toBe("lit");
    const seen = runUntil(world, (w) => plumb(w).phase === "rest");
    expect(seen.has("plumbSettle")).toBe(true);
    expect(plumb(world).weights).toEqual([1, 0]);
    expect(plumb(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("counts a sum at either edge of the range the same", () => {
    for (const [left, right] of [
      [1200, 1200],
      [1800, 1800],
    ] as const) {
      const world = install();
      toLit(world);
      pull(world, "left", left);
      pull(world, "right", right);
      beats(world, 2);
      expect(plumb(world).heldBeats).toBe(2);
    }
  });

  it("counts nothing for a sum outside the step's range", () => {
    const world = install();
    toLit(world);
    pull(world, "left", 1200);
    pull(world, "right", 1199);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("counts nothing for one seat alone, pulled as far as a pull goes", () => {
    const world = install();
    toLit(world);
    pull(world, "left", 20_000);
    expect(plumb(world).pullMilli[0]).toBe(CFG.plumbPullReachMilli);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("counts nothing for pulls the wrong way", () => {
    const world = install();
    toLit(world);
    pull(world, "left", -1300);
    pull(world, "right", -1300);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("the second step skews the other way, and wants the pulls turned round", () => {
    const world = toStep(1);
    pull(world, "left", 1300);
    pull(world, "right", 1300);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(0);
    pull(world, "left", -1400);
    pull(world, "right", -1400);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(2);
  });

  it("starts again from nought when a pull takes the bob off true", () => {
    const world = install();
    toLit(world);
    balance(world);
    beats(world, 2);
    const types = pull(world, "right", 0);
    expect(types).toContain("plumbDrift");
    expect(plumb(world).heldBeats).toBe(0);
    expect(plumb(world).phase).toBe("lit");
  });

  it("starts again from nought when a thumb lets go, which is a pull of nought", () => {
    const world = install();
    toLit(world);
    balance(world);
    beats(world, 2);
    const types = pull(world, "left", 1300, false);
    expect(types).toContain("plumbDrift");
    expect(plumb(world).pullMilli[0]).toBe(0);
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("does not drift for pulls that move and keep the sum in range", () => {
    const world = install();
    toLit(world);
    balance(world);
    beats(world, 2);
    const types = pull(world, "left", 1900);
    expect(types).not.toContain("plumbDrift");
    expect(plumb(world).heldBeats).toBe(2);
  });

  it("does not hear the wrong seat's pull", () => {
    const world = install();
    toLit(world);
    pull(world, "left", 1300, true, 2);
    pull(world, "right", 1300, true, 1);
    expect(plumb(world).pullMilli).toEqual([0, 0]);
  });

  it("run out, swings the weight loose and lights the same step again", () => {
    const world = install();
    toLit(world);
    const seen = runUntil(world, (w) => plumb(w).phase === "rest");
    expect(seen.has("plumbSwing")).toBe(true);
    expect(plumb(world).cursor).toBe(0);
    expect(plumb(world).weights).toEqual([0, 0]);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(plumb(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("counts pulls already on when the step lights from its first beat", () => {
    const world = install();
    pull(world, "left", 1500);
    pull(world, "right", 1500);
    toLit(world);
    beats(world, 1);
    expect(plumb(world).heldBeats).toBe(1);
  });
});

describe("the script", () => {
  it("skews every level step past one seat's reach and inside two", () => {
    const reach = CFG.plumbPullReachMilli;
    for (const step of SCRIPT) {
      if (step.ask === "fire") continue;
      expect(Math.abs(step.skewMilli) - step.rangeMilli).toBeGreaterThan(reach);
      expect(Math.abs(step.skewMilli) + step.rangeMilli).toBeLessThanOrEqual(2 * reach);
    }
  });
});

describe("the core", () => {
  it("lights with the fourth settle, two a weight", () => {
    const world = toStep(3);
    expect(plumb(world).coreLit).toBe(false);
    balance(world);
    const seen = runUntil(world, (w) => plumb(w).phase === "rest");
    expect(seen.has("plumbCore")).toBe(true);
    expect(plumb(world).weights).toEqual([PLUMB_SETTLES_PER_WEIGHT, PLUMB_SETTLES_PER_WEIGHT]);
    expect(plumb(world).coreLit).toBe(true);
  });
});

describe("a fire step", () => {
  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(4);
    const misses = world.balance.colorMisses;
    plumbStruck(world, shot("cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(plumb(world).phase).toBe("lit");
    expect(plumb(world).hits).toBe(0);
  });

  it("wants the middle column", () => {
    const world = toStep(4);
    plumbStruck(world, shot("red", CFG.cols - 1));
    expect(plumb(world).phase).toBe("lit");
  });

  it("shot in its colour is a hit, and the bob rests", () => {
    const world = toStep(4);
    plumbStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "plumbHit")).toBe(true);
    expect(plumb(world).hits).toBe(1);
    expect(plumb(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(4);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("plumbMiss")).toBe(true);
  });
});

describe("a both", () => {
  it("counts nothing for one stone alone", () => {
    const world = toStep(5);
    pull(world, "left", 2000);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("held its beats, keeps the core lit", () => {
    const world = toStep(5);
    balance(world);
    const seen = runUntil(world, (w) => plumb(w).phase === "rest");
    expect(seen.has("plumbSteady")).toBe(true);
    expect(plumb(world).coreLit).toBe(true);
    expect(plumb(world).cursor).toBe(6);
  });

  it("drifts when either pull takes the bob off true", () => {
    const world = toStep(5);
    balance(world);
    beats(world, 1);
    const types = pull(world, "right", 2000);
    expect(types).toContain("plumbDrift");
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("run out, dims the core until both pull it true again", () => {
    const world = toStep(5);
    const seen = runUntil(world, (w) => plumb(w).phase === "rest");
    expect(seen.has("plumbDim")).toBe(true);
    expect(plumb(world).coreLit).toBe(false);
    expect(plumb(world).cursor).toBe(5);
    toLit(world);
    balance(world);
    runUntil(world, (w) => plumb(w).phase === "rest");
    expect(plumb(world).coreLit).toBe(true);
    expect(plumb(world).cursor).toBe(6);
  });
});

describe("the end", () => {
  it("answered whole, the light bleeds off, both weights snap free and the fight ends", () => {
    const world = toStep(8);
    plumbStruck(world, shot("red"));
    expect(plumb(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("plumbBleed")).toBe(true);
    expect(seen.has("plumbFlare")).toBe(false);
    expect(seen.has("plumbFree")).toBe(true);
    expect(seen.has("plumbOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
