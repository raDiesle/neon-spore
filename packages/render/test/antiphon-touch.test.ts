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
 * navigator is shown the rail and nothing to hold — that twins are two
 * circles, that the command is the one `sim/antiphon-hand.ts` hears, and
 * that off the organ, with none standing, or on a wave without the boss, a
 * press falls through.
 *
 * Her rail is the mirror of it, at `antiphon-rail-touch.test.ts`: the same
 * questions asked of the handle on the other screen (`antiphon-rail-grip.ts`),
 * plus the two only it has.
 */

describe("a thumb on THE ANTIPHON's organ", () => {
  it("takes hold of the organ on the pilot's screen, where it is drawn", () => {
    const l = layout("p1");
    const world = hung();
    const c = antiphonOrganCircle(l, CFG, 0, 1);
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
    const c = antiphonOrganCircle(l, CFG, 0, 1);
    expect(target(touchDown(l, c.x, c.y, field(world, 1)))).toBe("antiphonOrgan");
    expect(touchDown(l, c.x, c.y, field(world, 2))?.player).toBe(2);
  });

  it("is nothing on the navigator's screen, where the rail hangs instead", () => {
    const l = layout("p2");
    const world = hung();
    const c = antiphonOrganCircle(l, CFG, 0, 1);
    expect(target(touchDown(l, c.x, c.y, field(world, 2)))).not.toBe("antiphonOrgan");
  });

  it("answers anywhere inside the organ, and either twin", () => {
    const l = layout("p1");
    const world = hung(2);
    const left = antiphonOrganCircle(l, CFG, 0, 2);
    const right = antiphonOrganCircle(l, CFG, 1, 2);
    expect(left.x).toBeLessThan(right.x);
    expect(target(touchDown(l, left.x - left.r * 0.6, left.y, field(world, 1)))).toBe(
      "antiphonOrgan",
    );
    expect(target(touchDown(l, right.x + right.r * 0.6, right.y, field(world, 1)))).toBe(
      "antiphonOrgan",
    );
  });

  it("falls through beside the organ, and with none standing", () => {
    const l = layout("p1");
    const world = hung();
    const c = antiphonOrganCircle(l, CFG, 0, 1);
    expect(target(touchDown(l, c.x + c.r * 3, c.y, field(world, 1)))).not.toBe("antiphonOrgan");
    organ(world).organs = [];
    expect(target(touchDown(l, c.x, c.y, field(world, 1)))).not.toBe("antiphonOrgan");
  });

  it("is nothing on a wave without the boss", () => {
    const l = layout("p1");
    const world = hung();
    const c = antiphonOrganCircle(l, CFG, 0, 1);
    expect(target(touchDown(l, c.x, c.y, field(world, 1, null)))).not.toBe("antiphonOrgan");
  });
});
