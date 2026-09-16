import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { either, STRIKE_SECONDS } from "../src/breach-either.js";
import { HAMMER_SECONDS } from "../src/breach-hammer.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * **The two pictures a breach gets, and which hit gets which.**
 *
 * The owner took `rend` and `hammer` together on 16 September 2026 and asked
 * for either one or the other per hit (`tools/versus/DECIDED.md`). What has to
 * hold is not a picture — pixels are not assertable — but the three things the
 * arrangement is made of: that **both** answers really are reached, that the
 * *same* hit draws the *same* one on both phones, and that the blow stops
 * before the tear's clock does, because the record carries one `seconds` and
 * the two answers do not agree about it.
 *
 * And the rule every drawing here is under: both paints run the whole of their
 * own clock through the strict stub, which refuses an unparseable colour, a
 * coordinate that came out NaN and a negative radius.
 */

const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "test");

beforeAll(installCanvasGlobals);

function strike(t: number, seed: number) {
  return {
    x: L.width / 2,
    y: L.hullY,
    tile: L.tile,
    span: 1,
    t,
    hex: "#AA66FF",
    surfaceY: (_x: number) => L.hullY,
    l: L,
    seed,
  };
}

/**
 * Which of the two was drawn, read off the ordered log rather than asked for:
 * only the tear lays a radial gradient down, because only the tear chars the
 * plating. `null` is neither, which is what a blow past its own clock draws.
 */
function drawn(t: number, seed: number): "rend" | "hammer" | null {
  const { ctx } = stubCanvas();
  ctx.log = [];
  either(ctx as never, strike(t, seed));
  if (ctx.calls === 0) return null;
  return ctx.log?.some((c) => c.startsWith("createRadialGradient")) ? "rend" : "hammer";
}

const SEEDS = Array.from({ length: 60 }, (_, i) => i * 97 + 3);

describe("a breach is a tear or a blow", () => {
  it("reaches both answers, and neither of them rarely", () => {
    const hits = SEEDS.map((s) => drawn(0.1, s));
    const hammers = hits.filter((k) => k === "hammer").length;
    // A coin, not a decoration. Anything outside this band means the seed and
    // the hash disagree about what a spread is, and one of the two answers the
    // owner took would be one a pair almost never sees.
    expect(hammers).toBeGreaterThan(SEEDS.length * 0.3);
    expect(hammers).toBeLessThan(SEEDS.length * 0.7);
  });

  it("gives one hit one answer, however often it is asked", () => {
    // The whole reason this is a hash of the hit's own seed and not
    // `Math.random`: two phones draw the same breach, and two people are about
    // to say out loud what they saw.
    for (const seed of SEEDS.slice(0, 8)) {
      const first = drawn(0.1, seed);
      expect(drawn(0.1, seed)).toBe(first);
      expect(drawn(0.3, seed)).toBe(first === null ? null : first);
    }
  });

  it("stops a blow before the record's clock runs out, and not a tear", () => {
    const late = 0.5 * (1 + HAMMER_SECONDS / STRIKE_SECONDS);
    for (const seed of SEEDS) {
      const early = drawn(0.05, seed);
      if (early === "hammer") expect(drawn(late, seed)).toBeNull();
      else expect(drawn(late, seed)).toBe("rend");
    }
  });

  it("draws both, cleanly, over the whole of the clock", () => {
    for (const seed of SEEDS.slice(0, 6)) {
      for (let t = 0; t < 1; t += 0.05) {
        const { ctx } = stubCanvas();
        expect(() => either(ctx as never, strike(t, seed))).not.toThrow();
      }
    }
  });
});
