import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { emberHues, RING_MIN } from "../src/aim-ember.js";
import type { BossCue } from "../src/boss-cue-shape.js";
import {
  AIM_LOOK,
  cueAim,
  cueDrawnAt,
  cueHelper,
  drawCueHelper,
  markIsHere,
} from "../src/cue-helper.js";
import { PALETTE } from "../src/palette.js";
import { drawPullKnob } from "../src/pull-knob.js";
import { rubArrows } from "../src/rub-mark.js";
import { P2_SKIN } from "../src/seat-skin.js";
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
    expect(cueHelper("HOLD")).toBe("hold");
    expect(cueHelper("HOLD BOTH")).toBe("hold");
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

  it("draws the word and its box on the target, not on the cannon", () => {
    const moved = cueDrawnAt(
      cue("FIRE", 100, HULL, { aim: { x: 300, y: 150 }, roomBelow: 9 }),
      HULL,
    );
    expect([moved.x, moved.y, moved.roomBelow]).toEqual([300, 150, undefined]);
    // The box grows to hold a big crosshair's ticks, and never shrinks.
    const big = cueDrawnAt(cue("FIRE", 100, HULL, { aim: { x: 300, y: 150, r: 40 } }), HULL);
    expect(big.halfW).toBeGreaterThan(40 * 1.75);
    expect(big.halfH).toBeGreaterThan(40 * 1.75);
    expect(cueDrawnAt(cue("FIRE", 100, HULL), HULL).x).toBe(100);
    expect(cueDrawnAt(cue("RUB", 100, 200, { aim: { x: 300, y: 150 } }), HULL).x).toBe(100);
  });

  it("hands the aim look this screen's seat, and grows a word that is its own aim to hold it", () => {
    const paint = AIM_LOOK.paint;
    const tints: string[] = [];
    AIM_LOOK.paint = (_ctx, _x, _y, _r, _k, _t, skin) => {
      tints.push(skin.tint);
    };
    try {
      log((ctx) => drawCueHelper(ctx, cue("FIRE", 120, 240), HULL, 0, P2_SKIN));
    } finally {
      AIM_LOOK.paint = paint;
    }
    expect(tints).toEqual([P2_SKIN.tint]);
    // EMBER reaches further than the crosshair before it: the frame grows round
    // its own place, and the ring stays the size the frame first gave it.
    const own = cue("FIRE", 120, 240);
    const wide = cueDrawnAt(own, HULL);
    expect([wide.x, wide.y]).toEqual([own.x, own.y]);
    expect(wide.halfH).toBeGreaterThan(own.halfH);
    expect(wide.aim?.r).toBe(Math.min(own.halfW, own.halfH) * 0.55);
  });

  it("draws the mark in the fire button's red, or the colour the cue asks", () => {
    const red = log((ctx) =>
      drawCueHelper(ctx, cue("FIRE", 100, HULL, { aim: { x: 300, y: 150 } }), HULL, 0),
    );
    const cyan = log((ctx) =>
      drawCueHelper(
        ctx,
        cue("FIRE", 100, HULL, { aim: { x: 300, y: 150 }, tint: "cyan" }),
        HULL,
        0,
      ),
    );
    expect(red.length).toBeGreaterThan(0);
    expect(red).toEqual(cyan);
    expect(emberHues().hex).toBe(PALETTE.red);
    expect(emberHues("cyan").hex).toBe(PALETTE.cyan);
  });

  it("draws the mark on the aim, not on the word, and round the target, never under it", () => {
    const paint = AIM_LOOK.paint;
    const at: number[][] = [];
    AIM_LOOK.paint = (_ctx, x, y) => {
      at.push([x, y]);
    };
    try {
      log((ctx) =>
        drawCueHelper(ctx, cue("FIRE", 100, HULL, { aim: { x: 300, y: 150 } }), HULL, 0),
      );
      log((ctx) => drawCueHelper(ctx, cue("FIRE", 100, HULL), HULL, 0));
    } finally {
      AIM_LOOK.paint = paint;
    }
    expect(at).toEqual([[300, 150]]);
    expect(RING_MIN).toBeGreaterThan(1.1);
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

describe("a hold's circle", () => {
  it("stands in the scan frame's place: a red circle with a thumbprint, and no box", () => {
    expect(markIsHere(cue("HOLD", 100, 200, { kind: "HOLD" }))).toBe(true);
    expect(markIsHere(cue("SHIELD", 100, 200))).toBe(false);
    expect(markIsHere(cue("FIRE", 100, 200))).toBe(false);
    const calls = log((ctx) =>
      drawCueHelper(ctx, cue("HOLD", 100, 200, { kind: "HOLD" }), HULL, 0),
    );
    // The ring, and the print's ridges inside it: arcs and ellipses, never a rectangle.
    expect(calls.some((c) => c.startsWith("ellipse("))).toBe(true);
    expect(calls.some((c) => c.startsWith("strokeRect(") || c.startsWith("rect("))).toBe(false);
  });
});

describe("a rub's line", () => {
  it("stands in the scan frame's place, with no box", () => {
    expect(cueHelper("RUB")).toBe("rub");
    expect(markIsHere(cue("RUB", 100, 200, { kind: "CARRY" }))).toBe(true);
    const calls = log((ctx) =>
      drawCueHelper(ctx, cue("RUB", 100, 200, { kind: "CARRY", rubHalf: 60 }), HULL, 0.2),
    );
    expect(calls.some((c) => c.startsWith("stroke("))).toBe(true);
    expect(calls.some((c) => c.startsWith("strokeRect(") || c.startsWith("rect("))).toBe(false);
  });

  it("brings an arrow in from each side toward the line as time runs", () => {
    const early = rubArrows(100, 60, 0.1);
    const late = rubArrows(100, 60, 0.4);
    expect(early.tips[0]).toBeLessThan(100);
    expect(early.tips[1]).toBeGreaterThan(100);
    expect(late.tips[0]).toBeGreaterThan(early.tips[0]);
    expect(late.tips[1]).toBeLessThan(early.tips[1]);
    // Never onto the line itself, and faded out at the loop's seam.
    expect(late.tips[0]).toBeLessThan(100);
    expect(rubArrows(100, 60, 0).alpha).toBeCloseTo(0);
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
