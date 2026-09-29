import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { BossCue } from "../src/boss-cue-shape.js";
import { aimIsHere, cueAim, cueHelper, drawCueHelper } from "../src/cue-helper.js";
import { CROSSHAIR_LOOK } from "../src/instar-crosshair.js";
import { drawPullKnob } from "../src/pull-knob.js";
import { drawWayArrow } from "../src/way-arrow.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The helpers every boss's marks wear** — the owner, 29 September 2026,
 * for all of them: a pull shows its way (`way-arrow.ts`, `pull-knob.ts`), a
 * shot its target, and a shield or a suck the panel's button face
 * (`cue-helper.ts`). Each is drawn into a logging context.
 */

beforeAll(installCanvasGlobals);

const HULL = 500;

function cue(word: string, x: number, y: number, extra: Partial<BossCue> = {}): BossCue {
  return { seat: null, kind: "PRESS", word, x, y, halfW: 40, halfH: 25, seed: 1, ...extra };
}

/** Every call a drawing makes, with its numbers. */
function log(draw: (ctx: CanvasRenderingContext2D) => void): string[] {
  const { ctx } = stubCanvas();
  const calls: string[] = [];
  const recording = new Proxy(ctx, {
    get(target, key) {
      const v = Reflect.get(target, key);
      if (typeof v !== "function") return v;
      return (...args: unknown[]) => {
        const shown = args.map((a) => (typeof a === "number" ? a.toFixed(1) : typeof a));
        if (key !== "save" && key !== "restore") calls.push(`${String(key)}(${shown.join(",")})`);
        return v.apply(target, args);
      };
    },
    set: (target, key, v) => Reflect.set(target, key, v),
  });
  draw(recording as unknown as CanvasRenderingContext2D);
  return calls;
}

describe("the cue's helper", () => {
  it("is read off the first word", () => {
    expect(cueHelper("FIRE")).toBe("aim");
    expect(cueHelper("SHOOT")).toBe("aim");
    expect(cueHelper("FIRE ON ZERO")).toBe("aim");
    expect(cueHelper("SHIELD")).toBe("guard");
    expect(cueHelper("SUCK")).toBe("intake");
    expect(cueHelper("PULL")).toBeNull();
    expect(cueHelper("MOVE")).toBeNull();
  });

  it("aims a shot at its `aim`, at its own place off the hull, and nowhere at the hull without one", () => {
    expect(cueAim(cue("FIRE", 100, HULL, { aim: { x: 100, y: 200 } }), HULL)).toEqual({
      x: 100,
      y: 200,
    });
    expect(cueAim(cue("FIRE", 120, 240), HULL)).toEqual({ x: 120, y: 240 });
    expect(cueAim(cue("FIRE", 100, HULL), HULL)).toBeNull();
    expect(cueAim(cue("SHIELD", 120, 240), HULL)).toBeNull();
  });

  it("draws no scan frame round a crosshair standing on the cue itself", () => {
    expect(aimIsHere(cue("FIRE", 120, 240), HULL)).toBe(true);
    expect(aimIsHere(cue("FIRE", 100, HULL, { aim: { x: 100, y: 200 } }), HULL)).toBe(false);
  });

  it("draws the crosshair on the aim, not on the word", () => {
    const paint = CROSSHAIR_LOOK.paint;
    const at: number[][] = [];
    CROSSHAIR_LOOK.paint = (_ctx, x, y) => {
      at.push([x, y]);
    };
    try {
      log((ctx) =>
        drawCueHelper(ctx, cue("FIRE", 100, HULL, { aim: { x: 300, y: 150 } }), HULL, 0),
      );
      log((ctx) => drawCueHelper(ctx, cue("FIRE", 100, HULL), HULL, 0));
    } finally {
      CROSSHAIR_LOOK.paint = paint;
    }
    expect(at).toEqual([[300, 150]]);
  });

  it("draws a face for SHIELD and SUCK, and a different one for each", () => {
    const shield = log((ctx) => drawCueHelper(ctx, cue("SHIELD", 100, HULL), HULL, 0));
    const suck = log((ctx) => drawCueHelper(ctx, cue("SUCK", 100, HULL), HULL, 0));
    expect(shield.length).toBeGreaterThan(0);
    expect(suck.length).toBeGreaterThan(0);
    expect(shield.join()).not.toBe(suck.join());
    expect(log((ctx) => drawCueHelper(ctx, cue("PULL", 100, HULL), HULL, 0))).toEqual([]);
  });
});

describe("the way a pull goes", () => {
  it("puts the arrow's head the way it is told", () => {
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const) {
      const calls = log((ctx) => drawWayArrow(ctx, 100, 100, 20, dx, dy, 0));
      // The shaft's second point is the tip, half a radius out along the way.
      expect(calls[2]).toBe(`lineTo(${(100 + dx * 10).toFixed(1)},${(100 + dy * 10).toFixed(1)})`);
    }
  });

  it("is on every knob that has a way, and on none that has not", () => {
    const knob = (way: { dx: number; dy: number } | null) =>
      log((ctx) =>
        drawPullKnob(ctx, { x: 100, y: 100 }, 20, {
          hex: "#f00",
          rim: "#f88",
          held: false,
          time: 0,
          way,
        }),
      );
    const withArrow = knob({ dx: 0, dy: 1 });
    const without = knob(null);
    expect(withArrow.filter((c) => c.startsWith("lineTo")).length).toBeGreaterThan(0);
    expect(without.filter((c) => c.startsWith("lineTo"))).toEqual([]);
  });
});
