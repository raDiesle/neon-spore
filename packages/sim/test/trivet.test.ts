import { describe, expect, it } from "bun:test";
import { slowing } from "../src/slow.js";
import { TRIVET_PLANTS_PER_FOOT } from "../src/trivet.js";
import { trivetStruck } from "../src/trivet-shot.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  chord,
  chordBoth,
  install,
  lift,
  pad,
  runUntil,
  SCRIPT,
  shot,
  toLit,
  toStep,
  trivet,
} from "./trivet-rig.js";

/**
 * THE TRIVET: each seat holding its own foot's lit pads down together for as
 * many beats as a step asks, both at once when a step asks both, then the
 * ordinary shot into the hub the two planted feet light.
 *
 * What these pin is the gate a phone cannot show: that a chord is only held
 * with every lit pad down, that any of them lifting starts the count again,
 * that the wrong seat's pads are not heard, that a chord run out is tried
 * again rather than lost, that a shot outside its step or in the wrong colour
 * does nothing, and that a shot run out is the wave.
 */

describe("THE TRIVET comes in", () => {
  it("still, both feet lifted, the hub dark", () => {
    const world = install();
    const s = trivet(world);
    expect(s.phase).toBe("still");
    expect(s.feet).toEqual([0, 0]);
    expect(s.hubLit).toBe(false);
    expect(s.padsDown).toEqual([0, 0]);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "trivetEnter")).toBe(true);
  });

  it("lights the first chord after it settles, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("trivetLight")).toBe(true);
    expect(world.beat).toBe(CFG.trivetStillBeats);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the hub is dark", () => {
    const world = install();
    toLit(world);
    trivetStruck(world, shot("red"));
    expect(trivet(world).hits).toBe(0);
    expect(trivet(world).phase).toBe("lit");
  });
});

describe("a one-foot chord", () => {
  it("counts the beats its pads are held together, and plants the foot at the step's count", () => {
    const world = install();
    toLit(world);
    chord(world, "front", 2);
    beats(world, 2);
    expect(trivet(world).heldBeats).toBe(2);
    expect(trivet(world).phase).toBe("lit");
    const seen = runUntil(world, (w) => trivet(w).phase === "rest");
    expect(seen.has("trivetPlant")).toBe(true);
    expect(trivet(world).feet).toEqual([1, 0]);
    expect(trivet(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("counts nothing for one pad of two", () => {
    const world = install();
    toLit(world);
    pad(world, "front", 0, true);
    beats(world, 2);
    expect(trivet(world).heldBeats).toBe(0);
  });

  it("counts nothing for two pads when the step lights three", () => {
    const world = toStep(1);
    chord(world, "front", 2);
    beats(world, 2);
    expect(trivet(world).heldBeats).toBe(0);
  });

  it("counts nothing for the other foot", () => {
    const world = install();
    toLit(world);
    chord(world, "rear", 2);
    beats(world, 2);
    expect(trivet(world).heldBeats).toBe(0);
  });

  it("starts again from nought when any lit pad lifts", () => {
    const world = install();
    toLit(world);
    chord(world, "front", 2);
    beats(world, 2);
    const types = pad(world, "front", 1, false);
    expect(types).toContain("trivetSlip");
    expect(trivet(world).heldBeats).toBe(0);
    expect(trivet(world).phase).toBe("lit");
  });

  it("does not slip for a pad the step does not light", () => {
    const world = install();
    toLit(world);
    chord(world, "front", 3);
    beats(world, 2);
    const types = pad(world, "front", 2, false);
    expect(types).not.toContain("trivetSlip");
    expect(trivet(world).heldBeats).toBe(2);
  });

  it("does not hear the wrong seat's pads, nor a pad off the foot", () => {
    const world = install();
    toLit(world);
    pad(world, "front", 0, true, 2);
    pad(world, "rear", 0, true, 1);
    pad(world, "front", 3, true);
    expect(trivet(world).padsDown).toEqual([0, 0]);
  });

  it("run out, springs the foot back up and lights the same step again", () => {
    const world = install();
    toLit(world);
    const seen = runUntil(world, (w) => trivet(w).phase === "rest");
    expect(seen.has("trivetSpring")).toBe(true);
    expect(trivet(world).cursor).toBe(0);
    expect(trivet(world).feet).toEqual([0, 0]);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(trivet(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("counts a chord already down when the step lights from its first beat", () => {
    const world = install();
    chord(world, "front", 2);
    toLit(world);
    beats(world, 1);
    expect(trivet(world).heldBeats).toBe(1);
  });
});

describe("the hub", () => {
  it("lights with the fourth plant, two a foot", () => {
    const world = toStep(3);
    expect(trivet(world).hubLit).toBe(false);
    chord(world, "rear", 3);
    const seen = runUntil(world, (w) => trivet(w).phase === "rest");
    expect(seen.has("trivetHub")).toBe(true);
    expect(trivet(world).feet).toEqual([TRIVET_PLANTS_PER_FOOT, TRIVET_PLANTS_PER_FOOT]);
    expect(trivet(world).hubLit).toBe(true);
  });
});

describe("a fire step", () => {
  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(4);
    const misses = world.balance.colorMisses;
    trivetStruck(world, shot("cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(trivet(world).phase).toBe("lit");
    expect(trivet(world).hits).toBe(0);
  });

  it("wants the middle column", () => {
    const world = toStep(4);
    trivetStruck(world, shot("red", CFG.cols - 1));
    expect(trivet(world).phase).toBe("lit");
  });

  it("shot in its colour is a hit, and the stand rests", () => {
    const world = toStep(4);
    trivetStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "trivetHit")).toBe(true);
    expect(trivet(world).hits).toBe(1);
    expect(trivet(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(4);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("trivetMiss")).toBe(true);
  });
});

describe("a both", () => {
  it("counts nothing for one foot alone", () => {
    const world = toStep(5);
    chord(world, "front", 2);
    beats(world, 2);
    expect(trivet(world).heldBeats).toBe(0);
  });

  it("held its beats, keeps the hub down", () => {
    const world = toStep(5);
    chordBoth(world);
    const seen = runUntil(world, (w) => trivet(w).phase === "rest");
    expect(seen.has("trivetBrace")).toBe(true);
    expect(trivet(world).hubLit).toBe(true);
    expect(trivet(world).cursor).toBe(6);
  });

  it("run out, rocks the hub up until both feet replant", () => {
    const world = toStep(5);
    const seen = runUntil(world, (w) => trivet(w).phase === "rest");
    expect(seen.has("trivetRock")).toBe(true);
    expect(trivet(world).hubLit).toBe(false);
    expect(trivet(world).cursor).toBe(5);
    toLit(world);
    chordBoth(world);
    runUntil(world, (w) => trivet(w).phase === "rest");
    expect(trivet(world).hubLit).toBe(true);
    expect(trivet(world).cursor).toBe(6);
    lift(world, "front");
  });
});

describe("the end", () => {
  it("answered whole, the stand collapses and the fight ends", () => {
    const world = toStep(SCRIPT.length - 1);
    trivetStruck(world, shot("red"));
    expect(trivet(world).hits).toBe(4);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("trivetCollapse")).toBe(true);
    expect(seen.has("trivetOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
