import { afterEach, beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { BODY_GLOW, bodyGlowSpread, strokeGlow } from "../src/glow.js";
import { STROKE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * How far `strokeGlow`'s glow reaches, read off the line width each `stroke`
 * is made at, and what a body under a scale hands it. The spread is in the
 * context's units, like the width, so on the screen the widest pass is the
 * core plus the spread times the scale — and `BODY_GLOW.onScreen` says how
 * much of that scale a body's spread undoes (`glow.ts`).
 */

beforeAll(installCanvasGlobals);

afterEach(() => {
  BODY_GLOW.onScreen = 0;
});

/** The line width of every stroke one call makes, in order. */
function widths(width: number, spread?: number): number[] {
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  const at: number[] = [];
  const stroke = c.stroke.bind(c);
  c.stroke = (p?: Path2D) => {
    at.push(c.lineWidth);
    stroke(p as Path2D);
  };
  strokeGlow(c, new Path2D(), "#ffffff", width, 1, 1, spread);
  return at;
}

describe("strokeGlow's spread", () => {
  it("reaches the width plus the spread on its widest pass, and draws the core at the width", () => {
    const at = widths(2, 8);
    expect(at).toHaveLength(STROKE.glowPasses + 1);
    expect(at[0]).toBe(10);
    expect(at.at(-1)).toBe(2);
  });

  it("is STROKE.glowSpread when it is left off", () => {
    expect(widths(2)[0]).toBe(2 + STROKE.glowSpread);
  });
});

describe("a body's glow under a scale", () => {
  const scale = 0.27;

  it("reaches glowSpread times the scale on the screen at onScreen 0, the thin edge", () => {
    expect(bodyGlowSpread(scale) * scale).toBeCloseTo(STROKE.glowSpread * scale, 9);
  });

  it("reaches the full glowSpread on the screen at onScreen 1", () => {
    BODY_GLOW.onScreen = 1;
    expect(bodyGlowSpread(scale) * scale).toBeCloseTo(STROKE.glowSpread, 9);
  });
});
