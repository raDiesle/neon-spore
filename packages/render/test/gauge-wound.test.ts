import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { GAUGE_FULL, type GaugeState } from "@neon-spore/sim";
import { type Dial, drawGaugeFoe, gaugeBandMid, gaugeNeedleTip } from "../src/gauge.js";
import { rimRadius } from "../src/gauge-alien.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GAUGE as an alien with a wound in its mouth (`gauge-wound.ts`), held to
 * the one claim the picture makes: **a shot lands in the flesh on exactly the
 * calls that land.** The round's arithmetic is the sim's and did not move;
 * what can be wrong here is a wound cut wider or narrower than the span, or
 * standing somewhere other than where the mark is read.
 */

beforeAll(installCanvasGlobals);

const DIAL: Dial = { cx: 200, cy: 400, r: 160 };

/** The angle a point stands at about the pivot, in the dial's own thousandths. */
function milliAt(p: { x: number; y: number }): number {
  const a = Math.atan2(p.y - DIAL.cy, p.x - DIAL.cx);
  return ((a < 0 ? a + Math.PI * 2 : a) / Math.PI - 1) * GAUGE_FULL;
}

function gauge(over: Partial<GaugeState> = {}): GaugeState {
  return {
    needleMilli: 300,
    markMilli: 640,
    calledMilli: -1,
    calledBeat: 0,
    calledTick: 0,
    calledGood: false,
    marks: 0,
    boundBeat: -1,
    openThumb: false,
    ...over,
  } as unknown as GaugeState;
}

/** Every `fillStyle` the foe sets, and the points of every `lineTo` it draws. */
function watch(g: GaugeState, showMarks: boolean): { fills: string[]; ends: number[] } {
  const { ctx } = stubCanvas();
  const fills: string[] = [];
  const ends: number[] = [];
  const spy = new Proxy(ctx, {
    set(target, prop, value) {
      if (prop === "fillStyle") fills.push(String(value));
      return Reflect.set(target, prop, value);
    },
    get(target, prop) {
      const v = Reflect.get(target, prop);
      if (prop === "lineTo") {
        return (x: number, y: number) => {
          ends.push(milliAt({ x, y }));
          return (v as (x: number, y: number) => void).call(target, x, y);
        };
      }
      return typeof v === "function" ? v.bind(target) : v;
    },
  }) as unknown as CanvasRenderingContext2D;
  drawGaugeFoe(spy, DIAL, CFG, g, { showMarks, beatPhase: 0.3, tick: 300, time: 1 });
  return { fills, ends };
}

describe("THE GAUGE's wound", () => {
  it("stands where the mark is, on the rim, and the aim where the needle is", () => {
    for (const milli of [0, 137, 500, 861, GAUGE_FULL]) {
      const g = gauge({ needleMilli: milli, markMilli: milli });
      const mid = gaugeBandMid(DIAL, g);
      expect(Math.hypot(mid.x - DIAL.cx, mid.y - DIAL.cy)).toBeCloseTo(rimRadius(DIAL, milli), 6);
      expect(milliAt(mid)).toBeCloseTo(milli, 3);
      expect(milliAt(gaugeNeedleTip(DIAL, g))).toBeCloseTo(milli, 3);
    }
  });

  it("is cut square along the two rays that are the span's ends", () => {
    const g = gauge();
    const { ends } = watch(g, true);
    const span = CFG.gaugeSpanMilli;
    // The torn edges are two strokes along a ray each, so both of their
    // points stand at the span's own angle about the pivot.
    for (const edge of [g.markMilli - span, g.markMilli + span]) {
      expect(ends.some((m) => Math.abs(m - edge) < 0.01)).toBe(true);
    }
  });

  it("is in the loaded colour, on the navigator's screen and nowhere on the pilot's", () => {
    expect(watch(gauge(), true).fills).toContain(PALETTE.cyanDark);
    expect(watch(gauge({ marks: 1 }), true).fills).toContain(PALETTE.redDark);
    expect(watch(gauge(), false).fills).not.toContain(PALETTE.cyanDark);
    expect(watch(gauge({ marks: 1 }), false).fills).not.toContain(PALETTE.redDark);
  });
});
