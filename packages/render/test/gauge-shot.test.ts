import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type GaugeState, ticksPerBeat } from "@neon-spore/sim";
import { type Dial, drawGauge } from "../src/gauge.js";
import {
  cannonPose,
  gaugeAimShown,
  gaugeScarLeft,
  gaugeShotOut,
  gaugeWoundGrown,
  shotClock,
} from "../src/gauge-shot.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What a call looks like (`gauge-shot.ts`): the cannon fires, the bolt flies,
 * and it lands in the wound or on the armour. Held to the claims a pair would
 * notice were wrong — a shot that starts half over, an answer shown before the
 * bolt is there, a hit nobody on the pilot's screen can see, a miss that looks
 * like one, and a shot still out when the next call can be made.
 */

beforeAll(installCanvasGlobals);

const DIAL: Dial = { cx: 200, cy: 400, r: 160 };
const BEAT = ticksPerBeat(CFG);
const FLIGHT = CFG.gaugeShotTicks;

/**
 * A call made on tick 1000, `after` ticks ago. Before `FLIGHT` the bolt is in
 * the air and nothing is judged; after it, a hit has shot the wound out and the
 * rim is bare, and a miss has left the wound standing.
 */
function called(good: boolean, after: number): GaugeState {
  const flying = after < FLIGHT;
  return {
    needleMilli: 400,
    markMilli: 400,
    calledMilli: 400,
    calledBeat: 13,
    calledTick: 1000,
    calledGood: !flying && good,
    marks: !flying && good ? 1 : 0,
    boundBeat: -1,
    openThumb: false,
    shotTick: flying ? 1000 + FLIGHT : -1,
    regrowBeat: !flying && good ? 16 : -1,
    woundBeat: 2,
  } as unknown as GaugeState;
}

const clock = (g: GaugeState, after: number, beat = 14, phase = 0) =>
  shotClock(CFG, g, 1000 + after, beat, phase);

/** How many times the hit's green ring goes down on the pilot's screen. */
function ringsOnPilot(g: GaugeState, tick: number): number {
  const { ctx } = stubCanvas();
  let rings = 0;
  const spy = new Proxy(ctx, {
    set(target, prop, value) {
      if (prop === "strokeStyle" && String(value).startsWith("rgba(") && isGood(String(value)))
        rings++;
      return Reflect.set(target, prop, value);
    },
    get(target, prop) {
      const v = Reflect.get(target, prop);
      return typeof v === "function" ? v.bind(target) : v;
    },
  }) as unknown as CanvasRenderingContext2D;
  drawGauge(spy, DIAL, CFG, g, {
    showMarks: false,
    showValve: true,
    tile: 40,
    beatPhase: 0.9,
    beat: 14,
    tick,
    time: 1,
  });
  return rings;
}

/** Whether an `rgba()` string is `PALETTE.good` at some alpha. */
function isGood(rgba: string): boolean {
  const hex = PALETTE.good.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
  return rgba.replace(/\s/g, "").startsWith(`rgba(${r},${g},${b},`);
}

describe("THE GAUGE's shot", () => {
  it("is timed from its own tick, so a call late in a beat still flies", () => {
    const g = called(true, 0);
    expect(clock(g, 0).age).toBe(0);
    expect(clock(g, BEAT).age).toBeCloseTo(1, 9);
    expect(clock({ ...g, calledMilli: -1 }, 0).age).toBe(Number.POSITIVE_INFINITY);
  });

  it("kicks the cannon back when it fires, with the aim line faded", () => {
    const g = called(true, 0);
    expect(cannonPose(g, clock(g, 0)).recoil).toBe(1);
    expect(cannonPose(g, clock(g, 0)).aimMilli).toBe(g.needleMilli);
    expect(gaugeAimShown(clock(g, 5))).toBeLessThan(0.5);
  });

  it("leaves the wound standing until the bolt is there", () => {
    const g = called(true, FLIGHT - 1);
    expect(clock(g, FLIGHT - 1).flying).toBe(true);
    expect(gaugeWoundGrown(g, clock(g, FLIGHT - 1))).toBe(1);
    expect(gaugeScarLeft(g, clock(g, FLIGHT - 1))).toBe(0);
    expect(ringsOnPilot(g, 1000 + FLIGHT - 1)).toBe(0);
  });

  it("bursts on both screens when it lands, and not when it misses", () => {
    const after = FLIGHT + Math.round(BEAT * 0.2);
    expect(ringsOnPilot(called(true, after), 1000 + after)).toBeGreaterThan(0);
    expect(ringsOnPilot(called(false, after), 1000 + after)).toBe(0);
  });

  it("caves the shot-out wound in, and grows the next from the beat it opened", () => {
    const hit = called(true, FLIGHT);
    expect(gaugeWoundGrown(hit, clock(hit, FLIGHT))).toBe(1);
    expect(gaugeWoundGrown(hit, clock(hit, FLIGHT + BEAT))).toBe(0);
    const fresh = { ...hit, regrowBeat: -1, woundBeat: 16 };
    expect(gaugeWoundGrown(fresh, clock(fresh, FLIGHT, 16, 0))).toBe(0);
    expect(gaugeWoundGrown(fresh, clock(fresh, FLIGHT, 17, 0))).toBe(1);
  });

  it("rattles the cannon on a miss and holds it still on a hit", () => {
    const after = FLIGHT + Math.round(BEAT * 0.3);
    expect(cannonPose(called(false, after), clock(called(false, after), after)).aimMilli).not.toBe(
      400,
    );
    expect(cannonPose(called(true, after), clock(called(true, after), after)).aimMilli).toBe(400);
  });

  it("is over before the next call can be made", () => {
    for (const good of [true, false]) {
      const after = CFG.gaugeCallRestBeats * BEAT;
      const g = { ...called(good, after), needleMilli: 520 };
      const c = clock(g, after);
      expect(cannonPose(g, c)).toEqual({ aimMilli: 520, recoil: 0 });
      expect(gaugeAimShown(c)).toBe(1);
      expect(gaugeScarLeft(g, c)).toBe(0);
      expect(gaugeShotOut(c)).toBe(false);
    }
  });
});
