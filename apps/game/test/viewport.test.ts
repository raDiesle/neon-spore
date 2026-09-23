import { afterEach, describe, expect, it } from "bun:test";
import { restoreGlobals, screen } from "./viewport-screen.js";

/**
 * The size the game is drawn at, and the one change to it that is refused.
 *
 * On a phone `window.innerHeight` is not one number: it grows by the height of
 * the address bar the moment the bar collapses and shrinks again when the bar
 * comes back. `computeLayout` makes `bandTop` a share of that height, so every
 * one of those moves the control band — and a thumb resting on a lobe mid-wave
 * is then resting beside it without having moved. So the height is frozen for
 * the length of a run, and this is where that is held to.
 *
 * There is no DOM in this runner, so the window is stood up in
 * `viewport-screen.ts`.
 */

afterEach(restoreGlobals);

describe("bindViewport", () => {
  it("is sized to the rectangle actually showing, not the one behind the address bar", () => {
    const s = screen(true);
    s.bind();
    expect(s.sized).toEqual([{ width: 375, height: 730, dpr: 2 }]);
  });

  it("falls back to the window where there is no visual viewport", () => {
    const s = screen(false);
    s.bind();
    expect(s.sized).toEqual([{ width: 375, height: 812, dpr: 2 }]);
  });

  /**
   * The bug this file exists for. Nothing the player did moved the band, so
   * the band does not move.
   */
  it("refuses a height that changed under a running wave", () => {
    const s = screen(true);
    s.bind();
    s.move({ height: 812 });
    expect(s.sized).toHaveLength(1);
  });

  it("answers a height that changed while the menu is up", () => {
    const s = screen(true);
    s.bind();
    s.run.hold("menu", true);
    s.move({ height: 812 });
    expect(s.sized.at(-1)).toEqual({ width: 375, height: 812, dpr: 2 });
  });

  /**
   * A rotation moves both numbers, and half of a rotation is not a stage. The
   * freeze is only ever about the height moving *on its own*.
   */
  it("answers a width that changed under a running wave, and takes the height with it", () => {
    const s = screen(true);
    s.bind();
    s.move({ width: 812, height: 375 });
    expect(s.sized.at(-1)).toEqual({ width: 812, height: 375, dpr: 2 });
  });

  it("takes the measurement it ignored once the run ends", () => {
    const s = screen(true);
    s.bind();
    s.move({ height: 812 });
    s.run.hold("hand", true);
    expect(s.sized.at(-1)).toEqual({ width: 375, height: 812, dpr: 2 });
  });

  /**
   * The wave opens on whatever is showing at that moment and is frozen there,
   * so the measurement is taken again on the way in as well as on the way out.
   */
  it("measures again as the run starts, so the frozen height is the wave's own", () => {
    const s = screen(true);
    s.bind();
    s.run.hold("menu", true);
    s.move({ height: 812 });
    s.run.hold("menu", false);
    s.move({ height: 730 });
    expect(s.sized.at(-1)).toEqual({ width: 375, height: 812, dpr: 2 });
  });

  it("ignores a viewport with no size at all — a hidden tab", () => {
    const s = screen(true);
    s.bind();
    s.run.hold("menu", true);
    s.move({ width: 0, height: 0 });
    expect(s.sized).toHaveLength(1);
  });
});
