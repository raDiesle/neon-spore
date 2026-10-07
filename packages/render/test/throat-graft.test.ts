import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import { createWorld, throatHomeCol, type World } from "@neon-spore/sim";
import { drawGrid, gunsightCol } from "../src/field.js";
import { frame, type HullMood } from "../src/hull-frame.js";
import { P1_SKIN } from "../src/seat-skin.js";
import { drawThroatGraft } from "../src/throat-graft.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";
import { LAYOUT, opened } from "./throat-rig.js";

/**
 * THE THROAT grown out of the ship rather than standing behind it: the hull
 * carries no cannon swelling and no gunsight on its wave, and the graft round
 * the gullet's root is drawn while the root is in the hull and not after
 * (`throat-graft.ts`, `hull-frame.ts`, `field.ts`). The whole frame on every
 * screen is `throat-frame.test.ts`.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

beforeAll(installCanvasGlobals);

const L = LAYOUT.p1;
const MOOD: HullMood = { armed: 0, intake: 0, chew: 0, charge: 0 };

/** How many calls one graft put down on a fresh canvas. */
function graft(world: World): number {
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  drawThroatGraft(c, L, world, () => L.hullY, P1_SKIN, 0, 0);
  return ctx.calls;
}

describe("the throat's graft", () => {
  it("is drawn on the throat's wave and nowhere else", () => {
    expect(graft(opened().world)).toBeGreaterThan(0);
    expect(graft(createWorld(CFG, 7, buildQueue(0, CFG.cols)))).toBe(0);
  });

  it("sinks back into the hull once the root has come through the mouth", () => {
    const { world, t } = opened();
    t.phase = "everts";
    t.phaseBeat = world.beat;
    expect(graft(world)).toBeGreaterThan(0);
    // Two beats of six through five rings: the root ring is out of the hull.
    t.phaseBeat = world.beat - 2;
    expect(graft(world)).toBe(0);
  });
});

describe("the hull under a gullet", () => {
  it("carries no cannon swelling", () => {
    const at = { cannon: throatHomeCol(CFG), shield: [] };
    const [gun] = frame(L, 0, MOOD, at).bumps;
    const [root] = frame(L, 0, { ...MOOD, root: true }, at).bumps;
    expect(gun?.strength ?? 0).toBeGreaterThan(0);
    expect(root?.strength).toBe(0);
  });

  it("draws no gunsight up the cannon's column", () => {
    const plain = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    expect(gunsightCol(opened().world)).toBeNull();
    expect(gunsightCol(plain)).toBe(plain.cannonCol);
    const calls = (col: number | null) => {
      const { ctx } = stubCanvas();
      drawGrid(ctx as unknown as CanvasRenderingContext2D, L, col, 0, 0, 0, "p1");
      return ctx.calls;
    };
    expect(calls(3)).toBeGreaterThan(0);
    expect(calls(null)).toBe(0);
  });
});
