import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
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
    expect(computeStage(phone)).toEqual(
      computeStage({ ...phone, inset: { top: 0, right: 0, bottom: 0, left: 0 } }),
    );
  });

  it("gives up the height the notch and the home indicator take", () => {
    const s = computeStage({ ...phone, inset: { top: 44, right: 0, bottom: 34, left: 0 } });
    expect(s.height).toBe(812 - 78);
    expect(s.top).toBe(44);
  });

  it("centres what is left between the side strips rather than in the window", () => {
    const s = computeStage({ ...phone, inset: { top: 0, right: 0, bottom: 0, left: 100 } });
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
    const s = computeStage({
      width: 375,
      height: 40,
      dpr: 2,
      inset: { top: 44, right: 0, bottom: 34, left: 0 },
    });
    expect(s.height).toBe(0);
    expect(s.width).toBe(0);
  });

  /**
   * The owner, 20 September 2026: *"horizontal the hull skin is vertical
   * cutted inside of the screen."* A phone shorter than 9:16 of free height
   * stood the hull between two black side bars; the stage is its whole width
   * now, with the field centred in it (`layout-stage.ts`).
   */
  it("is a short phone's whole width, with the field centred in it", () => {
    for (const [width, height] of [
      [390, 660],
      [375, 548],
    ] as const) {
      const s = computeStage({ width, height, dpr: 2 });
      expect(s.width).toBe(width);
      expect(s.left).toBe(0);
      const l = computeLayout({ width: s.width, height: s.height, dpr: 2 }, cfg, "p1");
      expect(l.gridWidth).toBeLessThan(width);
      expect(l.gridLeft * 2 + l.gridWidth).toBeCloseTo(width);
    }
  });

  it("still caps a desk window at a phone's aspect", () => {
    const s = computeStage({ width: 1240, height: 900, dpr: 1 });
    expect(s.width).toBeCloseTo(900 * 0.56);
    expect(s.left).toBe(Math.round((1240 - s.width) / 2));
  });

  /**
   * The owner, 20 September 2026: *in "both seats" the bottom of control set
   * is often cutted, so I can't see buttons and use them.* Every lobe, with
   * a margin of 30% of its radius for the rim and the hover ring, stays
   * inside the stage on the shortest phones a browser leaves room for, in
   * every view. The reach a press is answered at (`hitReach`) is wider still
   * and may run past the stage's bottom edge, where no thumb lands. The height
   * a run freezes is capped at the bars-out height for the same reason
   * (`apps/game/src/safe-area.ts`).
   */
  it("keeps every lobe's touch ring inside the stage on a short phone", () => {
    for (const role of ["p1", "p2", "test"] as const)
      for (const width of [320, 375, 430])
        for (let height = 480; height <= 932; height += 16) {
          const s = computeStage({ width, height, dpr: 2 });
          const l = computeLayout({ width: s.width, height: s.height, dpr: 2 }, cfg, role);
          expect(l.lobeY + l.lobeR * 1.3).toBeLessThanOrEqual(s.height);
        }
  });
});
