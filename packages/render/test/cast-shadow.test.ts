import { beforeAll, describe, expect, it } from "bun:test";
import { KEY } from "@neon-spore/content";
import { type Creature, DEFAULT_CONFIG } from "@neon-spore/sim";
import {
  CAST_MAX_ALPHA,
  castShadows,
  drawCastShadows,
  SHADOW_DIR,
  shadedColour,
} from "../src/cast-shadow.js";
import { creatureCenter } from "../src/creature-place.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * A SHADOW MAY NEVER MAKE A BODY HARD TO NAME OR HARD TO SEE.
 *
 * That is the rule the brief put above the look, and it is two claims, so this
 * file makes two. The first is the one `key-light.ts` already earned and this
 * module inherits: a shadow is darkening and darkening alone, so a red body
 * comes out exactly as red as it went in. The second is the one darkening can
 * still get wrong — a body can keep its hue and be too dark to find against a
 * `#07060F` field — so `CAST_MAX_ALPHA` is measured against the WCAG contrast
 * threshold for a graphic this size, at the deepest shadow the system can
 * produce, for every colour a callout can name.
 *
 * The third claim is geometric and is the reason the light did not have to
 * move: with `KEY` at 45° and a throw of one row per row of depth, the shadow
 * lands on the diagonal neighbour rather than on the body in the same column —
 * so the column a pair is naming out loud is the column it steps around.
 */

beforeAll(installCanvasGlobals);

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

function creature(id: number, col: number, row: number): Creature {
  return {
    id,
    kind: "bulb",
    col,
    row,
    fromRow: row,
    color: "red",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    throbOpen: false,
  } as Creature;
}

function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/** Hue in degrees, 0 = red. The axis the callout lives on — the same helper
 * `key-light.test.ts` uses, because it is the same claim being made. */
function hue(hex: string): number {
  const [r, g, b] = rgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return ((h * 60) % 360) + (h < 0 ? 360 : 0);
}

/** WCAG relative luminance, then the contrast ratio between two colours. 3:1
 * is the threshold for a graphical object, which is what a 26 px body is. */
function luminance(hex: string): number {
  const lin = rgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** The colours a body in a wave can be, which are the colours a callout
 * names — the same roster `key-light.test.ts` measures against. */
const AMMUNITION = [PALETTE.red, PALETTE.cyan, PALETTE.pod, PALETTE.good] as const;

describe("the shadow reads the one direction there is", () => {
  it("is `KEY` negated, and names no angle of its own", () => {
    expect(SHADOW_DIR.x).toBeCloseTo(-KEY.x, 12);
    expect(SHADOW_DIR.y).toBeCloseTo(-KEY.y, 12);
  });

  it("runs down and to the right, which is toward the hull", () => {
    expect(SHADOW_DIR.x).toBeGreaterThan(0);
    expect(SHADOW_DIR.y).toBeGreaterThan(0);
  });
});

describe("a shaded body still reads as the colour it is", () => {
  for (const base of AMMUNITION) {
    it(`leaves ${base} exactly where it was on the hue circle, at the deepest shadow`, () => {
      for (let a = 0; a <= CAST_MAX_ALPHA + 1e-9; a += CAST_MAX_ALPHA / 20) {
        const shaded = shadedColour(base, a);
        // The shadow colour is not pure black (#07060F, the field), so 8-bit
        // rounding is not quite the only thing moving it — but it moves it by
        // under a degree, against 165° of margin between red and cyan.
        expect(Math.abs(hue(shaded) - hue(base))).toBeLessThan(1.5);
      }
    });

    it(`keeps ${base} above 3:1 against the field, at the deepest shadow`, () => {
      const shaded = shadedColour(base, CAST_MAX_ALPHA);
      expect(contrast(shaded, PALETTE.background)).toBeGreaterThan(3);
    });
  }

  it("keeps a red body's red channel the largest one, however deep", () => {
    const [r, g, b] = rgb(shadedColour(PALETTE.red, CAST_MAX_ALPHA));
    expect(r).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(b);
  });

  it("is a real floor: the darkest ammunition fails 3:1 well before full black", () => {
    // Not caution. At alpha 0.7 the red body is under the threshold, so the
    // ceiling above is holding something back rather than describing a
    // shadow that could never have been a problem.
    expect(contrast(shadedColour(PALETTE.red, 0.7), PALETTE.background)).toBeLessThan(3);
  });
});

describe("castShadows", () => {
  it("misses the body in the same column and finds the diagonal one", () => {
    const under = castShadows(CFG, L, [creature(1, 4, 6), creature(2, 4, 7)], 0);
    const diagonal = castShadows(CFG, L, [creature(1, 4, 6), creature(2, 5, 7)], 0);
    const alphaUnder = under[0]?.alpha ?? 0;
    const alphaDiagonal = diagonal[0]?.alpha ?? 0;
    // The column the pair is naming takes a graze at most, and the diagonal
    // takes the shadow. This is the whole reason the light did not move.
    expect(alphaDiagonal).toBeGreaterThan(alphaUnder * 3);
    expect(alphaUnder).toBeLessThan(CAST_MAX_ALPHA / 5);
  });

  it("never exceeds its own ceiling, however the bodies are arranged", () => {
    for (let dc = -2; dc <= 2; dc++) {
      for (let dr = 1; dr <= 3; dr++) {
        for (const s of castShadows(CFG, L, [creature(1, 4, 5), creature(2, 4 + dc, 5 + dr)], 0)) {
          expect(s.alpha).toBeLessThanOrEqual(CAST_MAX_ALPHA + 1e-9);
          expect(s.alpha).toBeGreaterThan(0);
        }
      }
    }
  });

  it("reaches no further than its depth bound, so the cost is bounded too", () => {
    // Three rows apart is past `MAX_ROW_GAP`, wherever the second body sits.
    for (let dc = -1; dc <= 1; dc++) {
      expect(castShadows(CFG, L, [creature(1, 4, 4), creature(2, 4 + dc, 7)], 0)).toHaveLength(0);
    }
  });

  it("casts nothing between bodies on the same row", () => {
    expect(castShadows(CFG, L, [creature(1, 4, 6), creature(2, 5, 6)], 0)).toHaveLength(0);
  });

  it("never casts for a boss body or the tether, which are not blobs on a tile", () => {
    const boss = creature(1, 4, 6);
    boss.kind = "warden";
    expect(castShadows(CFG, L, [boss, creature(2, 5, 7)], 0)).toHaveLength(0);
    const tether = creature(3, 4, 6);
    tether.kind = "tether";
    expect(castShadows(CFG, L, [tether, creature(4, 5, 7)], 0)).toHaveLength(0);
  });

  it("throws the shadow away from the light, not toward it", () => {
    const [s] = castShadows(CFG, L, [creature(1, 4, 6), creature(2, 5, 7)], 0);
    expect(s).toBeDefined();
    if (!s) return;
    const caster = creatureCenter(L, creature(1, 4, 6), 0);
    expect(s.sx).toBeGreaterThan(caster.x);
    expect(s.sy).toBeGreaterThan(caster.y);
  });
});

describe("drawCastShadows", () => {
  it("draws, and puts the alpha back so the next body is not dimmed", () => {
    const { ctx } = stubCanvas();
    drawCastShadows(
      ctx as unknown as CanvasRenderingContext2D,
      L,
      CFG,
      [creature(1, 4, 6), creature(2, 5, 7)],
      0,
    );
    expect(ctx.calls).toBeGreaterThan(0);
    expect(ctx.globalAlpha).toBe(1);
  });

  it("allocates no canvas per frame: the sprite cache is keyed on a radius", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    // Count what reaches `document.createElement`, which is the only way a
    // canvas is made — a gradient built per pair per frame would show up here
    // as sixty of them.
    const doc = globalThis.document as unknown as { createElement: (t: string) => unknown };
    const real = doc.createElement;
    let made = 0;
    doc.createElement = (tag: string) => {
      made++;
      return real(tag);
    };
    try {
      for (let i = 0; i < 60; i++) {
        drawCastShadows(c, L, CFG, [creature(1, 4, 6), creature(2, 5, 7)], i / 60);
      }
    } finally {
      doc.createElement = real;
    }
    // A handful for the radii a gliding body passes through, not sixty.
    expect(made).toBeLessThan(5);
  });
});
