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
import { antiphonOrganCircle } from "../src/antiphon-shape.js";
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
    maze: null,
    warden: null,
    orrery: null,
    sinew: null,
    surge: null,
    antiphon,
    instar: null,
    filament: null,
    stare: null,
    queen: null,
    diastole: null,
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
