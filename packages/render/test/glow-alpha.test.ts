import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { strokeGlow } from "../src/glow.js";
import { STROKE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * `strokeGlow`'s two dials, read off the alpha each `stroke` is made at: the
 * glow passes first, widest and faintest, then the core. `intensity` is how
 * lit the line is and leaves the core alone; `alpha` is whether it is there
 * and takes the core with it. The lost screen's focus ring is the case that
 * found the difference (`glow.ts`).
 */

beforeAll(installCanvasGlobals);

/** The alpha of every stroke one call makes, in order, and the alpha it leaves. */
function strokes(intensity: number, alpha?: number): { at: number[]; after: number } {
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  const at: number[] = [];
  const stroke = c.stroke.bind(c);
  c.stroke = (p?: Path2D) => {
    at.push(c.globalAlpha);
    stroke(p as Path2D);
  };
  c.globalAlpha = 0.4;
  strokeGlow(c, new Path2D(), "#ffffff", 2, intensity, alpha);
  return { at, after: c.globalAlpha };
}

describe("strokeGlow", () => {
  it("dims the glow and not the core by its intensity", () => {
    const { at } = strokes(0);
    expect(at).toHaveLength(STROKE.glowPasses + 1);
    expect(at.slice(0, -1).every((a) => a === 0)).toBe(true);
    expect(at.at(-1)).toBe(1);
  });

  it("draws nothing at all at alpha 0, whatever the intensity", () => {
    expect(strokes(1.4, 0).at.every((a) => a === 0)).toBe(true);
  });

  it("scales the core and the glow together by its alpha", () => {
    const whole = strokes(0.8).at;
    const half = strokes(0.8, 0.5).at;
    expect(half.at(-1)).toBe(0.5);
    for (const [i, a] of half.slice(0, -1).entries()) expect(a).toBeCloseTo((whole[i] ?? 0) / 2, 9);
  });

  it("does not read the caller's alpha, and leaves it at 1", () => {
    const { at, after } = strokes(1, 0.5);
    expect(at.at(-1)).toBe(0.5);
    expect(after).toBe(1);
  });
});
