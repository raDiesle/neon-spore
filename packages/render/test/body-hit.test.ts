import { beforeAll, describe, expect, it } from "bun:test";
import type { SimEvent } from "@neon-spore/sim";
import { BODY_HIT, BULB_HIT, hitFor, SLICK_HIT, type Strike } from "../src/body-hit.js";
import { BodyStrikeFx } from "../src/body-strike.js";
import { BREAK_LOOK } from "../src/break-look.js";
import { breakSparks } from "../src/effects-break.js";
import { computeLayout } from "../src/layout.js";
import { CFG, installCanvasGlobals, stubCanvas, VIEWPORT } from "./frame-harness.js";

/**
 * The hit seam (`body-hit.ts`): three records that hold one shipped answer
 * and are reached by kind, so a candidate on the slick's hit is drawn beside
 * the shipped one without a dart's changing with it — `body-interior.ts`'s
 * arrangement, one level along.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");

const kill = (kind: "slick" | "bulb" | "dart", color: "red" | "cyan" = "red"): SimEvent => ({
  type: "destroy",
  col: 5,
  row: 9,
  color,
  kind,
});

describe("hitFor", () => {
  it("hands the slick and the bulb records of their own, and everything else a third", () => {
    expect(hitFor("slick")).toBe(SLICK_HIT);
    expect(hitFor("bulb")).toBe(BULB_HIT);
    expect(hitFor("dart")).toBe(BODY_HIT);
    expect(hitFor("lure")).toBe(BODY_HIT);
    expect(SLICK_HIT).not.toBe(BULB_HIT);
    expect(BULB_HIT).not.toBe(BODY_HIT);
  });

  it("ships one answer — the shared break, and no strike", () => {
    for (const look of [SLICK_HIT, BULB_HIT, BODY_HIT]) {
      expect(look.pieces).toBe(BREAK_LOOK);
      expect(look.life).toBe(0);
    }
    // The kill burst is scaled off the kind's own record — the same number
    // for every kind today, which is the point of the identity above.
    expect(breakSparks(kill("slick"), 10)).toBe(Math.round(10 * BREAK_LOOK.sparkScale));
    expect(breakSparks(kill("dart"), 10)).toBe(Math.round(10 * BREAK_LOOK.sparkScale));
  });
});

describe("BodyStrikeFx", () => {
  it("draws nothing on the shipped field", () => {
    const fx = new BodyStrikeFx();
    fx.ingest([kill("slick"), kill("bulb", "cyan"), kill("dart")], L, 1);
    fx.update(0.05);
    const { ctx } = stubCanvas();
    fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
    expect(ctx.calls).toBe(0);
  });

  it("hands a patched strike the body's outline in pixels, and only the kind's own", () => {
    const seen: Strike[] = [];
    const patched = {
      life: 0.5,
      strike: (_ctx: CanvasRenderingContext2D, s: Strike) => seen.push(s),
    };
    const was = { life: SLICK_HIT.life, strike: SLICK_HIT.strike };
    Object.assign(SLICK_HIT, patched);
    try {
      const fx = new BodyStrikeFx();
      fx.ingest([kill("slick"), kill("bulb", "cyan")], L, 1);
      fx.update(0.1);
      const { ctx } = stubCanvas();
      fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
      expect(seen.length).toBe(1);
      const s = seen[0] as Strike;
      expect(s.outline.length).toBeGreaterThan(8);
      // A slick is two fifths of a tile across before distance is spent on it
      // (`livingRadius`), so its outline is smaller than a tile and not zero.
      expect(s.rx).toBeGreaterThan(0);
      expect(s.rx).toBeLessThan(L.tile);
      expect(s.floor).toBeGreaterThan(0);
      expect(s.age).toBeCloseTo(0.1);
      expect(s.life).toBe(0.5);
      // Then it is over: nothing drawn past `life`.
      seen.length = 0;
      fx.update(0.5);
      fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
      expect(seen.length).toBe(0);
    } finally {
      Object.assign(SLICK_HIT, was);
    }
  });

  it("forgets everything on a restart", () => {
    const was = { life: BULB_HIT.life, strike: BULB_HIT.strike };
    Object.assign(BULB_HIT, { life: 1, strike: () => {} });
    try {
      const fx = new BodyStrikeFx();
      fx.ingest([kill("bulb", "cyan")], L, 1);
      fx.clear();
      expect(fx).toEqual(new BodyStrikeFx());
    } finally {
      Object.assign(BULB_HIT, was);
    }
  });
});
