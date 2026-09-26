import { describe, expect, it } from "bun:test";
import type { World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { VISE_SEAMS_PER_LOBE, viseLitStep } from "../src/vise.js";
import { viseStruck } from "../src/vise-shot.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  install,
  pinch,
  pinchBoth,
  releaseBoth,
  rightColor,
  runUntil,
  SCRIPT,
  shot,
  toLit,
  vise,
} from "./vise-rig.js";

/**
 * THE VISE: each seat pinching its own lobe shut for as many beats as a step
 * asks, both at once when a step asks both, then the ordinary shot into the
 * kernel the four seams bare.
 *
 * What these pin is the gate a phone cannot show: that a gap is only shut at
 * or under `viseShutMilli`, that a pinch widened starts the count again, that
 * the wrong seat's pinch is not heard, that a pinch run out is tried again
 * rather than lost, that a shot outside its step or in the wrong colour does
 * nothing, and that a shot run out is the wave.
 */

/** The lit step answered: its lobe or lobes pinched until it rests, or shot in its colour. */
function answer(world: World): void {
  const s = vise(world);
  const step = viseLitStep(s);
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") viseStruck(world, shot(rightColor(step)));
  else {
    if (step.ask === "both") pinchBoth(world);
    else pinch(world, step.ask, true);
    runUntil(world, (w) => vise(w).phase === "rest");
    releaseBoth(world);
  }
}

/** A case with the steps before `n` answered and step `n` lit. */
function toStep(n: number): World {
  const world = install();
  toLit(world);
  while (vise(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}

describe("THE VISE comes in", () => {
  it("still, both lobes whole and wide, the kernel covered", () => {
    const world = install();
    const s = vise(world);
    expect(s.phase).toBe("still");
    expect(s.cracks).toEqual([0, 0]);
    expect(s.bared).toBe(false);
    expect(s.gapMilli).toEqual([CFG.viseOpenMilli, CFG.viseOpenMilli]);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "viseEnter")).toBe(true);
  });

  it("lights the first pinch after it settles, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("viseLight")).toBe(true);
    expect(world.beat).toBe(CFG.viseStillBeats);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the kernel is covered", () => {
    const world = install();
    toLit(world);
    viseStruck(world, shot("red"));
    expect(vise(world).hits).toBe(0);
    expect(vise(world).phase).toBe("lit");
  });
});

describe("a one-lobe pinch", () => {
  it("counts the beats its lobe is kept shut, and cracks a seam at the step's count", () => {
    const world = install();
    toLit(world);
    pinch(world, "left", true);
    beats(world, 2);
    expect(vise(world).heldBeats).toBe(2);
    expect(vise(world).phase).toBe("lit");
    const seen = runUntil(world, (w) => vise(w).phase === "rest");
    expect(seen.has("viseCrack")).toBe(true);
    expect(vise(world).cracks).toEqual([1, 0]);
    expect(vise(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("counts nothing for a gap still wider than shut", () => {
    const world = install();
    toLit(world);
    pinch(world, "left", true, CFG.viseShutMilli + 1);
    beats(world, 2);
    expect(vise(world).heldBeats).toBe(0);
  });

  it("counts nothing for the other lobe", () => {
    const world = install();
    toLit(world);
    pinch(world, "right", true);
    beats(world, 2);
    expect(vise(world).heldBeats).toBe(0);
  });

  it("starts again from nought when the gap widens back past shut", () => {
    const world = install();
    toLit(world);
    pinch(world, "left", true);
    beats(world, 2);
    const types = pinch(world, "left", true, CFG.viseOpenMilli);
    expect(types).toContain("viseSlip");
    expect(vise(world).heldBeats).toBe(0);
    expect(vise(world).phase).toBe("lit");
  });

  it("reads a pinch lifted as the lobe wide open", () => {
    const world = install();
    toLit(world);
    pinch(world, "left", true);
    const types = pinch(world, "left", false);
    expect(types).toContain("viseSlip");
    expect(vise(world).gapMilli[0]).toBe(CFG.viseOpenMilli);
  });

  it("does not hear the wrong seat's pinch", () => {
    const world = install();
    toLit(world);
    pinch(world, "left", true, 0, 2);
    pinch(world, "right", true, 0, 1);
    expect(vise(world).gapMilli).toEqual([CFG.viseOpenMilli, CFG.viseOpenMilli]);
  });

  it("run out, springs the lobe wide and lights the same step again", () => {
    const world = install();
    toLit(world);
    const seen = runUntil(world, (w) => vise(w).phase === "rest");
    expect(seen.has("viseSpring")).toBe(true);
    expect(vise(world).cursor).toBe(0);
    expect(vise(world).cracks).toEqual([0, 0]);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(vise(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the bare", () => {
  it("comes with the fourth seam, two a lobe", () => {
    const world = toStep(3);
    expect(vise(world).bared).toBe(false);
    pinch(world, "right", true);
    const seen = runUntil(world, (w) => vise(w).phase === "rest");
    expect(seen.has("viseBare")).toBe(true);
    expect(vise(world).cracks).toEqual([VISE_SEAMS_PER_LOBE, VISE_SEAMS_PER_LOBE]);
    expect(vise(world).bared).toBe(true);
  });
});

describe("a fire step", () => {
  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(4);
    const misses = world.balance.colorMisses;
    viseStruck(world, shot("cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(vise(world).phase).toBe("lit");
    expect(vise(world).hits).toBe(0);
  });

  it("wants the middle column", () => {
    const world = toStep(4);
    viseStruck(world, shot("red", CFG.cols - 1));
    expect(vise(world).phase).toBe("lit");
  });

  it("shot in its colour is a hit, and the case rests", () => {
    const world = toStep(4);
    viseStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "viseHit")).toBe(true);
    expect(vise(world).hits).toBe(1);
    expect(vise(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(4);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("viseMiss")).toBe(true);
  });
});

describe("a both", () => {
  it("counts nothing for one lobe alone", () => {
    const world = toStep(5);
    pinch(world, "left", true);
    beats(world, 2);
    expect(vise(world).heldBeats).toBe(0);
  });

  it("pinched its beats, holds the lobes off the kernel", () => {
    const world = toStep(5);
    pinchBoth(world);
    const seen = runUntil(world, (w) => vise(w).phase === "rest");
    expect(seen.has("viseBrace")).toBe(true);
    expect(vise(world).bared).toBe(true);
    expect(vise(world).cursor).toBe(6);
  });

  it("run out, covers the kernel until it is held again", () => {
    const world = toStep(5);
    const seen = runUntil(world, (w) => vise(w).phase === "rest");
    expect(seen.has("viseCover")).toBe(true);
    expect(vise(world).bared).toBe(false);
    expect(vise(world).cursor).toBe(5);
    toLit(world);
    pinchBoth(world);
    runUntil(world, (w) => vise(w).phase === "rest");
    expect(vise(world).bared).toBe(true);
    expect(vise(world).cursor).toBe(6);
  });
});

describe("the end", () => {
  it("answered whole, the case splits and the fight ends", () => {
    const world = toStep(8);
    viseStruck(world, shot("red"));
    expect(vise(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("viseSplit")).toBe(true);
    expect(seen.has("viseOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
