import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { computeLayout } from "../src/layout.js";
import { drawMantle } from "../src/mantle-draw.js";
import { MantleFx } from "../src/mantle-fx.js";
import { mantleArrived } from "../src/mantle-pose.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { marks } from "./glow-marks.js";
import { hung, still } from "./mantle-frame-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MANTLE arriving, half a beat into its opening "still" and faded by
 * `ctx.globalAlpha` as a whole, draws nothing brighter than that fade.
 * Before, its glows (`strokeGlow`) put the alpha back at 1 and every plate
 * and handle after the first glow came in whole over a shell that was meant
 * to be arriving. THE DAVIT was the second case here until it left the game
 * on 8 October 2026.
 */

beforeAll(installCanvasGlobals);

const l = computeLayout(VIEWPORT, CFG, "test");
const EPS = 1e-9;

describe("a boss arriving", () => {
  it("THE MANTLE draws nothing brighter than its arrival", () => {
    const world = hung();
    const s = still(world);
    s.phaseBeat = world.beat;
    const fade = 0.2 + 0.8 * mantleArrived(s, CFG, world.beat, 0.5);
    expect(fade).toBeLessThan(0.5);
    const fx = new MantleFx();
    const { at, after } = marks((c) => drawMantle(c, l, world, s, world.beat, 0.5, 0, fx));
    expect(at.length).toBeGreaterThan(10);
    expect(Math.max(...at)).toBeLessThanOrEqual(fade + EPS);
    expect(after).toBe(1);
  });
});
