import { describe, expect, it } from "bun:test";
import { hashWorld, mantlePairsLeft, NO_SPARK } from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import { beat, CFG, install, lit, mantle, pull, runTo, tapCore, toFinale } from "./mantle-rig.js";

/**
 * THE MANTLE: a hinged shell pried open by two hands pulling together.
 *
 * What these pin is the rule a phone cannot show. That a pull only counts
 * once **both** handles clear the floor at once — one thumb at maximum while
 * the other sits at nought shears nothing. That letting go costs the whole
 * pull, at once, with no drift to bank progress against. That the second
 * shear leaks a spark that reaches the hull unanswered, and either colour
 * answers it. That the last pair splits the shell and hands the fight to an
 * alternating single tap, which the wrong seat's thumb cannot touch. The
 * brace before the last pair: `mantle-brace.test.ts`.
 */

describe("THE MANTLE comes in", () => {
  it("closed, dark and still, with every pair on the shell", () => {
    const world = install();
    const s = mantle(world);
    expect(s.phase).toBe("still");
    expect(s.cursor).toBe(0);
    expect(mantlePairsLeft(s)).toBe(2);
    expect(s.depthMilli).toEqual([0, 0]);
    expect(s.sparkCol).toBe(NO_SPARK);
    expect(world.events.some((e) => e.type === "mantleEnter")).toBe(true);
  });

  it("and lights the first movement's handles after its still", () => {
    const world = install();
    expect(lit(world).has("mantleLight")).toBe(true);
    expect(mantle(world).phase).toBe("pull");
  });
});

describe("a pull only counts with both handles past the floor at once", () => {
  it("so one handle at maximum and the other at nought shears nothing", () => {
    const world = install();
    lit(world);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 2000)]);
    expect(beat(world, 5).has("mantleShear")).toBe(false);
    expect(mantle(world).phase).toBe("pull");
  });

  it("and both past the floor, summing past the threshold, shears a pair", () => {
    const world = install();
    lit(world);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 800), pull(t, 2, 800)]);
    expect(beat(world).has("mantleShear")).toBe(true);
    const s = mantle(world);
    expect(mantlePairsLeft(s)).toBe(1);
    expect(world.slowToBeat).toBeGreaterThan(world.beat);
  });
});

describe("letting go", () => {
  it("resets that handle to nought at once, with no drift to bank", () => {
    const world = install();
    lit(world);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 900)]);
    expect(mantle(world).depthMilli[0]).toBe(900);
    runTo(world, t + 2, [pull(t + 1, 1, 900, false)]);
    expect(mantle(world).depthMilli[0]).toBe(0);
  });
});

describe("the second shear leaks a spark", () => {
  // Three thresholds, so the second shear (cursor reaching 2) is not also the
  // last: the leak sits between the second and third movements, never on the
  // shear that splits the shell.
  const THREE = [1400, 1700, 1900];

  it("that reaches the hull unanswered after mantleSparkBeats", () => {
    const world = install(THREE);
    lit(world);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 800), pull(t, 2, 800)]);
    beat(world); // first shear
    lit(world);
    const t2 = world.tick;
    runTo(world, t2 + 1, [pull(t2, 1, 900), pull(t2, 2, 900)]);
    const shear = beat(world);
    expect(shear.has("mantleShear")).toBe(true);
    expect(shear.has("mantleLeak")).toBe(true);
    expect(mantle(world).sparkCol).not.toBe(NO_SPARK);
    const seen = beat(world, CFG.mantleSparkBeats + 1);
    expect(seen.has("mantleSparkHit")).toBe(true);
    // The buckle left bulging tears on the same beat and leaks another, so the
    // strike is read off the wave rather than off an empty seam.
    expect(world.failTick).not.toBe(NOT_FAILED);
  });

  it("and nothing strikes the pair for taking as long as they like otherwise", () => {
    const world = install(THREE);
    lit(world);
    const seen = beat(world, 20);
    expect(seen.has("mantleSparkHit")).toBe(false);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the last pair splits the shell", () => {
  it("and hands the fight to an alternating tap the wrong seat cannot touch", () => {
    const world = install();
    toFinale(world);
    const s = mantle(world);
    expect(s.phase).toBe("heartbeat");
    expect(s.heartbeatNext).toBe(0);
    const t = world.tick;
    // Player 2 goes first: wrong seat, refused silently.
    runTo(world, t + 1, [tapCore(t, 2)]);
    expect(mantle(world).heartbeatDone).toBe(0);
    const t2 = world.tick;
    runTo(world, t2 + 1, [tapCore(t2, 1)]);
    expect(mantle(world).heartbeatDone).toBe(1);
    expect(mantle(world).heartbeatNext).toBe(1);
  });

  it("and the last tap darkens the core and ends the fight", () => {
    const world = install();
    toFinale(world);
    let next: 1 | 2 = 1;
    for (let i = 0; i < CFG.mantleHeartbeatTaps; i++) {
      const t = world.tick;
      runTo(world, t + 1, [tapCore(t, next)]);
      next = next === 1 ? 2 : 1;
    }
    expect(mantle(world).phase).toBe("dark");
    const seen = beat(world, CFG.mantleOpenBeats + 1);
    expect(seen.has("mantleOut")).toBe(true);
    expect(world.boss).toBe(null);
  });
});

describe("the fingerprint", () => {
  it("is the same for two runs given the same thumbs", () => {
    const run = (): number => {
      const world = install();
      lit(world);
      const t = world.tick;
      runTo(world, t + 1, [pull(t, 1, 800), pull(t, 2, 800)]);
      beat(world, 4);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });

  it("and differs when one handle sits a step off the other's", () => {
    const stand = (atMilli: number): number => {
      const world = install();
      lit(world);
      const t = world.tick;
      runTo(world, t + 1, [pull(t, 1, atMilli)]);
      return hashWorld(world);
    };
    expect(stand(800)).not.toBe(stand(801));
  });
});
