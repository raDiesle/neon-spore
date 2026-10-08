import { describe, expect, it } from "bun:test";
import {
  trapezeAngle,
  trapezeCaller,
  trapezeInward,
  trapezeOnSide,
  trapezePeriod,
  trapezeSeat,
} from "../src/trapeze.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  CFG,
  install,
  MID,
  runUntil,
  SCRIPT,
  swingUp,
  swipe,
  TPB,
  tick,
  toLevel,
  toWindow,
  trapeze,
} from "./trapeze-rig.js";

/**
 * THE TRAPEZE's swing and its swipes (§39, the owner's rework of 7 October
 * 2026): it swings on its own and dies down, a swipe on time pushes it higher
 * and one while it goes out slows it, a swipe that does nothing says why,
 * the gong is kicked at the end of the swing, and a level run out is the wave.
 * The shots are `trapeze-shots.test.ts`.
 */

describe("the swing", () => {
  it("goes left and right of the middle, once a period", () => {
    const world = install();
    let left = false;
    let right = false;
    for (let i = 0; i < trapezePeriod(CFG); i += 1) {
      tick(world);
      const x = trapezeSeat(CFG, trapeze(world)).xMilli;
      left ||= x < MID * 1000 - 500;
      right ||= x > MID * 1000 + 500;
    }
    expect(left && right).toBe(true);
  });

  it("dies down a little every beat when nobody pushes", () => {
    const world = install();
    const before = trapeze(world).ampMilli;
    runUntil(world, (w) => w.beat >= 4);
    expect(trapeze(world).ampMilli).toBe(before - 4 * CFG.trapezeDampMilli);
  });

  it("is on the right at the start of its period and on the left at the half", () => {
    const world = install();
    expect(trapezeAngle(CFG, trapeze(world))).toBeGreaterThan(0);
    runUntil(world, (w) => trapeze(w).swingTick === trapezePeriod(CFG) / 2);
    expect(trapezeAngle(CFG, trapeze(world))).toBeLessThan(0);
  });
});

describe("a swipe", () => {
  it("on time pushes the swing higher, once a half swing", () => {
    const world = install();
    toLevel(world);
    toWindow(world, -1);
    const before = trapeze(world).ampMilli;
    expect(swipe(world, 1, -1)).toContain("trapezePush");
    expect(trapeze(world).ampMilli).toBe(before + CFG.trapezePushMilli);
    expect(swipe(world, 1, -1)).toContain("trapezeWhiff");
  });

  it("while the swing goes out slows it", () => {
    const world = install();
    toLevel(world);
    runUntil(
      world,
      (w) => trapezeOnSide(w.cfg, trapeze(w)) === -1 && !trapezeInward(w.cfg, trapeze(w)),
    );
    const before = trapeze(world).ampMilli;
    expect(swipe(world, 1, -1)).toContain("trapezeBrake");
    expect(trapeze(world).ampMilli).toBe(before - CFG.trapezeBrakeMilli);
  });

  it("from the wrong seat, the wrong way, or on the far side does nothing, and says so", () => {
    const world = install();
    toLevel(world);
    toWindow(world, -1);
    const whys = () =>
      world.events.filter((e) => e.type === "trapezeWhiff").map((e) => ("why" in e ? e.why : ""));
    swipe(world, 2, -1);
    expect(whys()).toEqual(["seat"]);
    swipe(world, 1, -1, -600);
    expect(whys()).toEqual(["way"]);
    swipe(world, 2, 1);
    expect(whys()).toEqual(["time"]);
  });

  it("does nothing before a level lights", () => {
    const world = install();
    expect(swipe(world, 1, -1)).not.toContain("trapezeWhiff");
  });
});

describe("the gong", () => {
  it("is kicked at the end of the swing on its side once the swing reaches it", () => {
    const world = install();
    toLevel(world);
    const seen = swingUp(world);
    expect(seen.has("trapezeGong")).toBe(true);
    const s = trapeze(world);
    expect(s.gongs).toBe(1);
    expect(s.phase).toBe("rest");
    expect(trapezeAngle(CFG, s)).toBeGreaterThan(0);
  });

  it("leaves half the swing, and the next level lights after a rest", () => {
    const world = install();
    toLevel(world);
    swingUp(world);
    expect(trapeze(world).ampMilli).toBeLessThan(SCRIPT[0]!.gongMilli);
    runUntil(world, (w) => trapeze(w).phase === "level", CFG.trapezeRestBeats + 1);
    expect(trapeze(world).cursor).toBe(1);
  });
});

describe("a call level", () => {
  it("draws who pushes each side as the swing heads there", () => {
    const world = install([{ ask: "call", gongSide: -1, gongMilli: 20000, beats: 40 }], 7);
    toLevel(world);
    const calls: string[] = [];
    runUntil(world, (w) => {
      for (const e of w.events) if (e.type === "trapezeCall") calls.push(`${e.zone}:${e.seat}`);
      return calls.length >= 8;
    });
    expect(new Set(calls.map((c) => c.split(":")[1])).size).toBe(2);
    const [zone, seat] = (calls.at(-1) ?? "").split(":");
    const side: -1 | 1 = zone === "-1" ? -1 : 1;
    expect(trapezeCaller(trapeze(world), side)).toBe(seat === "1" ? 1 : 0);
  });

  it("is played to its gong by whoever is called", () => {
    const world = install([{ ask: "call", gongSide: -1, gongMilli: 14000, beats: 40 }], 3);
    toLevel(world);
    expect(swingUp(world).has("trapezeGong")).toBe(true);
  });
});

describe("a level run out", () => {
  it("is the alien at the hull, and the wave", () => {
    const world = install();
    toLevel(world);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, SCRIPT[0]!.beats + 4);
    expect(seen.has("trapezeMiss")).toBe(true);
  });
});

describe("the whole script", () => {
  it("swipes cannot answer a shooting level", () => {
    const world = install([{ ask: "shoot", gongSide: 1, gongMilli: 16000, beats: 48 }]);
    toLevel(world);
    runUntil(world, (w) => w.tick % TPB === 0);
    expect(swipe(world, 1, -1)).not.toContain("trapezePush");
  });
});
