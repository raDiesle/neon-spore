import { describe, expect, it } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import {
  type AntiphonState,
  antiphonBoss,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  type World,
} from "@neon-spore/sim";
import { antiphonOrganCircle, antiphonPerch } from "../src/antiphon-shape.js";
import { handleRadius } from "../src/handle-draw.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";

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
 * Her rail is the mirror of it at the foot of the file: the same questions
 * asked of the handle on the other screen (`antiphon-rail-grip.ts`), plus the
 * two only it has — that the press carries the candidate's place on the rail
 * as its `id`, because that is what `sim/antiphon-hand.ts` crosses off, and
 * that a candidate already crossed off is no longer something to take hold of.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const WAVE = 9;

const layout = (role: ViewRole = "p1"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The body up with one organ standing — set, not grown to (`antiphon-frame.test.ts`). */
function hung(organs = 1): World {
  const world = createWorld(CFG, 5);
  startWave(world, WAVE, [], [], { kind: "antiphon" });
  const s = organ(world);
  s.organs = [];
  for (let i = 0; i < organs; i++) {
    s.organs.push({ shape: i + 1, col: 2 + i * 3, color: "red", grownBeat: world.beat });
  }
  return world;
}

function organ(world: World): AntiphonState {
  const s = antiphonBoss(world);
  if (s === null) throw new Error("the antiphon wave hung no body");
  return s;
}

function field(world: World, seat: 1 | 2, antiphon: AntiphonState | null = organ(world)): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    beat: world.beat,
    seat,
    cfg: CFG,
    boss: antiphon,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

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
