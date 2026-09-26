import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { FRONT, SIDE, THREE_QUARTER, view } from "@neon-spore/content";
import { breath, chainAt, drawBall, drawRig, noise1, type Part } from "../src/index.js";
import { hazeSkin } from "../src/solid-haze.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A RIG, DRAWN: every call it makes is one the browser accepts, from every
 * side; the ball is baked on a quantised key, so a breathing radius does not
 * bake a canvas a frame; and the motion is a function of time alone.
 */

beforeAll(installCanvasGlobals);

const SKIN = { base: "#3A2380", lift: "#9C82FF", sheen: "#F3DEFF" };
const RIG: Part[] = [
  {
    kind: "tube",
    rings: [0, 1, 2, 3, 4].map((i) => ({ c: { x: -80 + i * 40, y: 0, z: 0 }, r: 20 + i * 4 })),
    skin: SKIN,
  },
  {
    kind: "tube",
    rings: [0, 1, 2].map((i) => ({ c: { x: 0, y: -20 - i * 14, z: 20 + i * 14 }, r: 8 - i * 2 })),
    skin: SKIN,
  },
  { kind: "ball", c: { x: -100, y: 0, z: 0 }, r: 26, skin: SKIN, rests: 0 },
];

describe("drawRig", () => {
  it("draws from every side without a bad argument", () => {
    const { ctx } = stubCanvas();
    for (const yaw of [SIDE, 0.3, THREE_QUARTER, 1.2, FRONT, -FRONT, Math.PI]) {
      for (const pitch of [0, 0.4, -0.3]) {
        drawRig(ctx as unknown as CanvasRenderingContext2D, RIG, view(yaw, pitch, 800), 180, 320, {
          deep: "#07060F",
          rim: "#C9B8FF",
        });
      }
    }
  });

  it("bakes one ball per quantised radius, not one per pixel of breath", () => {
    const { ctx } = stubCanvas();
    const orig = document.createElement.bind(document);
    let count = 0;
    document.createElement = ((tag: string) => {
      count++;
      return orig(tag);
    }) as typeof document.createElement;
    try {
      for (let r = 30; r < 33; r += 0.1) {
        drawBall(ctx as unknown as CanvasRenderingContext2D, 0, 0, r, SKIN);
      }
    } finally {
      document.createElement = orig as typeof document.createElement;
    }
    expect(count).toBeLessThanOrEqual(2);
  });
});

describe("haze", () => {
  it("leaves the nearest part alone and steps the rest", () => {
    expect(hazeSkin(SKIN, 0, "#07060F")).toBe(SKIN);
    expect(hazeSkin(SKIN, 0.51, "#07060F")).toEqual(hazeSkin(SKIN, 0.49, "#07060F"));
    expect(hazeSkin(SKIN, 1, "#07060F").base).not.toBe(SKIN.base);
  });
});

describe("motion", () => {
  it("is a function of time and seed alone", () => {
    expect(noise1(3.7, 4)).toBe(noise1(3.7, 4));
    expect(noise1(3.7, 4)).not.toBe(noise1(3.7, 5));
    expect(breath(1.2, 3.4)).toBe(breath(1.2, 3.4));
  });

  it("stays in range and is continuous", () => {
    for (let t = 0; t < 20; t += 0.01) {
      const n = noise1(t);
      expect(Math.abs(n)).toBeLessThanOrEqual(1);
      expect(Math.abs(noise1(t + 0.001) - n)).toBeLessThan(0.01);
    }
  });

  it("follows through down a chain: a link does what the root did earlier", () => {
    const root = (t: number) => Math.sin(t);
    expect(chainAt(root, 2, 0, 0.1)).toBe(root(2));
    expect(chainAt(root, 2, 3, 0.1, 1)).toBeCloseTo(root(1.7), 12);
  });
});
