import { describe, expect, it } from "bun:test";
import { antiphonOrganCircle } from "../src/antiphon-shape.js";
import { touchDown } from "../src/touch.js";
import { CFG, field, hung, layout, organ, target } from "./antiphon-touch-harness.js";

/**
 * **A real thumb on THE ANTIPHON's organ.**
 *
 * The rule is `sim/test/antiphon-hand.test.ts`'s; what could not be tested
 * there is a point in pixels becoming a hold. So this file asks what only a
 * hit test can answer: that the organ is answered where it is drawn
 * (`antiphonOrganCircle` is the one place the circle is written down), that
 * it is answered **on the screen shown the organ and not on the other** —
 * the first handle in the game that is on one screen only, because the
 * chooser is shown the rail and nothing to hold — that the screen changes
 * when the seats swap, that the command is the one `sim/antiphon-hand.ts` hears, and
 * that off the organ, with none standing, or on a wave without the boss, a
 * press falls through.
 *
 * The rail is the mirror of it, at `antiphon-rail-touch.test.ts`: the same
 * questions asked of the handle on the other screen (`antiphon-rail-grip.ts`),
 * plus the two only it has.
 */

describe("a thumb on THE ANTIPHON's organ", () => {
  it("takes hold of the organ on the explainer's screen, where it is drawn", () => {
    const l = layout("p1");
    const world = hung();
    const c = antiphonOrganCircle(l, CFG);
    const touch = touchDown(l, c.x, c.y, field(world, 1));
    expect(target(touch)).toBe("antiphonOrgan");
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "antiphonOrgan",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    expect(touch?.player).toBe(1);
  });

  it("answers the test screen for either seat", () => {
    const l = layout("test");
    const world = hung();
    const c = antiphonOrganCircle(l, CFG);
    expect(target(touchDown(l, c.x, c.y, field(world, 1)))).toBe("antiphonOrgan");
    expect(touchDown(l, c.x, c.y, field(world, 2))?.player).toBe(2);
  });

  it("is nothing on the chooser's screen, where the rail hangs instead", () => {
    const l = layout("p2");
    const world = hung();
    const c = antiphonOrganCircle(l, CFG);
    expect(target(touchDown(l, c.x, c.y, field(world, 2)))).not.toBe("antiphonOrgan");
  });

  it("answers anywhere inside the organ", () => {
    const l = layout("p1");
    const world = hung();
    const c = antiphonOrganCircle(l, CFG);
    expect(target(touchDown(l, c.x - c.r * 0.6, c.y, field(world, 1)))).toBe("antiphonOrgan");
    expect(target(touchDown(l, c.x + c.r * 0.6, c.y, field(world, 1)))).toBe("antiphonOrgan");
  });

  it("moves to the navigator's screen when the seats swap, a level on", () => {
    const world = hung();
    organ(world).pits = [7];
    const p2 = layout("p2");
    const c = antiphonOrganCircle(p2, CFG);
    expect(target(touchDown(p2, c.x, c.y, field(world, 2)))).toBe("antiphonOrgan");
    const p1 = layout("p1");
    expect(target(touchDown(p1, c.x, c.y, field(world, 1)))).not.toBe("antiphonOrgan");
  });

  it("falls through beside the organ, and with none standing", () => {
    const l = layout("p1");
    const world = hung();
    const c = antiphonOrganCircle(l, CFG);
    expect(target(touchDown(l, c.x + c.r * 3, c.y, field(world, 1)))).not.toBe("antiphonOrgan");
    organ(world).organ = null;
    expect(target(touchDown(l, c.x, c.y, field(world, 1)))).not.toBe("antiphonOrgan");
  });

  it("is nothing on a wave without the boss", () => {
    const l = layout("p1");
    const world = hung();
    const c = antiphonOrganCircle(l, CFG);
    expect(target(touchDown(l, c.x, c.y, field(world, 1, null)))).not.toBe("antiphonOrgan");
  });
});
