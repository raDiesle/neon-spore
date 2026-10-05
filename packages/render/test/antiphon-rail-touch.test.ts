import { describe, expect, it } from "bun:test";
import type { AntiphonState, World } from "@neon-spore/sim";
import { antiphonPerch } from "../src/antiphon-shape.js";
import { touchDown } from "../src/touch.js";
import { CFG, field, hung, layout, organ, target } from "./antiphon-touch-harness.js";

/**
 * **A real thumb on THE ANTIPHON's rail** — the mirror of the organ, at
 * `antiphon-touch.test.ts`: the same questions asked of the handle on the
 * other screen (`antiphon-rail-grip.ts`), plus the two only it has — that
 * the press carries the candidate's place on the rail as its `id`, because
 * that is what `sim/antiphon-hand.ts` carries, and that the seat it answers
 * swaps with the level.
 */

/** The rail as `hung` set it: three candidates at their slots, the organ standing. */
function railed(world: World): AntiphonState {
  return organ(world);
}

/** The place on the rail a press took hold of, as the hold carries it. */
function heldId(touch: ReturnType<typeof touchDown>): number | undefined {
  return touch?.hold?.kind === "drag" ? touch.hold.id : undefined;
}

describe("a thumb on THE ANTIPHON's rail", () => {
  it("takes hold of a candidate on the chooser's screen, where it hangs", () => {
    const l = layout("p2");
    const world = hung();
    const s = railed(world);
    const c = s.rail[1];
    if (c === undefined) throw new Error("no candidate");
    const at = antiphonPerch(l, CFG, c.col);
    const touch = touchDown(l, at.x, at.y, field(world, 2));
    expect(target(touch)).toBe("antiphonRail");
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "antiphonRail",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: 1,
    });
    expect(touch?.player).toBe(2);
  });

  it("carries the candidate's place on the rail, so the carry is of the right one", () => {
    const l = layout("p2");
    const world = hung();
    const s = railed(world);
    for (let i = 0; i < s.rail.length; i++) {
      const c = s.rail[i];
      if (c === undefined) throw new Error("no candidate");
      const at = antiphonPerch(l, CFG, c.col);
      expect(heldId(touchDown(l, at.x, at.y, field(world, 2)))).toBe(i);
    }
  });

  it("is nothing on the explainer's screen, where the organ hangs instead", () => {
    const l = layout("p1");
    const world = hung();
    const s = railed(world);
    const c = s.rail[0];
    if (c === undefined) throw new Error("no candidate");
    const at = antiphonPerch(l, CFG, c.col);
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).not.toBe("antiphonRail");
    expect(target(touchDown(l, at.x, at.y, field(world, 1)))).not.toBe("antiphonRail");
  });

  it("is the chooser's on the test screen too: the explainer's seat takes nothing", () => {
    const l = layout("test");
    const world = hung();
    const s = railed(world);
    const c = s.rail[0];
    if (c === undefined) throw new Error("no candidate");
    const at = antiphonPerch(l, CFG, c.col);
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).toBe("antiphonRail");
    expect(target(touchDown(l, at.x, at.y, field(world, 1)))).not.toBe("antiphonRail");
  });

  it("falls through beside the rail, and with the rail empty", () => {
    const l = layout("p2");
    const world = hung();
    const s = railed(world);
    const c = s.rail[0];
    if (c === undefined) throw new Error("no candidate");
    const at = antiphonPerch(l, CFG, c.col);
    // Past the thumb-sized circle and its finger's slack (`hitCircle`), on
    // the side away from the next candidate a slot over.
    expect(target(touchDown(l, at.x - l.tile * 2, at.y, field(world, 2)))).not.toBe("antiphonRail");
    s.rail = [];
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).not.toBe("antiphonRail");
  });

  it("is nothing once the body is down, or on a wave without the boss", () => {
    const l = layout("p2");
    const world = hung();
    const s = railed(world);
    const c = s.rail[0];
    if (c === undefined) throw new Error("no candidate");
    const at = antiphonPerch(l, CFG, c.col);
    expect(target(touchDown(l, at.x, at.y, field(world, 2, null)))).not.toBe("antiphonRail");
    s.downBeat = world.beat;
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).not.toBe("antiphonRail");
  });

  it("answers the pilot's thumb instead when the seats swap, a level on", () => {
    const world = hung();
    const s = railed(world);
    s.pits = [7];
    const c = s.rail[0];
    if (c === undefined) throw new Error("no candidate");
    const p1 = layout("p1");
    const at = antiphonPerch(p1, CFG, c.col);
    expect(heldId(touchDown(p1, at.x, at.y, field(world, 1)))).toBe(0);
    expect(target(touchDown(layout("p2"), at.x, at.y, field(world, 2)))).not.toBe("antiphonRail");
  });
});
