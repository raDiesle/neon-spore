import { describe, expect, it } from "bun:test";
import type { World } from "../src/index.js";
import { SLING_DRAWS_PER_ARM, slingLitStep } from "../src/sling.js";
import { slingStruck } from "../src/sling-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  drawHome,
  hold,
  install,
  lift,
  rightColor,
  runUntil,
  SCRIPT,
  shot,
  sling,
  toLit,
  toward,
} from "./sling-rig.js";

/**
 * THE SLING: each seat holding a finger down on its own arm for as many beats
 * as a step asks, then loosing it by swiping toward the lit side as it lifts,
 * both at once when a step asks both, then the ordinary shot into the yoke the
 * two drawn arms light.
 *
 * What these pin is the gate a screen cannot show: that a draw is counted
 * only while it is held and only for the seat asked, that a lift too soon,
 * the wrong way or with no swipe springs the arm slack with the step still
 * lit, that the wrong seat's finger is not heard, that a draw run out is tried
 * again rather than lost, that a shot outside its step or in the wrong colour
 * does nothing, and that a shot run out is the wave.
 */

/** The lit step answered: its arm or arms drawn home and loosed toward the aim, or shot in its colour. */
function answer(world: World): void {
  const step = slingLitStep(sling(world));
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") {
    slingStruck(world, shot(rightColor(step)));
    return;
  }
  const sides: (0 | 1)[] = step.ask === "both" ? [0, 1] : [step.ask === "left" ? 0 : 1];
  for (const side of sides) hold(world, side);
  drawHome(world, sides);
  for (const side of sides) lift(world, side, toward(step.aim));
}

/** A fork with the steps before `n` answered and step `n` lit. */
function toStep(n: number): World {
  const world = install();
  toLit(world);
  while (sling(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}

describe("THE SLING comes in", () => {
  it("still, both arms slack, the yoke dark, no finger down", () => {
    const world = install();
    const s = sling(world);
    expect(s.phase).toBe("still");
    expect(s.arms).toEqual([0, 0]);
    expect(s.yokeLit).toBe(false);
    expect(s.holding).toEqual([false, false]);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "slingEnter")).toBe(true);
  });

  it("lights the first draw after it settles, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("slingLight")).toBe(true);
    expect(world.beat).toBe(CFG.slingStillBeats);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the yoke is dark", () => {
    const world = install();
    toLit(world);
    slingStruck(world, shot("red"));
    expect(sling(world).hits).toBe(0);
    expect(sling(world).phase).toBe("lit");
  });
});

describe("a one-arm draw", () => {
  it("counts the beats the finger is held, and looses the arm lifted home toward the aim", () => {
    const world = install();
    toLit(world);
    hold(world, 0);
    beats(world, 2);
    expect(sling(world).drawnBeats[0]).toBe(2);
    drawHome(world, [0]);
    const types = lift(world, 0, toward("left"));
    expect(types).toContain("slingLoose");
    expect(sling(world).arms).toEqual([1, 0]);
    expect(sling(world).phase).toBe("rest");
    expect(sling(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("looses toward the right when the step aims right", () => {
    const world = toStep(1);
    hold(world, 0);
    drawHome(world, [0]);
    expect(lift(world, 0, toward("left"))).toContain("slingSlack");
    hold(world, 0);
    drawHome(world, [0]);
    expect(lift(world, 0, toward("right"))).toContain("slingLoose");
    expect(sling(world).arms).toEqual([2, 0]);
  });

  it("counts nothing with no finger down", () => {
    const world = install();
    toLit(world);
    beats(world, 2);
    expect(sling(world).drawnBeats).toEqual([0, 0]);
  });

  it("counts no further than the step's own count, and a late lift still looses", () => {
    const world = install();
    toLit(world);
    hold(world, 0);
    beats(world, SCRIPT[0]!.beats + 1);
    expect(sling(world).drawnBeats[0]).toBe(SCRIPT[0]!.beats);
    expect(sling(world).phase).toBe("lit");
    expect(lift(world, 0, toward("left"))).toContain("slingLoose");
  });

  it("springs slack on a lift too soon, the count gone and the step still lit", () => {
    const world = install();
    toLit(world);
    hold(world, 0);
    beats(world, 2);
    const types = lift(world, 0, toward("left"));
    expect(types).toContain("slingSlack");
    expect(sling(world).drawnBeats[0]).toBe(0);
    expect(sling(world).arms).toEqual([0, 0]);
    expect(sling(world).phase).toBe("lit");
  });

  it("springs slack on a lift home with no swipe", () => {
    const world = install();
    toLit(world);
    hold(world, 0);
    drawHome(world, [0]);
    expect(lift(world, 0, 0)).toContain("slingSlack");
    expect(sling(world).arms).toEqual([0, 0]);
  });

  it("counts nothing for the other arm, and its lift only lets go", () => {
    const world = install();
    toLit(world);
    hold(world, 1);
    beats(world, 2);
    expect(sling(world).drawnBeats[1]).toBe(0);
    const types = lift(world, 1, toward("left"));
    expect(types).not.toContain("slingSlack");
    expect(types).not.toContain("slingLoose");
    expect(sling(world).holding[1]).toBe(false);
  });

  it("does not hear the wrong seat's finger", () => {
    const world = install();
    toLit(world);
    hold(world, 0, 2);
    hold(world, 1, 1);
    expect(sling(world).holding).toEqual([false, false]);
  });

  it("does nothing for a lift with no finger down", () => {
    const world = install();
    toLit(world);
    expect(lift(world, 0, toward("left"))).not.toContain("slingSlack");
  });

  it("run out, springs the arm and lights the same step again", () => {
    const world = install();
    toLit(world);
    const seen = runUntil(world, (w) => sling(w).phase === "rest");
    expect(seen.has("slingSpring")).toBe(true);
    expect(world.beat).toBe(CFG.slingStillBeats + SCRIPT[0]!.beats + CFG.slingGraceBeats);
    expect(sling(world).cursor).toBe(0);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(sling(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("counts a finger already down when the step lights from its first beat", () => {
    const world = install();
    hold(world, 0);
    toLit(world);
    beats(world, 1);
    expect(sling(world).drawnBeats[0]).toBe(1);
  });
});

describe("the yoke", () => {
  it("lights with the fourth draw, two an arm", () => {
    const world = toStep(3);
    expect(sling(world).yokeLit).toBe(false);
    hold(world, 1);
    drawHome(world, [1]);
    const types = lift(world, 1, toward("left"));
    expect(types).toContain("slingYoke");
    expect(sling(world).arms).toEqual([SLING_DRAWS_PER_ARM, SLING_DRAWS_PER_ARM]);
    expect(sling(world).yokeLit).toBe(true);
  });
});

describe("a fire step", () => {
  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(4);
    const misses = world.balance.colorMisses;
    slingStruck(world, shot("cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(sling(world).phase).toBe("lit");
    expect(sling(world).hits).toBe(0);
  });

  it("wants the middle column", () => {
    const world = toStep(4);
    slingStruck(world, shot("red", CFG.cols - 1));
    expect(sling(world).phase).toBe("lit");
  });

  it("shot in its colour is a hit, and the fork rests", () => {
    const world = toStep(4);
    slingStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "slingHit")).toBe(true);
    expect(sling(world).hits).toBe(1);
    expect(sling(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(4);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("slingMiss")).toBe(true);
  });
});

describe("a both", () => {
  it("is not answered by one arm alone, and that arm is not asked twice", () => {
    const world = toStep(5);
    hold(world, 0);
    drawHome(world, [0]);
    expect(lift(world, 0, toward("left"))).toContain("slingLoose");
    expect(sling(world).loosed).toEqual([true, false]);
    expect(sling(world).phase).toBe("lit");
    hold(world, 0);
    beats(world, 1);
    expect(sling(world).drawnBeats[0]).toBe(0);
    expect(lift(world, 0, toward("left"))).not.toContain("slingSlack");
  });

  it("drawn and loosed by both, keeps the yoke lit and moves on", () => {
    const world = toStep(5);
    hold(world, 0);
    hold(world, 1);
    drawHome(world, [0, 1]);
    lift(world, 0, toward("left"));
    const types = lift(world, 1, toward("left"));
    expect(types).toContain("slingSteady");
    expect(sling(world).yokeLit).toBe(true);
    expect(sling(world).arms).toEqual([SLING_DRAWS_PER_ARM, SLING_DRAWS_PER_ARM]);
    expect(sling(world).cursor).toBe(6);
  });

  it("run out, dims the yoke until both arms are redrawn", () => {
    const world = toStep(5);
    const seen = runUntil(world, (w) => sling(w).phase === "rest");
    expect(seen.has("slingDim")).toBe(true);
    expect(sling(world).yokeLit).toBe(false);
    expect(sling(world).cursor).toBe(5);
    toLit(world);
    answer(world);
    expect(sling(world).yokeLit).toBe(true);
    expect(sling(world).cursor).toBe(6);
  });
});

describe("the end", () => {
  it("answered whole, the fork snaps free and the fight ends", () => {
    const world = toStep(8);
    slingStruck(world, shot("red"));
    expect(sling(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("slingFree")).toBe(true);
    expect(seen.has("slingOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
