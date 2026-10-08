import { describe, expect, it } from "bun:test";
import { latchGripSeat, latchKnotsAll, latchRearing } from "../src/latch.js";
import {
  CFG,
  hashWorld,
  haulLevel,
  hold,
  install,
  KNOT,
  latch,
  lift,
  pull,
  REACH,
  runUntil,
  SCRIPT,
  TPB,
  tick,
  toLevel,
} from "./latch-rig.js";

/**
 * THE LATCH's receipts, one rule a test (`sim/latch.ts`): the grips are
 * whose they are, only the turn's grip moves the rope, a pull let go passes
 * the turn, both off is a slip back to the last knot and never past it, a
 * knot is kept, a yank wants both hands, a crossed level swaps the grips,
 * a level run out tears the hull, and the whole script is a slime torn loose.
 */

describe("THE LATCH", () => {
  it("installs a rope with nothing pulled, and lights its first level after the drop", () => {
    const world = install();
    const s = latch(world);
    expect(s.phase).toBe("enter");
    expect(s.hauledMilli).toBe(0);
    expect(latchKnotsAll(s)).toBe(6);
    const seen = toLevel(world);
    expect(seen.has("latchLevel")).toBe(true);
    expect(world.beat - latch(world).phaseBeat).toBe(0);
  });

  it("gives the pilot the left grip and the navigator the right, and says a wrong grab", () => {
    const world = install();
    toLevel(world);
    const s = latch(world);
    expect(latchGripSeat(s, 0)).toBe(0);
    expect(latchGripSeat(s, 1)).toBe(1);
    const types = tick(world, [hold(1, 1)]);
    expect(types).toContain("latchWrong");
    expect(s.down).toEqual([false, false]);
  });

  it("moves the rope only by the grip whose turn it is", () => {
    const world = install();
    toLevel(world);
    const s = latch(world);
    expect(s.turn).toBe(0);
    tick(world, [hold(2, 1)]);
    tick(world, [hold(2, 1, REACH)]);
    expect(s.hauledMilli).toBe(0);
    tick(world, [hold(1, 0)]);
    tick(world, [hold(1, 0, 1800)]);
    expect(s.hauledMilli).toBe(1800);
  });

  it("never carries the rope further than a reach on one pull", () => {
    const world = install();
    toLevel(world);
    tick(world, [hold(2, 1)]);
    tick(world, [hold(1, 0)]);
    tick(world, [hold(1, 0, REACH * 3)]);
    expect(latch(world).hauledMilli).toBe(REACH);
  });

  it("passes the turn when a pull lets go while the other grip holds", () => {
    const world = install();
    toLevel(world);
    tick(world, [hold(2, 1)]);
    const types = pull(world, 1, 0);
    expect(types).toContain("latchTurn");
    expect(latch(world).turn).toBe(1);
    expect(latch(world).hauledMilli).toBe(REACH);
  });

  it("keeps the turn when a pull lets go too short", () => {
    const world = install();
    toLevel(world);
    tick(world, [hold(2, 1)]);
    pull(world, 1, 0, CFG.latchStrokeMilli - 1);
    expect(latch(world).turn).toBe(0);
  });

  it("slips back to the last knot when both let go at once, and keeps the turn", () => {
    const world = install();
    toLevel(world);
    const types = pull(world, 1, 0);
    expect(types).toContain("latchSlip");
    expect(latch(world).hauledMilli).toBe(0);
    expect(latch(world).turn).toBe(0);
    const slip = world.events.find((e) => e.type === "latchSlip");
    expect(slip).toMatchObject({ why: "both", lostMilli: REACH });
  });

  it("pulls a knot in for good: a slip after it goes back no further", () => {
    const world = install();
    toLevel(world);
    tick(world, [hold(2, 1)]);
    pull(world, 1, 0);
    tick(world, [hold(1, 0)]);
    const types = pull(world, 2, 1);
    expect(types).toContain("latchKnot");
    const s = latch(world);
    expect(s.knots).toBe(1);
    expect(s.floorMilli).toBe(KNOT);
    // The pilot lets go too: both off, and the rope goes back to the knot, not to nought.
    tick(world, [lift(1, 0)]);
    expect(s.hauledMilli).toBe(KNOT);
  });

  it("wins a level when its knots are in, and lights the next after the rest", () => {
    const world = install();
    toLevel(world);
    const seen = haulLevel(world);
    expect(seen.has("latchKnot")).toBe(true);
    const s = latch(world);
    expect(s.phase).toBe("rest");
    expect(s.cursor).toBe(1);
    expect(s.knots).toBe(SCRIPT[0]!.knots);
    toLevel(world);
    expect(latch(world).levelKnots).toBe(0);
  });

  it("rears before a yank, and slips the rope if a hand is off when it yanks", () => {
    const world = install([{ ask: "yank", knots: 2, beats: 40 }]);
    toLevel(world);
    tick(world, [hold(2, 1)]);
    tick(world, [hold(1, 0)]);
    tick(world, [hold(1, 0, 1500)]);
    // Only the pilot's thumb stays down.
    tick(world, [lift(2, 1)]);
    const seen = runUntil(world, (w) => latchRearing(w, latch(w)));
    expect(world.events.map((e) => e.type)).toContain("latchRear");
    expect(seen.has("latchSlip")).toBe(false);
    const after = runUntil(world, (w) => w.events.some((e) => e.type === "latchSlip"), 4);
    expect(after.has("latchBraced")).toBe(false);
    expect(latch(world).hauledMilli).toBe(0);
  });

  it("holds through a yank when both hands are on the rope", () => {
    const world = install([{ ask: "yank", knots: 2, beats: 40 }]);
    toLevel(world);
    tick(world, [hold(2, 1)]);
    tick(world, [hold(1, 0)]);
    tick(world, [hold(1, 0, 1500)]);
    const seen = runUntil(world, (w) => w.events.some((e) => e.type === "latchBraced"), 12);
    expect(seen.has("latchSlip")).toBe(false);
    expect(latch(world).hauledMilli).toBe(1500);
  });

  it("crosses the grips in a cross level", () => {
    const world = install([{ ask: "cross", knots: 1, beats: 40 }]);
    toLevel(world);
    const s = latch(world);
    expect(latchGripSeat(s, 0)).toBe(1);
    expect(latchGripSeat(s, 1)).toBe(0);
    expect(tick(world, [hold(1, 0)])).toContain("latchWrong");
    tick(world, [hold(1, 1)]);
    tick(world, [hold(2, 0)]);
    tick(world, [hold(2, 0, 2000)]);
    expect(s.hauledMilli).toBe(2000);
  });

  it("tears the hull when a level runs out", () => {
    const world = install([{ ask: "haul", knots: 2, beats: 6 }]);
    toLevel(world);
    const seen = runUntil(world, (w) => w.events.some((e) => e.type === "latchMiss"), 8);
    expect(world.events.some((e) => e.type === "breach")).toBe(true);
    expect(seen.has("latchKnot")).toBe(false);
  });

  it("is torn loose after the last level, and leaves the wave", () => {
    const world = install();
    for (const _ of SCRIPT) {
      toLevel(world);
      haulLevel(world);
    }
    expect(latch(world).phase).toBe("spent");
    runUntil(world, (w) => w.boss === null, CFG.latchSpentBeats + 2);
    expect(world.boss).toBeNull();
  });

  it("plays the same twice from the same seed and the same thumbs", () => {
    const run = () => {
      const world = install();
      toLevel(world);
      haulLevel(world);
      for (let i = 0; i < TPB * 3; i += 1) tick(world);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
