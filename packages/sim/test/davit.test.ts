import { describe, expect, it } from "bun:test";
import { DAVIT_LOOSES_PER_SWING, DAVIT_UNREAD, davitLitStep } from "../src/davit.js";
import { davitStruck } from "../src/davit-shot.js";
import type { World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  davit,
  drawHome,
  hold,
  install,
  lean,
  lift,
  rightColor,
  runUntil,
  SCRIPT,
  shot,
  toLit,
  toward,
  unlean,
} from "./davit-rig.js";

/**
 * THE DAVIT: one seat leaning its phone onto the lit step's target and
 * keeping it there while the other holds a draw for the step's beats and
 * looses it toward the lean's half, two looses a swing, then the ordinary shot
 * into the pivot the two swings light.
 *
 * What these pin is the gate a screen cannot show: that a draw is counted only
 * while the *other* seat's lean holds the target, that a lean leaving the
 * target costs the draw its count, that a lift too soon, the wrong way or with
 * the lean gone springs the draw slack with the step still lit, that the wrong
 * seat's touch is not heard, that a swing run out is tried again rather than
 * lost, that a reland is either seat's, and that a shot run out is the wave.
 */

/** Which seat steers a swing: the pilot the left, the navigator the right. */
const steererOf = (ask: "left" | "right"): 0 | 1 => (ask === "left" ? 0 : 1);

/** The lit step answered: steered and loosed home toward its half, or shot in its colour. */
function answer(world: World): void {
  const step = davitLitStep(davit(world));
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") {
    davitStruck(world, shot(rightColor(step)));
    return;
  }
  const steer: 0 | 1 = step.ask === "reland" ? 0 : steererOf(step.ask);
  const drawer: 0 | 1 = steer === 0 ? 1 : 0;
  lean(world, steer, step.leanMilli);
  hold(world, drawer);
  drawHome(world, drawer);
  lift(world, drawer, toward(step.leanMilli));
}

/** A boom with the steps before `n` answered and step `n` lit. */
function toStep(n: number): World {
  const world = install();
  toLit(world);
  while (davit(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}

describe("THE DAVIT comes in", () => {
  it("still, both swings empty, the pivot dark, no lean read, no finger down", () => {
    const world = install();
    const s = davit(world);
    expect(s.phase).toBe("still");
    expect(s.swings).toEqual([0, 0]);
    expect(s.pivotLit).toBe(false);
    expect(s.tiltMilli).toEqual([DAVIT_UNREAD, DAVIT_UNREAD]);
    expect(s.holding).toEqual([false, false]);
    expect(s.aimMilli).toBe(0);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "davitEnter")).toBe(true);
  });

  it("lights the first swing after it settles, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("davitLight")).toBe(true);
    expect(world.beat).toBe(CFG.davitStillBeats);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the pivot is dark", () => {
    const world = install();
    toLit(world);
    davitStruck(world, shot("red"));
    expect(davit(world).hits).toBe(0);
    expect(davit(world).phase).toBe("lit");
  });
});

describe("a swing", () => {
  it("counts the draw while the other seat's lean holds, and looses it toward the lean", () => {
    const world = install();
    toLit(world);
    lean(world, 0, -18000);
    hold(world, 1);
    beats(world, 2);
    expect(davit(world).drawnBeats[1]).toBe(2);
    drawHome(world, 1);
    const types = lift(world, 1, toward(-20000));
    expect(types).toContain("davitLoose");
    expect(davit(world).swings).toEqual([1, 0]);
    expect(davit(world).phase).toBe("rest");
    expect(davit(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("counts nothing with nobody steering", () => {
    const world = install();
    toLit(world);
    hold(world, 1);
    beats(world, 2);
    expect(davit(world).drawnBeats).toEqual([0, 0]);
  });

  it("counts nothing while the lean is off the target", () => {
    const world = install();
    toLit(world);
    lean(world, 0, -20000 + SCRIPT[0]!.rangeMilli + 1);
    hold(world, 1);
    beats(world, 2);
    expect(davit(world).drawnBeats[1]).toBe(0);
  });

  it("counts nothing when the drawer leans for themself", () => {
    const world = install();
    toLit(world);
    lean(world, 1, -20000);
    hold(world, 1);
    beats(world, 2);
    expect(davit(world).drawnBeats[1]).toBe(0);
  });

  it("counts nothing for the steerer's own draw, and its lift only lets go", () => {
    const world = install();
    toLit(world);
    lean(world, 1, -20000);
    hold(world, 0);
    beats(world, 2);
    expect(davit(world).drawnBeats[0]).toBe(0);
    const types = lift(world, 0, toward(-20000));
    expect(types).not.toContain("davitSlack");
    expect(types).not.toContain("davitLoose");
    expect(davit(world).holding[0]).toBe(false);
  });

  it("springs slack on a lift too soon, the count gone and the step still lit", () => {
    const world = install();
    toLit(world);
    lean(world, 0, -20000);
    hold(world, 1);
    beats(world, 2);
    expect(lift(world, 1, toward(-20000))).toContain("davitSlack");
    expect(davit(world).drawnBeats[1]).toBe(0);
    expect(davit(world).swings).toEqual([0, 0]);
    expect(davit(world).phase).toBe("lit");
  });

  it("springs slack on a lift home swiped away from the lean, or not swiped", () => {
    const world = install();
    toLit(world);
    lean(world, 0, -20000);
    hold(world, 1);
    drawHome(world, 1);
    expect(lift(world, 1, toward(20000))).toContain("davitSlack");
    hold(world, 1);
    drawHome(world, 1);
    expect(lift(world, 1, 0)).toContain("davitSlack");
    expect(davit(world).swings).toEqual([0, 0]);
  });

  it("loses the count when the lean leaves the target, and a lift then is slack", () => {
    const world = install();
    toLit(world);
    lean(world, 0, -20000);
    hold(world, 1);
    drawHome(world, 1);
    expect(lean(world, 0, 0)).toContain("davitDrift");
    expect(davit(world).drawnBeats[1]).toBe(0);
    lean(world, 0, -20000);
    expect(lift(world, 1, toward(-20000))).toContain("davitSlack");
  });

  it("loses the count when the steering phone stops reporting", () => {
    const world = install();
    toLit(world);
    lean(world, 0, -20000);
    hold(world, 1);
    beats(world, 2);
    expect(unlean(world, 0)).toContain("davitDrift");
    expect(davit(world).tiltMilli[0]).toBe(DAVIT_UNREAD);
    expect(davit(world).drawnBeats[1]).toBe(0);
  });

  it("does not hear the wrong seat's lean or draw", () => {
    const world = install();
    toLit(world);
    lean(world, 0, -20000, 2);
    hold(world, 1, 1);
    expect(davit(world).tiltMilli).toEqual([DAVIT_UNREAD, DAVIT_UNREAD]);
    expect(davit(world).holding).toEqual([false, false]);
  });

  it("does nothing for a lift with no finger down", () => {
    const world = install();
    toLit(world);
    lean(world, 0, -20000);
    expect(lift(world, 1, toward(-20000))).not.toContain("davitSlack");
  });

  it("run out, sways back and lights the same step again", () => {
    const world = install();
    toLit(world);
    const seen = runUntil(world, (w) => davit(w).phase === "rest");
    expect(seen.has("davitSway")).toBe(true);
    expect(world.beat).toBe(CFG.davitStillBeats + SCRIPT[0]!.beats + CFG.davitGraceBeats);
    expect(davit(world).cursor).toBe(0);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(davit(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("is the navigator's to steer on the right swing, and the pilot's to loose", () => {
    const world = toStep(2);
    lean(world, 1, 20000);
    hold(world, 0);
    drawHome(world, 0);
    expect(lift(world, 0, toward(20000))).toContain("davitLoose");
    expect(davit(world).swings).toEqual([DAVIT_LOOSES_PER_SWING, 1]);
  });
});

describe("the boom", () => {
  it("follows the steering lean, and swings back toward hanging when it is lost", () => {
    const world = install();
    toLit(world);
    lean(world, 0, -19000);
    expect(davit(world).aimMilli).toBe(-19000);
    lean(world, 0, 0);
    expect(davit(world).aimMilli).toBe(-19000);
    beats(world, 1);
    expect(davit(world).aimMilli).toBe(-19000 + CFG.davitDriftMilli);
    beats(world, 10);
    expect(davit(world).aimMilli).toBe(0);
  });
});

describe("the pivot", () => {
  it("lights with the fourth loose, two a swing", () => {
    const world = toStep(3);
    expect(davit(world).pivotLit).toBe(false);
    lean(world, 1, -15000);
    hold(world, 0);
    drawHome(world, 0);
    expect(lift(world, 0, toward(-15000))).toContain("davitPivot");
    expect(davit(world).swings).toEqual([DAVIT_LOOSES_PER_SWING, DAVIT_LOOSES_PER_SWING]);
    expect(davit(world).pivotLit).toBe(true);
  });
});

describe("a fire step", () => {
  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(4);
    const misses = world.balance.colorMisses;
    davitStruck(world, shot("cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(davit(world).phase).toBe("lit");
    expect(davit(world).hits).toBe(0);
  });

  it("wants the middle column", () => {
    const world = toStep(4);
    davitStruck(world, shot("red", CFG.cols - 1));
    expect(davit(world).phase).toBe("lit");
  });

  it("shot in its colour is a hit, and the boom rests", () => {
    const world = toStep(4);
    davitStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "davitHit")).toBe(true);
    expect(davit(world).hits).toBe(1);
    expect(davit(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(4);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("davitMiss")).toBe(true);
  });
});

describe("a reland", () => {
  it("is either seat's: the navigator steers and the pilot looses", () => {
    const world = toStep(5);
    lean(world, 1, -10000);
    hold(world, 0);
    drawHome(world, 0);
    expect(lift(world, 0, toward(-10000))).toContain("davitReland");
    expect(davit(world).pivotLit).toBe(true);
    expect(davit(world).cursor).toBe(6);
  });

  it("and the other way about", () => {
    const world = toStep(5);
    lean(world, 0, -10000);
    hold(world, 1);
    drawHome(world, 1);
    expect(lift(world, 1, toward(-10000))).toContain("davitReland");
    expect(davit(world).cursor).toBe(6);
  });

  it("run out, dims the pivot until it is relanded", () => {
    const world = toStep(5);
    const seen = runUntil(world, (w) => davit(w).phase === "rest");
    expect(seen.has("davitDim")).toBe(true);
    expect(davit(world).pivotLit).toBe(false);
    expect(davit(world).cursor).toBe(5);
    toLit(world);
    answer(world);
    expect(davit(world).pivotLit).toBe(true);
    expect(davit(world).cursor).toBe(6);
  });
});

describe("the end", () => {
  it("answered whole, the boom swings spent and the fight ends", () => {
    const world = toStep(8);
    davitStruck(world, shot("red"));
    expect(davit(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("davitSpent")).toBe(true);
    expect(seen.has("davitOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
