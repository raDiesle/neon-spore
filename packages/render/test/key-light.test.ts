import { beforeAll, describe, expect, it } from "bun:test";
import { KEY, LIGHT_HALF } from "@neon-spore/content";
import { half, litBox, litColour, litRound, shadeAt } from "../src/key-light.js";
import { PALETTE } from "../src/palette.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * THE LIGHT COMES FROM ONE PLACE, AND A CREATURE ONLY GETS HALF OF IT.
 *
 * Two claims are worth a test here and the rest is pixels. The first is that
 * there is a direction at all and everything reads the same one. The second is
 * the rule `docs/alive.md` states and this lane had to make expressible: a
 * creature's red-or-cyan is a gameplay fact one player says out loud across a
 * two-second delay, so at 26 px the light may never move a red body toward
 * cyan. `LIGHT_HALF.creature` is `"value"`, `half` drops `lift` for it, and the
 * consequence — hue comes out exactly where it went in — is asserted below
 * against every ammunition colour rather than left as a comment.
 *
 * The counterfactual is asserted too. A test that only says "the safe path is
 * safe" does not say why the split exists; the one below shows the hue half
 * moving a red body eleven degrees toward cyan, which is the thing being
 * refused.
 */

beforeAll(installCanvasGlobals);

function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/** Hue in degrees, 0 = red. The axis the callout lives on. */
function hue(hex: string): number {
  const [r, g, b] = rgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return ((h * 60) % 360) + (h < 0 ? 360 : 0);
}

/** How far a colour is from cyan along the hue circle. Small means "the pair
 * would call it the other one". */
function fromCyan(hex: string): number {
  const d = Math.abs(hue(hex) - 180);
  return d > 180 ? 360 - d : d;
}

/** Every u worth sampling: both silhouettes, the terminator, and between. */
const US = Array.from({ length: 41 }, (_, i) => i / 40);

/** The colours a body in a wave can be, which are the colours a callout names. */
const AMMUNITION = [PALETTE.red, PALETTE.cyan, PALETTE.pod, PALETTE.good] as const;

describe("the key light has one direction", () => {
  it("is a unit vector", () => {
    expect(Math.hypot(KEY.x, KEY.y)).toBeCloseTo(1, 12);
  });

  it("points up and to the left, in screen axes with y down", () => {
    expect(KEY.x).toBeLessThan(0);
    expect(KEY.y).toBeLessThan(0);
  });

  it("darkens past the terminator and brightens before it", () => {
    expect(shadeAt(0.16).lift).toBeGreaterThan(shadeAt(0.5).lift);
    expect(shadeAt(0.74).shade).toBeGreaterThan(shadeAt(0.5).shade);
  });

  it("darkens the lit silhouette, or the body reads as translucent", () => {
    expect(shadeAt(0).shade).toBeGreaterThan(shadeAt(0.16).shade);
  });

  it("bounces light back onto the far rim, or the body reads as a disc", () => {
    expect(shadeAt(1).shade).toBeLessThan(shadeAt(0.74).shade);
  });
});

describe("a creature takes the value half only", () => {
  it("is what LIGHT_HALF says, not what a comment says", () => {
    expect(LIGHT_HALF.creature).toBe("value");
    expect(LIGHT_HALF.hull).toBe("value+hue");
    expect(LIGHT_HALF.rock).toBe("value+hue");
  });

  it("drops the lift entirely rather than reducing it", () => {
    for (const u of US) expect(half("value", shadeAt(u)).lift).toBe(0);
  });

  for (const base of AMMUNITION) {
    it(`leaves ${base} exactly where it was on the hue circle`, () => {
      for (const u of US) {
        const lit = litColour(base, u, LIGHT_HALF.creature);
        // 8-bit rounding is the only thing that moves it, and it moves it by
        // under a degree — against 165° of margin to cyan.
        expect(Math.abs(hue(lit) - hue(base))).toBeLessThan(1.5);
      }
    });

    it(`never moves ${base} measurably toward cyan`, () => {
      for (const u of US) {
        const lit = litColour(base, u, LIGHT_HALF.creature);
        expect(fromCyan(lit)).toBeGreaterThan(fromCyan(base) - 1.5);
      }
    });
  }

  it("keeps a red body's red channel the largest one, however dark", () => {
    for (const u of US) {
      const [r, g, b] = rgb(litColour(PALETTE.red, u, LIGHT_HALF.creature));
      expect(r).toBeGreaterThan(g);
      expect(r).toBeGreaterThan(b);
    }
  });

  it("is not caution: the hue half does move a red body toward cyan", () => {
    const lit = litColour(PALETTE.red, 0.16, "value+hue");
    expect(fromCyan(PALETTE.red) - fromCyan(lit)).toBeGreaterThan(5);
  });
});

describe("nothing is allocated per frame", () => {
  it("blits the same two sprites for a rock that has not changed size", () => {
    const g = globalThis as { document: { createElement: (tag: string) => unknown } };
    const real = g.document.createElement;
    let made = 0;
    g.document.createElement = (tag: string) => {
      made++;
      return real(tag);
    };
    try {
      const { ctx } = stubCanvas();
      const c = ctx as unknown as CanvasRenderingContext2D;
      litRound(c, 100, 100, 21, "value+hue", 0.3);
      const first = made;
      for (let i = 0; i < 30; i++) litRound(c, 100 + i, 100, 21, "value+hue", 0.3);
      expect(first).toBe(2);
      expect(made).toBe(first);
    } finally {
      g.document.createElement = real;
    }
  });

  it("keeps one gradient pair for a hull that breathes by a pixel", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    let built = 0;
    const real = c.createLinearGradient.bind(c);
    c.createLinearGradient = (...a: Parameters<typeof real>) => {
      built++;
      return real(...a);
    };
    const region = new Path2D();
    // The contour top moves by a pixel a frame; the box is quantised to eight,
    // so the slot is a hit and the count stays at the first frame's two.
    for (let i = 0; i < 40; i++) litBox(c, region, 30, 200 + (i % 3), 330, 700, "value+hue");
    expect(built).toBe(2);
  });
});
