import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { GAUGE_FULL, type GaugeState, gaugeGape, ticksPerBeat } from "@neon-spore/sim";
import type { Dial } from "../src/gauge.js";
import { rimRadius } from "../src/gauge-alien.js";
import { gaugeGapeShown, gaugeOpenDial, RIM_STEP } from "../src/gauge-gape.js";
import { drawGaugeMirage, gaugeMirageShown } from "../src/gauge-mirage.js";
import { shotClock } from "../src/gauge-shot.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GAUGE's mouth opening and the pilot's mirage (`gauge-gape.ts`,
 * `gauge-mirage.ts`; the owner, 2 October 2026). Held to what a pair would
 * see: the rim standing further off the cannon a step per level, the step
 * taken on the landing of the mark that finished it and not before — never on
 * a miss, which loses the round (the owner's rule for every boss, 2 October
 * 2026) — and a sweep on his
 * screen that comes only while the round waits on her call and whose colours
 * say nothing about the wound.
 */

beforeAll(installCanvasGlobals);

const DIAL: Dial = { cx: 200, cy: 400, r: 160 };
const TPB = ticksPerBeat(CFG);

function gauge(over: Partial<GaugeState> = {}): GaugeState {
  return {
    phase: "play",
    level: 0,
    marks: 0,
    misses: 0,
    valve: 0,
    calledMilli: -1,
    calledGood: false,
    calledTick: -1_000_000,
    shotTick: -1,
    regrowBeat: -1,
    woundBeat: 0,
    woundColor: "red",
    looseTooth: -1,
    pulledTeeth: 0,
    tongueOut: false,
    ...over,
  } as unknown as GaugeState;
}

/** The opening a frame `ticks` after the shot landed would show. */
function shownAfter(g: GaugeState, ticks: number): number {
  const landed = g.calledTick + CFG.gaugeShotTicks;
  return gaugeGapeShown(CFG, g, shotClock(CFG, g, landed + ticks, 0, 0));
}

describe("THE GAUGE's mouth, opening", () => {
  it("stands the rim a step further off the cannon for every level", () => {
    const shut = rimRadius(DIAL, GAUGE_FULL / 2);
    const open = gauge({ level: 3 });
    expect(gaugeGape(open)).toBe(3);
    const wide = rimRadius(gaugeOpenDial(DIAL, gaugeGape(open)), GAUGE_FULL / 2);
    expect(wide / shut).toBeCloseTo(1 + (3 * RIM_STEP) / 0.97, 6);
  });

  it("takes the step on the landing of the mark that opened it, and settles there", () => {
    const g = gauge({
      level: 1,
      marks: CFG.gaugeLevelMarks,
      calledGood: true,
      calledMilli: 300,
      calledTick: 1000,
    });
    expect(shownAfter(g, 0)).toBeCloseTo(0, 6);
    // A gulp: past the step on the way, never short of it at the end.
    const peak = Math.max(...Array.from({ length: TPB }, (_, i) => shownAfter(g, i)));
    expect(peak).toBeGreaterThan(1);
    expect(shownAfter(g, TPB * 2)).toBe(1);
    // With the next bolt in the air it is the opening that bolt left from.
    const flying = { ...g, shotTick: 1100, calledTick: 1055 };
    expect(gaugeGapeShown(CFG, flying, shotClock(CFG, flying, 1060, 0, 0))).toBe(1);
  });

  it("does not gulp on a mark that leaves the mouth where it was, nor on a miss", () => {
    const g = gauge({ marks: 1, calledGood: true, calledMilli: 300, calledTick: 1000 });
    expect(shownAfter(g, 0)).toBe(0);
    const missed = gauge({ misses: 1, calledMilli: 300, calledTick: 1000 });
    expect(shownAfter(missed, 0)).toBe(0);
    expect(shownAfter(missed, TPB)).toBe(0);
  });
});

describe("THE GAUGE's mirage", () => {
  it("comes only while the round waits on her call", () => {
    expect(gaugeMirageShown(gauge())).toBe(true);
    expect(gaugeMirageShown(gauge({ valve: 1 }))).toBe(false);
    expect(gaugeMirageShown(gauge({ shotTick: 50 }))).toBe(false);
    expect(gaugeMirageShown(gauge({ regrowBeat: 9 }))).toBe(false);
    expect(gaugeMirageShown(gauge({ looseTooth: 4 }))).toBe(false);
    expect(gaugeMirageShown(gauge({ tongueOut: true }))).toBe(false);
    expect(gaugeMirageShown(gauge({ phase: "verdict" }))).toBe(false);
  });

  it("lights both colours over a few passes, whatever colour the wound is", () => {
    const fills = (g: GaugeState): string[] => {
      const seen: string[] = [];
      for (let i = 0; i < 40; i++) {
        const { ctx } = stubCanvas();
        const spy = new Proxy(ctx, {
          set(target, prop, value) {
            if (prop === "fillStyle") seen.push(String(value));
            return Reflect.set(target, prop, value);
          },
          get(target, prop) {
            const v = Reflect.get(target, prop);
            return typeof v === "function" ? v.bind(target) : v;
          },
        }) as unknown as CanvasRenderingContext2D;
        drawGaugeMirage(spy, DIAL, g, i * 0.137);
      }
      return seen;
    };
    const red = fills(gauge({ woundColor: "red" }));
    expect(red).toContain(PALETTE.red);
    expect(red).toContain(PALETTE.cyan);
    expect(fills(gauge({ woundColor: "cyan" }))).toEqual(red);
  });
});
