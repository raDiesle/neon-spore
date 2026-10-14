import { afterEach, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { AntiphonState, World } from "@neon-spore/sim";
import { ANTIPHON_GLANCE, ANTIPHON_GLANCE_SIZE } from "../src/antiphon-glance.js";
import { antiphonBox } from "../src/antiphon-shape.js";
import { antiphonStopper } from "../src/antiphon-stop.js";
import { glancedPoint, glanceFrame, STILL_GLANCE } from "../src/glance.js";
import { glanceOf, sway } from "../src/glance-styles.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt meets the mantle that is drawn** (`antiphon-glance.ts`): turned,
 * the far end draws back and a bolt past it goes on by, while the near end
 * and the middle stop it as before; still, nothing has moved.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
const WORLD = { cfg: CFG } as World;
const S = {} as AntiphonState;
const BOX = antiphonBox(L, CFG);
const MID = (BOX.left + BOX.right) * 0.5;
const HW = (BOX.right - BOX.left) * 0.5;
/** A quarter of SWAY's round: the right end at its farthest back. */
const T = 1.5;

const stopper = (still: boolean) =>
  antiphonStopper(L, WORLD, S, { shift: 0, fade: 1, time: T, still });

afterEach(() => Object.assign(ANTIPHON_GLANCE, STILL_GLANCE));

describe("THE ANTIPHON's mantle, turned", () => {
  it("ships still: both outer columns stop on the underside", () => {
    const stop = stopper(false);
    for (const col of [0, CFG.cols - 1]) {
      expect(stop(col, tileCX(L, col), "red")?.y).toBe(BOX.bottom);
    }
  });

  it("stops a bolt at the far end it has drawn back to, and not past it", () => {
    Object.assign(ANTIPHON_GLANCE, glanceOf(sway, ANTIPHON_GLANCE_SIZE));
    const f = glanceFrame(ANTIPHON_GLANCE, T, {
      x: MID,
      y: (BOX.top + BOX.bottom) * 0.5,
      r: HW,
      hold: 0,
    });
    expect(f.swing).toBeGreaterThan(0);
    const end = glancedPoint(f, { x: MID + HW, y: BOX.bottom });
    expect(end.x).toBeLessThan(MID + HW);
    const stop = stopper(false);
    const col = CFG.cols - 1;
    expect(stop(col, end.x - 2, "red")?.hit).toBe("body");
    expect(stop(col, end.x + 2, "red")).toBeNull();
    expect(stop(0, tileCX(L, 0), "red")?.hit).toBe("body");
    expect(stop(0, MID, "red")?.y).toBeCloseTo(BOX.bottom, 6);
  });

  it("does not turn once it is still", () => {
    Object.assign(ANTIPHON_GLANCE, glanceOf(sway, ANTIPHON_GLANCE_SIZE));
    const stop = stopper(true);
    expect(stop(CFG.cols - 1, MID + HW - 2, "red")?.y).toBe(BOX.bottom);
  });
});
