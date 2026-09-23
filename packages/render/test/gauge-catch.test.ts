import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type GaugeState, ticksPerBeat } from "@neon-spore/sim";
import { type Dial, drawGauge } from "../src/gauge.js";
import { callAge, clawPose, gaugeLineShown, gaugePodGrown } from "../src/gauge-catch.js";
import { clawAtRest } from "../src/gauge-claw.js";
import { POD_REACH } from "../src/gauge-pod.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What a call looks like (`gauge-catch.ts`): the claw goes out, shuts, and
 * comes back with the pod or with nothing. Held to the claims a pair would
 * notice were wrong — a reach that starts half over, a catch nobody on the
 * pilot's screen can see, a miss that looks like one, and a claw still out
 * when the next call can be made.
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
    boundBeat: -1,
    openThumb: false,
  } as unknown as GaugeState;
}

/** How many times the pod's own dark fill goes down on the pilot's screen. */
function podsOnPilot(g: GaugeState, tick: number): number {
  const { ctx } = stubCanvas();
  let fills = 0;
  const spy = new Proxy(ctx, {
    set(target, prop, value) {
      if (prop === "fillStyle" && value === PALETTE.podDark) fills++;
      return Reflect.set(target, prop, value);
    },
    get(target, prop) {
      const v = Reflect.get(target, prop);
      return typeof v === "function" ? v.bind(target) : v;
    },
  }) as unknown as CanvasRenderingContext2D;
  drawGauge(spy, DIAL, CFG, g, { showMarks: false, beatPhase: 0.9, tick });
  return fills;
}

describe("THE GAUGE's call", () => {
  it("is timed from its own tick, so a call late in a beat still reaches", () => {
    const g = called(true);
    expect(callAge(CFG, g, 1000)).toBe(0);
    expect(callAge(CFG, g, 1000 + BEAT)).toBeCloseTo(1, 9);
    expect(callAge(CFG, { ...g, calledMilli: -1 }, 1000)).toBe(Number.POSITIVE_INFINITY);
  });

  it("sends the hand out to the pod along the called line, with the line hidden", () => {
    const g = called(true);
    const out = clawPose(DIAL, g, 0.4);
    expect(out.aimMilli).toBe(g.calledMilli);
    expect(out.length).toBeGreaterThan(DIAL.r * POD_REACH * 0.8);
    expect(gaugeLineShown(0.4)).toBe(0);
  });

  it("brings a pod home on both screens when it lands, and none when it misses", () => {
    expect(podsOnPilot(called(true), 1000 + Math.round(BEAT * 0.8))).toBe(1);
    expect(podsOnPilot(called(false), 1000 + Math.round(BEAT * 0.8))).toBe(0);
  });

  it("shuts tighter on nothing than on a pod", () => {
    const at = 0.8;
    expect(clawPose(DIAL, called(false), at).out).toBeLessThan(
      clawPose(DIAL, called(true), at).out,
    );
  });

  it("is home, open and pointing at the needle before the next call can be made", () => {
    for (const good of [true, false]) {
      const g = { ...called(good), needleMilli: 520 };
      const home = clawPose(DIAL, g, CFG.gaugeCallRestBeats);
      expect(home).toEqual(clawAtRest(DIAL, 520));
      expect(gaugeLineShown(CFG.gaugeCallRestBeats)).toBe(1);
      expect(gaugePodGrown(g, CFG.gaugeCallRestBeats)).toBe(1);
    }
  });
});
