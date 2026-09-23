import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { GAUGE_FULL, type GaugeState } from "@neon-spore/sim";
import { type Dial, drawGauge, gaugeBandMid, gaugeNeedleTip } from "../src/gauge.js";
import { POD_REACH, podHalfWidth } from "../src/gauge-pod.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GAUGE as a claw and a pod (`gauge-claw.ts`), held to the one claim the
 * picture makes: **the dotted line passes inside the pod on exactly the calls
 * that land.** The round's arithmetic is the sim's and did not move; what can
 * be wrong here is a pod drawn wider or narrower than the span it stands for,
 * or standing somewhere other than where the mark is read.
 */

beforeAll(installCanvasGlobals);

const DIAL: Dial = { cx: 200, cy: 400, r: 160 };

/** The angle a point stands at about the pivot, in the dial's own thousandths. */
function milliAt(p: { x: number; y: number }): number {
  const a = Math.atan2(p.y - DIAL.cy, p.x - DIAL.cx);
  return ((a < 0 ? a + Math.PI * 2 : a) / Math.PI - 1) * GAUGE_FULL;
}

describe("THE GAUGE's pod", () => {
  it("is exactly as wide as the span the call is judged against", () => {
    for (const span of [18, 36, 60, 120]) {
      const w = podHalfWidth(DIAL, span);
      // The pod's edge, out along its own tangent from its middle, seen from
      // the pivot, is the span's own angle off the mark's.
      const theta = Math.atan(w / (DIAL.r * POD_REACH));
      expect((theta / Math.PI) * GAUGE_FULL).toBeCloseTo(span, 6);
    }
  });

  it("stands where the mark is, and the line where the needle is", () => {
    for (const milli of [0, 137, 500, 861, GAUGE_FULL]) {
      const g = { needleMilli: milli, markMilli: milli } as GaugeState;
      const mid = gaugeBandMid(DIAL, g);
      expect(Math.hypot(mid.x - DIAL.cx, mid.y - DIAL.cy)).toBeCloseTo(DIAL.r * POD_REACH, 6);
      expect(milliAt(mid)).toBeCloseTo(milli, 3);
      expect(milliAt(gaugeNeedleTip(DIAL, g))).toBeCloseTo(milli, 3);
    }
  });

  it("is on the navigator's screen and nowhere on the pilot's", () => {
    const g = {
      needleMilli: 300,
      markMilli: 640,
      calledMilli: -1,
      calledBeat: 0,
      boundBeat: -1,
      openThumb: false,
    } as unknown as GaugeState;
    const podFills = (showMarks: boolean): number => {
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
      drawGauge(spy, DIAL, CFG, g, { showMarks, beatPhase: 0.3, tick: 300 });
      return fills;
    };
    expect(podFills(true)).toBe(1);
    expect(podFills(false)).toBe(0);
  });
});
