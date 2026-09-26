import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { drawBakedEgg, EGG_SPRITE, stirAt } from "../src/instar-egg-baked.js";
import { drawBakedIris } from "../src/instar-eye-baked.js";
import { IRIS_LOOK } from "../src/instar-head-parts.js";
import { drawBakedScales } from "../src/instar-hide-baked.js";
import { drawBakedPale } from "../src/instar-moult-baked.js";
import { drawBakedNests } from "../src/instar-nest-baked.js";
import type { Look } from "../src/instar-plate.js";
import { drawBakedSeam } from "../src/instar-seam-baked.js";
import { drawBakedMembrane } from "../src/instar-wing-baked.js";
import type { Layout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { greySprite, SPRITE_STEP, spritePx, tintedSprite } from "../src/sprite-bake.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * Sprites baked at load (`sprite-bake.ts`) and the examples on THE INSTAR:
 * a key that stands still while the body grows a little, a tint composed once
 * per colour pair, and every value either example hands the canvas one a
 * canvas accepts — the offered look is not drawn by the game, so
 * `frame.test.ts` never reaches it.
 */

beforeAll(installCanvasGlobals);

const L = {
  gridLeft: 0,
  gridTop: 0,
  gridWidth: 1000,
  gridHeight: 1000,
  dpr: 3,
} as unknown as Layout;
const look = (threat: number, time: number): Look =>
  ({
    f: { nest: 1, nestX: 200, nestY: 300, eggs: 1, eggsX: 600, eggsY: 300 },
    head: { x: 400, y: 200 },
    r: 150,
    time,
    fade: 0.8,
    hurt: 0,
    threat,
    fire: 0,
    harden: 0,
    shoveUp: 0,
    shoveDown: 0,
  }) as unknown as Look;

describe("a sprite baked at load", () => {
  it("keys on device pixels rounded up to the step", () => {
    expect(spritePx(10, 3)).toBe(32);
    expect(spritePx(10.4, 3)).toBe(32);
    expect(spritePx(0, 3)).toBe(SPRITE_STEP);
  });

  it("paints once per size and composes once per colour pair", () => {
    const a = greySprite(EGG_SPRITE, 64);
    expect(greySprite(EGG_SPRITE, 64)).toBe(a);
    const t = tintedSprite(EGG_SPRITE, 64, PALETTE.bile, PALETTE.bileRim);
    expect(tintedSprite(EGG_SPRITE, 64, PALETTE.bile, PALETTE.bileRim)).toBe(t);
    expect(tintedSprite(EGG_SPRITE, 64, PALETTE.venom, PALETTE.bileRim)).not.toBe(t);
    expect(t.canvas.width).toBe(t.w * EGG_SPRITE.frames);
  });

  it("stirs through its four frames as the window runs", () => {
    expect([0, 0.3, 0.55, 0.9, 1.5].map(stirAt)).toEqual([0, 1, 2, 3, 3]);
  });

  it("draws the baked egg, nests, hide, wing, pale body, rings and eye with values a canvas accepts", () => {
    const { ctx: stub } = stubCanvas();
    const ctx = stub as unknown as CanvasRenderingContext2D;
    for (let i = 0; i < 40; i++) {
      const threat = i / 40;
      drawBakedEgg(ctx, 100, 100, 150, 0.2, 1, threat, i / 60, i, 3);
      drawBakedNests(ctx, L, look(threat, i / 60));
      drawBakedScales(
        ctx,
        new Path2D(),
        { x: 300, y: 200, r: 150, ry: 90, angle: i / 10 },
        4 + i,
        threat,
        3,
      );
      const o = { x: 200, y: 200 };
      drawBakedMembrane(
        ctx,
        {
          membrane: new Path2D(),
          frame: [o, { x: 200 + 60 * Math.cos(i / 7), y: 200 + i }, { x: 200, y: 260 - i * 3 }],
          root: o,
          wrist: o,
          tips: [o],
          unit: 60,
          fade: 1 - threat,
          lit: 1,
          sheen: threat,
        },
        3,
      );
      const back = [o, { x: 260, y: 200 + i }, { x: 320, y: 210 }];
      drawBakedPale(
        ctx,
        { pale: new Path2D(), back, crest: back[1] ?? o, r: 150, fade: 1 - threat, breath: 0.9 },
        () => {},
        3,
      );
      drawBakedSeam(
        ctx,
        { top: o, bottom: { x: 210, y: 300 + i }, r: 150, fade: 1 - threat, hide: new Path2D() },
        3,
      );
      drawBakedIris(
        ctx,
        { at: o, r: 150, open: 1 - threat, look: i, fade: 1 - threat, eye: new Path2D() },
        IRIS_LOOK.paint,
        3,
      );
    }
    expect(stub.calls).toBeGreaterThan(0);
  });
});
