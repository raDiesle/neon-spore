import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type GaugeState, ticksPerBeat } from "@neon-spore/sim";
import { type Dial, drawGauge } from "../src/gauge.js";
import {
  callAge,
  cannonPose,
  gaugeAimShown,
  gaugeScarLeft,
  gaugeShotOut,
  gaugeWoundGrown,
} from "../src/gauge-shot.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What a call looks like (`gauge-shot.ts`): the cannon fires, and the shot
 * lands in the wound or on the armour. Held to the claims a pair would notice
 * were wrong — a shot that starts half over, a hit nobody on the pilot's
 * screen can see, a miss that looks like one, and a shot still out when the
 * next call can be made.
 */

beforeAll(installCanvasGlobals);

const DIAL: Dial = { cx: 200, cy: 400, r: 160 };
const BEAT = ticksPerBeat(CFG);

function called(good: boolean, tick = 1000): GaugeState {
  return {
    needleMilli: 400,
    markMilli: good ? 700 : 900,
    calledMilli: 400,
    calledBeat: 13,
    calledTick: tick,
    calledGood: good,
    marks: good ? 1 : 0,
    boundBeat: -1,
    openThumb: false,
  } as unknown as GaugeState;
}

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
  drawGauge(spy, DIAL, CFG, g, { showMarks: false, beatPhase: 0.9, tick, time: 1 });
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
    const g = called(true);
    expect(callAge(CFG, g, 1000)).toBe(0);
    expect(callAge(CFG, g, 1000 + BEAT)).toBeCloseTo(1, 9);
    expect(callAge(CFG, { ...g, calledMilli: -1 }, 1000)).toBe(Number.POSITIVE_INFINITY);
  });

  it("kicks the cannon back when it fires, with the aim line faded", () => {
    const g = called(true);
    expect(cannonPose(g, 0).recoil).toBe(1);
    expect(cannonPose(g, 0).aimMilli).toBe(g.needleMilli);
    expect(gaugeAimShown(0.1)).toBeLessThan(0.5);
  });

  it("bursts on both screens when it lands, and not when it misses", () => {
    const at = 1000 + Math.round(BEAT * 0.5);
    expect(ringsOnPilot(called(true), at)).toBeGreaterThan(0);
    expect(ringsOnPilot(called(false), at)).toBe(0);
  });

  it("rattles the cannon on a miss and holds it still on a hit", () => {
    const at = 0.6;
    expect(cannonPose(called(false), at).aimMilli).not.toBe(400);
    expect(cannonPose(called(true), at).aimMilli).toBe(400);
  });

  it("is over, and a fresh wound open, before the next call can be made", () => {
    for (const good of [true, false]) {
      const g = { ...called(good), needleMilli: 520 };
      const rest = CFG.gaugeCallRestBeats;
      expect(cannonPose(g, rest)).toEqual({ aimMilli: 520, recoil: 0 });
      expect(gaugeAimShown(rest)).toBe(1);
      expect(gaugeWoundGrown(g, rest)).toBe(1);
      expect(gaugeScarLeft(g, rest)).toBe(0);
      expect(gaugeShotOut(CFG, g, 1000 + rest * BEAT)).toBe(false);
    }
  });
});
