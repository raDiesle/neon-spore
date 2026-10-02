import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { FRONT, SIDE, see, view } from "@neon-spore/content";
import { type GimbalRing, INNER, OUTER } from "@neon-spore/sim";
import { gimbalRig, onRim } from "../src/gimbal-rig.js";
import { drawRig } from "../src/solid-rig.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GIMBAL's rig** (`gimbal-rig.ts`): the wheel the pilot faces is the
 * wheel the navigator sees from behind, so a bearing lands mirrored on her
 * screen with nothing mirrored by hand — and the rig draws from any side.
 */

installCanvasGlobals();
const TILE = 30;

describe("THE GIMBAL's rig", () => {
  it("lays a bearing out as the shipped ring does: nought at the top, clockwise for the pilot", () => {
    const top = see(onRim(1, 0), view(FRONT));
    const quarter = see(onRim(1, 250), view(FRONT));
    expect(top.y).toBeCloseTo(-1, 9);
    expect(quarter.x).toBeCloseTo(1, 9);
  });

  it("shows the navigator the same wheel from behind, mirrored", () => {
    for (const m of [0, 125, 250, 600, 875]) {
      const pilot = see(onRim(2.3, m), view(FRONT));
      const navigator = see(onRim(2.3, m), view(FRONT + Math.PI));
      expect(navigator.x).toBeCloseTo(-pilot.x, 9);
      expect(navigator.y).toBeCloseTo(pilot.y, 9);
    }
  });

  it("draws a sheared tooth as gone, and both rings from any side", () => {
    const three = gimbalRig({ ring: OUTER, faceMilli: 0, left: 3, of: 3 }, TILE);
    const one = gimbalRig({ ring: OUTER, faceMilli: 0, left: 1, of: 3 }, TILE);
    expect(three.length - one.length).toBe(2);
    for (const ring of [OUTER, INNER] as GimbalRing[])
      for (const yaw of [FRONT, 1.1, 0.6, SIDE, FRONT + Math.PI]) {
        const { ctx } = stubCanvas();
        const parts = gimbalRig({ ring, faceMilli: 166, left: 2, of: 3 }, TILE);
        drawRig(ctx as unknown as CanvasRenderingContext2D, parts, view(yaw), 180, 200, {
          deep: "#07060F",
          rim: "#F4E7FF",
        });
      }
  });
});
