import { describe, expect, it } from "bun:test";
import { gimbalTeeth, INNER, NO_LET_GO, OUTER } from "../src/index.js";
import {
  CFG,
  carry,
  FIRST,
  gimbal,
  grip,
  install,
  letGoTogether,
  lift,
  lit,
  onFirstMarks,
  runTo,
  TPB,
} from "./gimbal-harness.js";

/**
 * THE GIMBAL's let-go: a tooth shears when both hands come off a true pair
 * within `gimbalLetGoTicks` of each other, and only then (the owner, 3
 * October 2026: *it must match in the exact same moment*).
 *
 * What these pin: the same tick shears; inside the window shears; one tick
 * past it is the slip, billed to the hand that was late, on the tick the
 * window runs out; a hand let go of a ring that is not true opens nothing; a
 * hand put back on closes its own window unbilled; and a ring let go of first
 * does not drift while the other hand is awaited, whatever the beat does.
 */

const types = (events: { type: string }[]): string[] => events.map((e) => e.type);

describe("the let-go", () => {
  it("shears a tooth off each ring when both hands come off on one tick", () => {
    const world = install();
    lit(world);
    onFirstMarks(world);
    expect(types(letGoTogether(world))).toContain("gimbalShear");
    expect(gimbalTeeth(gimbal(world))).toBe(1);
    expect(gimbal(world).phase).toBe("shear");
    expect(gimbal(world).letGoTick).toBe(NO_LET_GO);
  });

  it("and when the second comes off at the very edge of the window", () => {
    const world = install();
    lit(world);
    onFirstMarks(world);
    const t = world.tick;
    const seen = runTo(world, t + CFG.gimbalLetGoTicks + 1, [
      lift(t, 2),
      lift(t + CFG.gimbalLetGoTicks, 1),
    ]);
    expect(types(seen)).toContain("gimbalShear");
  });

  it("but one tick late is the slip, billed to the late hand, as the window runs out", () => {
    const world = install();
    lit(world);
    onFirstMarks(world);
    const t = world.tick;
    const seen = runTo(world, t + CFG.gimbalLetGoTicks + 2, [lift(t, 1)]);
    expect(seen.filter((e) => e.type === "gimbalSlip")).toEqual([
      { type: "gimbalSlip", col: expect.any(Number), outer: false, inner: true },
    ]);
    const after = runTo(world, world.tick + 2, [lift(world.tick, 2)]);
    expect(types(after)).not.toContain("gimbalShear");
    expect(gimbalTeeth(gimbal(world))).toBe(2);
  });

  it("opens nothing when the pair is not true", () => {
    const world = install();
    lit(world);
    carry(world, 1, FIRST.outerMilli);
    carry(world, 2, 100);
    runTo(world, world.tick + TPB);
    const seen = letGoTogether(world);
    expect(types(seen)).not.toContain("gimbalShear");
    expect(types(seen)).not.toContain("gimbalSlip");
    expect(gimbal(world).letGoTick).toBe(NO_LET_GO);
  });

  it("is called off, unbilled, by the first hand going back on", () => {
    const world = install();
    lit(world);
    onFirstMarks(world);
    const t = world.tick;
    const seen = runTo(world, t + CFG.gimbalLetGoTicks + 4, [lift(t, 1), grip(t + 3, 1, 0)]);
    expect(types(seen)).not.toContain("gimbalSlip");
    expect(gimbal(world).letGoTick).toBe(NO_LET_GO);
  });

  it("latches the first ring off its hand: no drift while the other is awaited", () => {
    const world = install(undefined, { gimbalLetGoTicks: TPB * 2 });
    lit(world);
    onFirstMarks(world);
    const at = [...gimbal(world).atMilli] as [number, number];
    const t = world.tick;
    runTo(world, t + TPB + 1, [lift(t, 1)]);
    expect(gimbal(world).letGoRing).toBe(OUTER);
    expect(gimbal(world).atMilli).toEqual(at);
    // Hers comes off a beat later, inside the widened window: still a shear.
    expect(types(runTo(world, world.tick + 1, [lift(world.tick, 2)]))).toContain("gimbalShear");
  });
});

describe("a let-go window is per pair", () => {
  it("and closes when the marks relight", () => {
    const world = install();
    lit(world);
    onFirstMarks(world);
    letGoTogether(world);
    runTo(world, world.tick + TPB * (CFG.gimbalShearBeats + 1));
    const s = gimbal(world);
    expect(s.phase).toBe("turn");
    expect(s.letGoTick).toBe(NO_LET_GO);
    expect(s.letGoRing).toBe(NO_LET_GO);
    expect(s.handMilli[INNER]).toBeLessThan(0);
  });
});
