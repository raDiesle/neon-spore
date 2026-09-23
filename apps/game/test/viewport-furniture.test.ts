import { afterEach, describe, expect, it } from "bun:test";
import { restoreGlobals, screen } from "./viewport-screen.js";

afterEach(restoreGlobals);

/**
 * The band used to run to the window's own three edges, and on a phone all
 * three are taken: the home indicator and the gesture bar below, the notch and
 * the status bar above. The stage steps inside them, and everything placed in
 * the stage steps in with it — the band, the strips, the lobes — because they
 * are all measured from its corner rather than from the window's.
 */
describe("the phone's own furniture", () => {
  it("cuts the stage inside it, top and bottom", () => {
    const s = screen(true);
    const g = s.bind();
    const bare = g.layout().height;
    s.run.hold("menu", true);
    s.furniture({ top: 44, bottom: 34 });
    expect(g.layout().height).toBe(bare - 78);
  });

  it("carries the band in with it rather than leaving it where it was", () => {
    const s = screen(true);
    const g = s.bind();
    const bare = g.layout().bandTop;
    s.run.hold("menu", true);
    s.furniture({ bottom: 34 });
    // The band's top moves up by the band's own share of the lost height, and
    // its foot — `bandTop + bandHeight` — now stops 34 above the window's.
    const l = g.layout();
    expect(l.bandTop).toBeLessThan(bare);
    expect(l.bandTop + l.bandHeight).toBe(l.height);
  });

  it("puts a press on the home indicator outside the picture", () => {
    const s = screen(true);
    const g = s.bind();
    s.run.hold("menu", true);
    s.furniture({ bottom: 34 });
    // 10 px above the foot of the window is inside the indicator's strip.
    expect(g.inStage({ clientX: 180, clientY: 720 })).toBeNull();
    // And one above the strip still lands, so it is the furniture doing it.
    expect(g.inStage({ clientX: 180, clientY: 690 })).not.toBeNull();
  });

  /**
   * Furniture appearing is a vertical change like any other — a keyboard, an
   * address bar — and a wave is not interrupted to honour one.
   */
  it("is not taken up under a running wave", () => {
    const s = screen(true);
    const g = s.bind();
    const bare = g.layout().height;
    s.furniture({ top: 44, bottom: 34 });
    expect(g.layout().height).toBe(bare);
  });

  /**
   * Reading it forces the browser to flush style and layout on the spot, and
   * an address bar sliding away is dozens of resizes. It moves on a rotation
   * and nothing else, so a burst of resizes reads it not once.
   */
  it("is not read again on every resize of a burst", () => {
    const s = screen(true);
    s.bind();
    const bound = s.reads();
    for (let h = 730; h < 812; h += 4) s.move({ height: h });
    expect(s.reads()).toBe(bound);
  });

  /**
   * The owner, 20 September 2026: *the bottom of control set is often
   * cutted.* A wave freezes the height it opened at, so one opened with the
   * address bar tucked away was laid out under the strip the bar comes back
   * to. The picture is never taller than the height with every bar out.
   */
  it("is never taller than the height with the bars out, run or no run", () => {
    const s = screen(true);
    const g = s.bind();
    s.run.hold("menu", true);
    s.bars(700);
    expect(g.layout().height).toBe(700);
    s.move({ height: 812 });
    expect(g.layout().height).toBe(700);
  });
});
