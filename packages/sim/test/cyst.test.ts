import { describe, expect, it } from "bun:test";
import { cystLitStep } from "../src/cyst.js";
import { cystStruck } from "../src/cyst-shot.js";
import type { World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  cyst,
  install,
  pinch,
  rightColor,
  runUntil,
  SCRIPT,
  shot,
  tap,
  tapUp,
  toLit,
} from "./cyst-rig.js";

/**
 * THE CYST: a lit flank shudders until the partner taps its mark, then its
 * own seat pinches it shut for the step's beats to crack it; both cracked
 * bare the core, which is shot in its colour.
 *
 * What these pin is the gate a phone cannot show: that only the partner's
 * tap stills a flank, and only as an edge; that a pinch on a flank nobody
 * stilled counts nothing; that a pinch widened starts the count again; that
 * a tap or a pinch run out is tried again rather than lost; that a guard run
 * out reseals the core; and that a shot run out is the wave.
 */

/** The lit step answered: its flank tapped still and pinched until it rests, or shot in its colour. */
function answer(world: World): void {
  const s = cyst(world);
  const step = cystLitStep(s);
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") cystStruck(world, shot(rightColor(step)));
  else {
    tapUp(world, step.ask);
    pinch(world, step.ask, true);
    runUntil(world, (w) => cyst(w).phase === "rest");
    pinch(world, step.ask, false);
  }
}

/** A sac with the steps before `n` answered and step `n` lit. */
function toStep(n: number): World {
  const world = install();
  toLit(world);
  while (cyst(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}

describe("THE CYST comes in", () => {
  it("still, both flanks whole and wide, the core covered", () => {
    const world = install();
    const s = cyst(world);
    expect(s.phase).toBe("still");
    expect(s.cracks).toEqual([0, 0]);
    expect(s.bared).toBe(false);
    expect(s.gapMilli).toEqual([CFG.cystOpenMilli, CFG.cystOpenMilli]);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "cystEnter")).toBe(true);
  });

  it("lights the first flank after it settles, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("cystLight")).toBe(true);
    expect(world.beat).toBe(CFG.cystStillBeats);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the core is covered", () => {
    const world = install();
    toLit(world);
    cystStruck(world, shot("red"));
    expect(cyst(world).hits).toBe(0);
    expect(cyst(world).phase).toBe("lit");
  });
});

describe("the tap", () => {
  it("from the partner stills the lit flank", () => {
    const world = install();
    toLit(world);
    const types = tap(world, "left");
    expect(types).toContain("cystStill");
    expect(cyst(world).phase).toBe("frozen");
    expect(slowing(world)).toBe(true);
  });

  it("is not heard from the flank's own seat", () => {
    const world = install();
    toLit(world);
    tap(world, "left", true, 1);
    expect(cyst(world).phase).toBe("lit");
  });

  it("on the other flank's mark does nothing", () => {
    const world = install();
    toLit(world);
    tap(world, "right");
    expect(cyst(world).phase).toBe("lit");
  });

  it("is an edge: a thumb already resting there has to lift and come down", () => {
    const world = install();
    tap(world, "left");
    toLit(world);
    tap(world, "left");
    expect(cyst(world).phase).toBe("lit");
    tap(world, "left", false);
    tap(world, "left");
    expect(cyst(world).phase).toBe("frozen");
  });

  it("run out, the flank shudders and the same step is lit again", () => {
    const world = install();
    toLit(world);
    const seen = runUntil(world, (w) => cyst(w).phase === "rest");
    expect(seen.has("cystShudder")).toBe(true);
    expect(cyst(world).cursor).toBe(0);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(cyst(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the pinch", () => {
  it("counts nothing on a flank nobody stilled", () => {
    const world = install();
    toLit(world);
    pinch(world, "left", true);
    beats(world, 1);
    expect(cyst(world).heldBeats).toBe(0);
  });

  it("already shut when the flank is stilled counts from its first beat, and cracks at the step's count", () => {
    const world = install();
    toLit(world);
    pinch(world, "left", true);
    tapUp(world, "left");
    beats(world, 2);
    expect(cyst(world).heldBeats).toBe(2);
    const seen = runUntil(world, (w) => cyst(w).phase === "rest");
    expect(seen.has("cystCrack")).toBe(true);
    expect(cyst(world).cracks).toEqual([1, 0]);
    expect(cyst(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("counts nothing for a gap still wider than shut", () => {
    const world = install();
    toLit(world);
    tapUp(world, "left");
    pinch(world, "left", true, CFG.cystShutMilli + 1);
    beats(world, 2);
    expect(cyst(world).heldBeats).toBe(0);
  });

  it("starts again from nought when the gap widens back past shut", () => {
    const world = install();
    toLit(world);
    tapUp(world, "left");
    pinch(world, "left", true);
    beats(world, 2);
    const types = pinch(world, "left", false);
    expect(types).toContain("cystSlip");
    expect(cyst(world).heldBeats).toBe(0);
    expect(cyst(world).gapMilli[0]).toBe(CFG.cystOpenMilli);
    expect(cyst(world).phase).toBe("frozen");
  });

  it("does not hear the wrong seat's pinch", () => {
    const world = install();
    toLit(world);
    pinch(world, "left", true, 0, 2);
    pinch(world, "right", true, 0, 1);
    expect(cyst(world).gapMilli).toEqual([CFG.cystOpenMilli, CFG.cystOpenMilli]);
  });

  it("run out, springs the flank wide and lights the same step again", () => {
    const world = install();
    toLit(world);
    tapUp(world, "left");
    const seen = runUntil(world, (w) => cyst(w).phase === "rest");
    expect(seen.has("cystSpring")).toBe(true);
    expect(cyst(world).cursor).toBe(0);
    expect(cyst(world).cracks).toEqual([0, 0]);
    toLit(world);
    expect(cyst(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the bare", () => {
  it("comes with the second flank's crack", () => {
    const world = toStep(1);
    expect(cyst(world).bared).toBe(false);
    tapUp(world, "right");
    pinch(world, "right", true);
    const seen = runUntil(world, (w) => cyst(w).phase === "rest");
    expect(seen.has("cystBare")).toBe(true);
    expect(cyst(world).cracks).toEqual([1, 1]);
    expect(cyst(world).bared).toBe(true);
  });
});

describe("a fire step", () => {
  it("lights without THE SLOW", () => {
    const world = toStep(2);
    expect(slowing(world)).toBe(false);
  });

  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(2);
    const misses = world.balance.colorMisses;
    cystStruck(world, shot("cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(cyst(world).phase).toBe("lit");
    expect(cyst(world).hits).toBe(0);
  });

  it("wants the middle column", () => {
    const world = toStep(2);
    cystStruck(world, shot("red", CFG.cols - 1));
    expect(cyst(world).phase).toBe("lit");
  });

  it("shot in its colour is a hit, and the sac rests", () => {
    const world = toStep(2);
    cystStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "cystHit")).toBe(true);
    expect(cyst(world).hits).toBe(1);
    expect(cyst(world).phase).toBe("rest");
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(2);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("cystMiss")).toBe(true);
  });
});

describe("a guard", () => {
  it("made, holds the cracked flank off the core", () => {
    const world = toStep(3);
    tapUp(world, "left");
    pinch(world, "left", true);
    const seen = runUntil(world, (w) => cyst(w).phase === "rest");
    expect(seen.has("cystGuard")).toBe(true);
    expect(cyst(world).bared).toBe(true);
    expect(cyst(world).cursor).toBe(4);
  });

  it("run out, reseals the core until the same guard is made", () => {
    const world = toStep(3);
    const seen = runUntil(world, (w) => cyst(w).phase === "rest");
    expect(seen.has("cystSeal")).toBe(true);
    expect(cyst(world).bared).toBe(false);
    expect(cyst(world).cursor).toBe(3);
    toLit(world);
    tapUp(world, "left");
    pinch(world, "left", true);
    runUntil(world, (w) => cyst(w).phase === "rest");
    expect(cyst(world).bared).toBe(true);
    expect(cyst(world).cursor).toBe(4);
  });
});

describe("the end", () => {
  it("answered whole, the sac splits and the fight ends", () => {
    const world = toStep(6);
    cystStruck(world, shot("red"));
    expect(cyst(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("cystSplit")).toBe(true);
    expect(seen.has("cystOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
