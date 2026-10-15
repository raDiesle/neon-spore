import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { emberEither, emberHues, paintEmber, RING_MIN } from "../src/aim-ember.js";
import type { BossCue } from "../src/boss-cue-shape.js";
import { drawCueText } from "../src/boss-cue-text.js";
import {
  AIM_LOOK,
  cueAim,
  cueDrawnAt,
  cueHelper,
  drawCueHelper,
  markIsHere,
} from "../src/cue-helper.js";
import { saysTap, tapsAsked } from "../src/handle-word.js";
import { PALETTE } from "../src/palette.js";
import { drawPullKnob } from "../src/pull-knob.js";
import { drawRubZigzag, rubSway } from "../src/rub-zigzag.js";
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

  it("draws the mark in the colour the shot wants, and hands it none where this screen does not know it", () => {
    const paint = AIM_LOOK.paint;
    const shots: (string | undefined)[] = [];
    AIM_LOOK.paint = (_ctx, _x, _y, _r, _k, _t, _skin, _from, shot) => {
      shots.push(shot);
    };
    const aim = { x: 300, y: 150 };
    try {
      for (const extra of [{}, { tint: "cyan" as const }, { shows: "cyan" as const }])
        log((ctx) => drawCueHelper(ctx, cue("FIRE", 100, HULL, { aim, ...extra }), HULL, 0));
    } finally {
      AIM_LOOK.paint = paint;
    }
    expect(shots).toEqual([undefined, "cyan", "cyan"]);
    expect(emberHues().hex).toBe(PALETTE.red);
    expect(emberHues("cyan").hex).toBe(PALETTE.cyan);
  });

  it("flickers between both fire colours, fast, where the colour is not known", () => {
    const seen = new Set<string>();
    for (let t = 0; t < 0.5; t += 0.02) seen.add(emberEither(t));
    expect([...seen].sort()).toEqual(["cyan", "red"]);
    // Faster than four times a second each way, so it reads as a flicker and not a choice.
    expect(emberEither(0)).not.toBe(emberEither(0.2));
    const either = log((ctx) => paintEmber(ctx, 100, 100, 20, 1, 0.01));
    expect(either.length).toBeGreaterThan(0);
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

describe("a hold's drop", () => {
  it("stands in the scan frame's place: the HOLD LAB's drop, and no box", () => {
    expect(markIsHere(cue("HOLD", 100, 200, { kind: "HOLD" }))).toBe(true);
    expect(markIsHere(cue("SHIELD", 100, 200))).toBe(false);
    expect(markIsHere(cue("FIRE", 100, 200))).toBe(false);
    const calls = log((ctx) =>
      drawCueHelper(ctx, cue("HOLD", 100, 200, { kind: "HOLD" }), HULL, 0),
    );
    // The drop's soft outline, never a rectangle — and not the thumbprint's ridges.
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.some((c) => c.startsWith("ellipse("))).toBe(false);
    expect(calls.some((c) => c.startsWith("strokeRect(") || c.startsWith("rect("))).toBe(false);
  });
});

describe("a tap's drop", () => {
  it("stands in the scan frame's place: THE PRESS LAB's drop, and no box", () => {
    expect(cueHelper("TAP")).toBe("press");
    expect(cueHelper("TAP TAP")).toBe("press");
    expect(markIsHere(cue("TAP", 100, 200, { kind: "PRESS" }))).toBe(true);
    const calls = log((ctx) =>
      drawCueHelper(ctx, cue("TAP", 100, 200, { kind: "PRESS" }), HULL, 0.2),
    );
    expect(calls.some((c) => c.startsWith("stroke("))).toBe(true);
    expect(calls.some((c) => c.startsWith("ellipse("))).toBe(false);
    expect(calls.some((c) => c.startsWith("strokeRect(") || c.startsWith("rect("))).toBe(false);
  });

  it("bands a terrace for every tap past the first: TAP TAP has one more than TAP", () => {
    const strokes = (word: string) =>
      log((ctx) => drawCueHelper(ctx, cue(word, 100, 200, { kind: "PRESS" }), HULL, 0.2)).filter(
        (c) => c.startsWith("stroke("),
      ).length;
    expect(strokes("TAP TAP")).toBe(strokes("TAP") + 1);
    expect(tapsAsked("TAP TAP")).toBe(2);
    expect(tapsAsked("TAP")).toBe(1);
  });

  it("says no word, as a hold says none", () => {
    const why = cue("TAP", 100, 200, { kind: "PRESS", why: "TO OPEN IT" });
    expect(log((ctx) => drawCueText(ctx, why, 0))).toEqual([]);
    expect(saysTap("TAP TAP")).toBe(true);
    expect(saysTap("TAPE")).toBe(false);
  });
});

describe("a rub's drop", () => {
  it("stands in the scan frame's place, with no box", () => {
    expect(cueHelper("RUB")).toBe("rub");
    expect(markIsHere(cue("RUB", 100, 200, { kind: "CARRY" }))).toBe(true);
    const rubs = { turns: 4, done: 1 };
    const calls = log((ctx) =>
      drawCueHelper(ctx, cue("RUB", 100, 200, { kind: "CARRY", rubs }), HULL, 0.2),
    );
    expect(calls.some((c) => c.startsWith("stroke("))).toBe(true);
    expect(calls.some((c) => c.startsWith("strokeRect(") || c.startsWith("rect("))).toBe(false);
  });

  it("wears one zigzag stroke for every turn asked, the made ones lit", () => {
    const at = { x: 100, y: 200 };
    for (const [turns, done] of [
      [4, 0],
      [8, 3],
      [16, 16],
    ] as const) {
      const calls = log((ctx) => drawRubZigzag(ctx, { at, r: 30 }, turns, done, "good"));
      expect(calls.filter((c) => c.startsWith("lineTo(")).length).toBe(turns);
      // An unlit stroke is laid twice, shade then neon; a lit one a third time, its glow.
      expect(calls.filter((c) => c.startsWith("stroke(")).length).toBe(2 * turns + done);
    }
  });

  it("calls by wagging both ways, then rests", () => {
    const wag = [0.05, 0.1, 0.2, 0.25].map(rubSway);
    expect(Math.max(...wag)).toBeGreaterThan(0.5);
    expect(Math.min(...wag)).toBeLessThan(-0.5);
    expect(rubSway(1.2)).toBe(0);
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
    // FIZZ's drop draws the same body either way; the arrow is strokes over it.
    const strokes = (calls: string[]) => calls.filter((c) => c.startsWith("stroke(")).length;
    expect(strokes(withArrow)).toBeGreaterThan(strokes(without));
  });
});
