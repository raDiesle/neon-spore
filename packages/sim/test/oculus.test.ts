import { describe, expect, it } from "bun:test";
import { OCULUS_LEAVES } from "../src/oculus.js";
import { oculusStruck } from "../src/oculus-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  holdBoth,
  install,
  leaf,
  oculus,
  runUntil,
  SCRIPT,
  shot,
  toLit,
  toStep,
} from "./oculus-rig.js";

/**
 * THE OCULUS: two seats holding their leaves at once, for as many beats as a
 * step asks, then the ordinary shot into the socket that opens behind them.
 *
 * What these pin is the gate a phone cannot show: that one thumb counts for
 * nothing, that a thumb lifted starts the count again, that the wrong seat's
 * thumb is not heard, that a hold run out is tried again rather than lost,
 * that a shot outside its step or in the wrong colour does nothing, and that
 * a shot run out is the wave.
 */

describe("THE OCULUS comes in", () => {
  it("still, every leaf open, the socket shut", () => {
    const world = install();
    const s = oculus(world);
    expect(s.phase).toBe("still");
    expect(s.leavesShut).toBe(0);
    expect(s.socketOpen).toBe(false);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "oculusEnter")).toBe(true);
  });

  it("lights the first shut after it settles, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("oculusLight")).toBe(true);
    expect(world.beat).toBe(CFG.oculusStillBeats);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the socket is shut", () => {
    const world = install();
    toLit(world);
    oculusStruck(world, shot("red"));
    expect(oculus(world).hits).toBe(0);
    expect(oculus(world).phase).toBe("lit");
  });
});

describe("a shut", () => {
  it("counts only the beats both leaves are held, and shuts a pair at the step's count", () => {
    const world = install();
    toLit(world);
    holdBoth(world);
    beats(world, 2);
    expect(oculus(world).heldBeats).toBe(2);
    expect(oculus(world).phase).toBe("lit");
    const seen = runUntil(world, (w) => oculus(w).phase === "rest");
    expect(seen.has("oculusShut")).toBe(true);
    expect(oculus(world).leavesShut).toBe(2);
    expect(oculus(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("counts nothing for one thumb alone", () => {
    const world = install();
    toLit(world);
    leaf(world, "left", true);
    beats(world, 2);
    expect(oculus(world).heldBeats).toBe(0);
  });

  it("starts again from nought when a thumb lifts while both were down", () => {
    const world = install();
    toLit(world);
    holdBoth(world);
    beats(world, 2);
    const types = leaf(world, "right", false);
    expect(types).toContain("oculusSlip");
    expect(oculus(world).heldBeats).toBe(0);
    expect(oculus(world).phase).toBe("lit");
  });

  it("does not hear the wrong seat's thumb", () => {
    const world = install();
    toLit(world);
    leaf(world, "left", true, 2);
    leaf(world, "right", true, 1);
    expect(oculus(world).held).toEqual([false, false]);
  });

  it("run out, springs the pair open and lights the same step again", () => {
    const world = install();
    toLit(world);
    const seen = runUntil(world, (w) => oculus(w).phase === "rest");
    expect(seen.has("oculusSpring")).toBe(true);
    expect(oculus(world).cursor).toBe(0);
    expect(oculus(world).leavesShut).toBe(0);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(oculus(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the break", () => {
  it("opens the socket once three pairs are shut, with no slow, and moves on by itself", () => {
    const world = toStep(3);
    const s = oculus(world);
    expect(s.leavesShut).toBe(OCULUS_LEAVES);
    expect(s.socketOpen).toBe(true);
    expect(slowing(world)).toBe(false);
    runUntil(world, (w) => oculus(w).phase === "rest");
    expect(oculus(world).cursor).toBe(4);
  });
});

describe("a fire step", () => {
  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(4);
    const misses = world.balance.colorMisses;
    oculusStruck(world, shot("cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(oculus(world).phase).toBe("lit");
    expect(oculus(world).hits).toBe(0);
  });

  it("wants the middle column", () => {
    const world = toStep(4);
    oculusStruck(world, shot("red", CFG.cols - 1));
    expect(oculus(world).phase).toBe("lit");
  });

  it("shot in its colour is a hit, and the lens rests", () => {
    const world = toStep(4);
    oculusStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "oculusHit")).toBe(true);
    expect(oculus(world).hits).toBe(1);
    expect(oculus(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(4);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("oculusMiss")).toBe(true);
  });
});

describe("a reseal", () => {
  it("held its beats, keeps the socket open", () => {
    const world = toStep(6);
    holdBoth(world);
    const seen = runUntil(world, (w) => oculus(w).phase === "rest");
    expect(seen.has("oculusReseal")).toBe(true);
    expect(oculus(world).socketOpen).toBe(true);
    expect(oculus(world).cursor).toBe(7);
  });

  it("run out, swallows the socket until it is held again", () => {
    const world = toStep(6);
    const seen = runUntil(world, (w) => oculus(w).phase === "rest");
    expect(seen.has("oculusSwallow")).toBe(true);
    expect(oculus(world).socketOpen).toBe(false);
    expect(oculus(world).cursor).toBe(6);
    toLit(world);
    holdBoth(world);
    runUntil(world, (w) => oculus(w).phase === "rest");
    expect(oculus(world).socketOpen).toBe(true);
    expect(oculus(world).cursor).toBe(7);
  });
});

describe("the end", () => {
  it("answered whole, the lens shatters and the fight ends", () => {
    const world = toStep(10);
    oculusStruck(world, shot("red"));
    expect(oculus(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("oculusShatter")).toBe(true);
    expect(seen.has("oculusOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
