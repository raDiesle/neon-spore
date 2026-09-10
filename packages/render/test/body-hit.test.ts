import { beforeAll, describe, expect, it } from "bun:test";
import type { SimEvent } from "@neon-spore/sim";
import {
  BODY_HIT,
  BULB_HIT,
  DART_HIT,
  ECHO_HIT,
  hitFor,
  RIND_HIT,
  SLICK_HIT,
  type Strike,
  THROB_HIT,
  WISP_HIT,
} from "../src/body-hit.js";
import { BodyStrikeFx } from "../src/body-strike.js";
import { BREAK_LOOK } from "../src/break-look.js";
import { breakSparks } from "../src/effects-break.js";
import { computeLayout } from "../src/layout.js";
import { CFG, installCanvasGlobals, stubCanvas, VIEWPORT } from "./frame-harness.js";

/**
 * The hit seam (`body-hit.ts`): a record per body, reached by the kind a
 * `destroy` says died — and by `of`, the creature it was, for the two kills
 * that die wearing another body's contour. The owner took every hit look
 * offered on 10 September 2026 and sent each to a body of its own, so this
 * holds the distribution and proves every strike draws through a canvas that
 * refuses what a real one refuses.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");

type Kind = "slick" | "bulb" | "dart" | "throb" | "wisp";

const kill = (kind: Kind, color: "red" | "cyan" = "red", of?: "echo" | "rind"): SimEvent => ({
  type: "destroy",
  col: 5,
  row: 9,
  color,
  kind,
  ...(of ? { of } : {}),
});

const STRUCK: readonly { kind: Kind; of?: "echo" | "rind"; look: typeof BULB_HIT }[] = [
  { kind: "bulb", look: BULB_HIT },
  { kind: "throb", look: THROB_HIT },
  { kind: "dart", look: DART_HIT },
  { kind: "wisp", look: WISP_HIT },
  { kind: "slick", of: "rind", look: RIND_HIT },
  { kind: "bulb", of: "echo", look: ECHO_HIT },
];

describe("hitFor", () => {
  it("hands each body its own record, and everything unnamed the shared one", () => {
    expect(hitFor("slick")).toBe(SLICK_HIT);
    expect(hitFor("bulb")).toBe(BULB_HIT);
    expect(hitFor("throb")).toBe(THROB_HIT);
    expect(hitFor("dart")).toBe(DART_HIT);
    expect(hitFor("wisp")).toBe(WISP_HIT);
    expect(hitFor("lure")).toBe(BODY_HIT);
    expect(hitFor("beatbox")).toBe(BODY_HIT);
    const all = [SLICK_HIT, BULB_HIT, THROB_HIT, DART_HIT, WISP_HIT, RIND_HIT, ECHO_HIT, BODY_HIT];
    expect(new Set(all).size).toBe(all.length);
  });

  it("asks what the body was before what it wore — an echo and a rind die as a slick or a bulb", () => {
    expect(hitFor("slick", "rind")).toBe(RIND_HIT);
    expect(hitFor("bulb", "rind")).toBe(RIND_HIT);
    expect(hitFor("slick", "echo")).toBe(ECHO_HIT);
    expect(hitFor("bulb", "echo")).toBe(ECHO_HIT);
    // A kind with no strike of its own falls through to what it wore.
    expect(hitFor("slick", "recoil")).toBe(SLICK_HIT);
    expect(hitFor("bulb", "chute")).toBe(BULB_HIT);
  });

  it("keeps the slick on the shipped kill, and shares the break with every body", () => {
    expect(SLICK_HIT.life).toBe(0);
    expect(BODY_HIT.life).toBe(0);
    for (const { look } of STRUCK) {
      expect(look.pieces).toBe(BREAK_LOOK);
      expect(look.life).toBeGreaterThan(0);
    }
    // The kill burst is scaled off the kind's own record — the same number
    // for every kind today.
    expect(breakSparks(kill("slick"), 10)).toBe(Math.round(10 * BREAK_LOOK.sparkScale));
    expect(breakSparks(kill("slick", "red", "rind"), 10)).toBe(
      Math.round(10 * BREAK_LOOK.sparkScale),
    );
  });
});

describe("BodyStrikeFx", () => {
  it("draws nothing for the slick", () => {
    const fx = new BodyStrikeFx();
    fx.ingest([kill("slick")], L, 1);
    fx.update(0.05);
    const { ctx } = stubCanvas();
    fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
    expect(ctx.calls).toBe(0);
  });

  it("draws every other body's strike, start to end, through the strict canvas", () => {
    for (const { kind, of, look } of STRUCK) {
      const fx = new BodyStrikeFx();
      fx.ingest([kill(kind, kind === "bulb" ? "cyan" : "red", of)], L, 1);
      let drawn = 0;
      // Ten frames spread across the strike, so the tear, the puff, the
      // petals and the puddle are each reached at least once.
      for (let i = 0; i < 10; i++) {
        fx.update(look.life / 11);
        const { ctx } = stubCanvas();
        fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
        drawn += ctx.calls;
      }
      expect(drawn).toBeGreaterThan(0);
      fx.update(look.life);
      const { ctx } = stubCanvas();
      fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
      expect(ctx.calls).toBe(0);
    }
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
