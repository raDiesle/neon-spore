import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeStage } from "../src/layout-stage.js";

/**
 * The rectangle the game is drawn into, and the strips of the screen it is
 * not allowed to use.
 *
 * `viewport.inset` arrives from the app (`apps/game/src/safe-area.ts`) and is
 * the only thing in this package that knows a phone has furniture. It is
 * applied here rather than in `computeLayout` because everything a player
 * touches is placed inside the stage and drawn from its corner, so a stage
 * that has stepped in carries the band and the lobes in with it.
 */

const cfg = DEFAULT_CONFIG;
const phone = { width: 375, height: 812, dpr: 2 };

describe("computeStage and the phone's own furniture", () => {
  it("is the whole window where a screen has none", () => {
    expect(computeStage(phone, cfg, "p1")).toEqual(
      computeStage({ ...phone, inset: { top: 0, right: 0, bottom: 0, left: 0 } }, cfg, "p1"),
    );
  });

  it("gives up the height the notch and the home indicator take", () => {
    const s = computeStage(
      { ...phone, inset: { top: 44, right: 0, bottom: 34, left: 0 } },
      cfg,
      "p1",
    );
    expect(s.height).toBe(812 - 78);
    expect(s.top).toBe(44);
  });

  it("centres what is left between the side strips rather than in the window", () => {
    const s = computeStage(
      { ...phone, inset: { top: 0, right: 0, bottom: 0, left: 100 } },
      cfg,
      "p1",
    );
    // A landscape notch eats the left 100px; the picture is centred in the 275
    // that remain and starts beyond the strip, never under it.
    expect(s.left).toBeGreaterThanOrEqual(100);
    expect(s.left + s.width).toBeLessThanOrEqual(375);
  });

  /**
   * What a phone reports for a frame or two while it rotates. A negative
   * height reaches the canvas as a negative radius, which throws.
   */
  it("is empty rather than negative on a window shorter than its own furniture", () => {
    const s = computeStage(
      { width: 375, height: 40, dpr: 2, inset: { top: 44, right: 0, bottom: 34, left: 0 } },
      cfg,
      "p1",
    );
    expect(s.height).toBe(0);
    expect(s.width).toBe(0);
  });
});
