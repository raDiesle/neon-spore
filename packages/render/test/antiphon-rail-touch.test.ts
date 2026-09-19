import { describe, expect, it } from "bun:test";
import type { AntiphonState, World } from "@neon-spore/sim";
import { antiphonPerch } from "../src/antiphon-shape.js";
import { handleRadius } from "../src/handle-draw.js";
import { touchDown } from "../src/touch.js";
import { CFG, field, hung, layout, organ, target } from "./antiphon-touch-harness.js";

/**
 * **A real thumb on THE ANTIPHON's rail** — the mirror of the organ, at
 * `antiphon-touch.test.ts`: the same questions asked of the handle on the
 * other screen (`antiphon-rail-grip.ts`), plus the two only it has — that
 * the press carries the candidate's place on the rail as its `id`, because
 * that is what `sim/antiphon-hand.ts` crosses off, and that a candidate
 * already crossed off is no longer something to take hold of.
 */

/** The rail hung with `n` candidates, a column apart from column one. */
function railed(world: World, n = 3): AntiphonState {
  const s = organ(world);
  s.rail = [];
  for (let i = 0; i < n; i++) {
    s.rail.push({ shape: i + 1, col: 1 + i * 2, color: i % 2 === 0 ? "red" : "cyan" });
  }
  return s;
}

/** The place on the rail a press took hold of, as the hold carries it. */
function heldId(touch: ReturnType<typeof touchDown>): number | undefined {
  return touch?.hold?.kind === "drag" ? touch.hold.id : undefined;
}

describe("a thumb on THE ANTIPHON's rail", () => {
  it("takes hold of a candidate on the navigator's screen, where it hangs", () => {
    const l = layout("p2");
    const world = hung();
    const s = railed(world);
    const c = s.rail[1];
    if (c === undefined) throw new Error("no candidate");
    const at = antiphonPerch(l, c.col);
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

  it("carries the candidate's place on the rail, so the crossing lands on the right one", () => {
    const l = layout("p2");
    const world = hung();
    const s = railed(world);
    for (let i = 0; i < s.rail.length; i++) {
      const c = s.rail[i];
      if (c === undefined) throw new Error("no candidate");
      const at = antiphonPerch(l, c.col);
      expect(heldId(touchDown(l, at.x, at.y, field(world, 2)))).toBe(i);
    }
  });

  it("is nothing on the pilot's screen, where the organ hangs instead", () => {
    const l = layout("p1");
    const world = hung();
    const s = railed(world);
    const c = s.rail[0];
    if (c === undefined) throw new Error("no candidate");
    const at = antiphonPerch(l, c.col);
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).not.toBe("antiphonRail");
    expect(target(touchDown(l, at.x, at.y, field(world, 1)))).not.toBe("antiphonRail");
  });

  it("is hers on the test screen too: the pilot's seat takes nothing", () => {
    const l = layout("test");
    const world = hung();
    const s = railed(world);
    const c = s.rail[0];
    if (c === undefined) throw new Error("no candidate");
    const at = antiphonPerch(l, c.col);
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).toBe("antiphonRail");
    expect(target(touchDown(l, at.x, at.y, field(world, 1)))).not.toBe("antiphonRail");
  });

  it("falls through on one already crossed off, beside the rail, and with the rail empty", () => {
    const l = layout("p2");
    const world = hung();
    const s = railed(world);
    const c = s.rail[0];
    if (c === undefined) throw new Error("no candidate");
    const at = antiphonPerch(l, c.col);
    const r = handleRadius(l, CFG);
    expect(target(touchDown(l, at.x + r * 3, at.y, field(world, 2)))).not.toBe("antiphonRail");
    s.crossed = [0];
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).not.toBe("antiphonRail");
    s.crossed = [];
    s.rail = [];
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).not.toBe("antiphonRail");
  });

  it("is nothing once the body is down, or on a wave without the boss", () => {
    const l = layout("p2");
    const world = hung();
    const s = railed(world);
    const c = s.rail[0];
    if (c === undefined) throw new Error("no candidate");
    const at = antiphonPerch(l, c.col);
    expect(target(touchDown(l, at.x, at.y, field(world, 2, null)))).not.toBe("antiphonRail");
    s.downBeat = world.beat;
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).not.toBe("antiphonRail");
  });
});
