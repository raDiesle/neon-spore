import { describe, expect, it } from "bun:test";
import type { World } from "../src/index.js";
import { PLUMB_SETTLES_PER_WEIGHT, PLUMB_UNREAD, plumbLitStep } from "../src/plumb.js";
import { plumbStruck } from "../src/plumb-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  install,
  lean,
  levelBoth,
  plumb,
  putDownBoth,
  rightColor,
  runUntil,
  SCRIPT,
  shot,
  toLit,
} from "./plumb-rig.js";

/**
 * THE PLUMB: each seat holding its own phone level, inside as narrow a range
 * as a step asks, for as many beats as it asks, both at once when a step asks
 * both, then the ordinary shot into the core the two true weights light.
 *
 * What these pin is the gate a phone cannot show: that a lean only counts
 * inside the step's range, that drifting out starts the count again, that a
 * phone put down is no lean at all, that the wrong seat's phone is not heard,
 * that a level run out is tried again rather than lost, that a shot outside
 * its step or in the wrong colour does nothing, and that a shot run out is
 * the wave.
 */

/** The lit step answered: its phone or phones held level until it rests, or shot in its colour. */
function answer(world: World): void {
  const s = plumb(world);
  const step = plumbLitStep(s);
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") plumbStruck(world, shot(rightColor(step)));
  else {
    if (step.ask === "both") levelBoth(world);
    else lean(world, step.ask, 0);
    runUntil(world, (w) => plumb(w).phase === "rest");
    putDownBoth(world);
  }
}

/** A bob with the steps before `n` answered and step `n` lit. */
function toStep(n: number): World {
  const world = install();
  toLit(world);
  while (plumb(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}

describe("THE PLUMB comes in", () => {
  it("still, both weights loose, the core dark, neither phone read", () => {
    const world = install();
    const s = plumb(world);
    expect(s.phase).toBe("still");
    expect(s.weights).toEqual([0, 0]);
    expect(s.coreLit).toBe(false);
    expect(s.tiltMilli).toEqual([PLUMB_UNREAD, PLUMB_UNREAD]);
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
  it("counts the beats the phone is held in range, and settles the weight at the step's count", () => {
    const world = install();
    toLit(world);
    lean(world, "left", 7000);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(2);
    expect(plumb(world).phase).toBe("lit");
    const seen = runUntil(world, (w) => plumb(w).phase === "rest");
    expect(seen.has("plumbSettle")).toBe(true);
    expect(plumb(world).weights).toEqual([1, 0]);
    expect(plumb(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("counts a lean either way the same", () => {
    const world = install();
    toLit(world);
    lean(world, "left", -8000);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(2);
  });

  it("counts nothing for a lean outside the step's range", () => {
    const world = install();
    toLit(world);
    lean(world, "left", 8001);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("counts nothing for a lean the first step takes when the second narrows it", () => {
    const world = toStep(1);
    lean(world, "left", 6000);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("counts nothing for the other weight", () => {
    const world = install();
    toLit(world);
    lean(world, "right", 0);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("starts again from nought when the lean drifts out of range", () => {
    const world = install();
    toLit(world);
    lean(world, "left", 0);
    beats(world, 2);
    const types = lean(world, "left", 20000);
    expect(types).toContain("plumbDrift");
    expect(plumb(world).heldBeats).toBe(0);
    expect(plumb(world).phase).toBe("lit");
  });

  it("starts again from nought when the phone is put down", () => {
    const world = install();
    toLit(world);
    lean(world, "left", 0);
    beats(world, 2);
    const types = lean(world, "left", 0, false);
    expect(types).toContain("plumbDrift");
    expect(plumb(world).tiltMilli[0]).toBe(PLUMB_UNREAD);
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("does not drift for a lean that stays in range", () => {
    const world = install();
    toLit(world);
    lean(world, "left", 0);
    beats(world, 2);
    const types = lean(world, "left", -7500);
    expect(types).not.toContain("plumbDrift");
    expect(plumb(world).heldBeats).toBe(2);
  });

  it("does not hear the wrong seat's phone", () => {
    const world = install();
    toLit(world);
    lean(world, "left", 0, true, 2);
    lean(world, "right", 0, true, 1);
    expect(plumb(world).tiltMilli).toEqual([PLUMB_UNREAD, PLUMB_UNREAD]);
  });

  it("holds a lean past a phone's range to the furthest a phone leans", () => {
    const world = install();
    lean(world, "left", -250_000);
    expect(plumb(world).tiltMilli[0]).toBe(-90_000);
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

  it("counts a phone already level when the step lights from its first beat", () => {
    const world = install();
    lean(world, "left", 0);
    toLit(world);
    beats(world, 1);
    expect(plumb(world).heldBeats).toBe(1);
  });
});

describe("the core", () => {
  it("lights with the fourth settle, two a weight", () => {
    const world = toStep(3);
    expect(plumb(world).coreLit).toBe(false);
    lean(world, "right", 0);
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
  it("counts nothing for one phone alone", () => {
    const world = toStep(5);
    lean(world, "left", 0);
    beats(world, 2);
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("held its beats, keeps the core lit", () => {
    const world = toStep(5);
    levelBoth(world);
    const seen = runUntil(world, (w) => plumb(w).phase === "rest");
    expect(seen.has("plumbSteady")).toBe(true);
    expect(plumb(world).coreLit).toBe(true);
    expect(plumb(world).cursor).toBe(6);
  });

  it("drifts when either phone leaves the range", () => {
    const world = toStep(5);
    levelBoth(world);
    beats(world, 1);
    const types = lean(world, "right", 6001);
    expect(types).toContain("plumbDrift");
    expect(plumb(world).heldBeats).toBe(0);
  });

  it("run out, dims the core until both phones are level again", () => {
    const world = toStep(5);
    const seen = runUntil(world, (w) => plumb(w).phase === "rest");
    expect(seen.has("plumbDim")).toBe(true);
    expect(plumb(world).coreLit).toBe(false);
    expect(plumb(world).cursor).toBe(5);
    toLit(world);
    levelBoth(world);
    runUntil(world, (w) => plumb(w).phase === "rest");
    expect(plumb(world).coreLit).toBe(true);
    expect(plumb(world).cursor).toBe(6);
  });
});

describe("the end", () => {
  it("answered whole, both weights snap free and the fight ends", () => {
    const world = toStep(8);
    plumbStruck(world, shot("red"));
    expect(plumb(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("plumbFree")).toBe(true);
    expect(seen.has("plumbOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
