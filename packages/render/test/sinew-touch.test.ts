import { describe, expect, it } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SinewState,
  sinewBoss,
  startWave,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { sinewHandleCircle } from "../src/sinew-handles.js";
import { type Field, touchDown, touchMove } from "../src/touch.js";

/**
 * **A real thumb on THE SINEW's handles.**
 *
 * The rule is `sim/test/sinew.test.ts`'s; what could not be tested there is
 * the half a simulation may not have — a point in pixels becoming a pull. So
 * this file asks what only a hit test can answer: that each handle is
 * answered where it is drawn (`sinewHandleCircle` is the one place the circle
 * is written down), that each answers **its own seat only** — the left is
 * the pilot's and the right the navigator's, and the wrong seat's press
 * falls through to the field — and that a hand carried down reports the
 * depth the simulation reads (`fromYMilli`).
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const WAVE = 9;

const layout = (role: ViewRole = "p1"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function hung(): World {
  const world = createWorld(CFG, 5);
  startWave(world, WAVE, [], [], { kind: "sinew" });
  return world;
}

function tendon(world: World): SinewState {
  const s = sinewBoss(world);
  if (s === null) throw new Error("the sinew wave hung no tendon");
  return s;
}

function field(world: World, seat: 1 | 2, sinew: SinewState | null = tendon(world)): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: sinew,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("a thumb on THE SINEW's handles", () => {
  it("takes hold of the left handle for the pilot, where it is drawn", () => {
    const l = layout("p1");
    const world = hung();
    const rest = sinewHandleCircle(l, CFG, tendon(world), world.beat, 0, -1);
    const touch = touchDown(l, rest.x, rest.y, field(world, 1));
    expect(target(touch)).toBe("sinewLeft");
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "sinewLeft",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
  });

  it("takes hold of the right handle for the navigator", () => {
    const l = layout("p2");
    const world = hung();
    const rest = sinewHandleCircle(l, CFG, tendon(world), world.beat, 0, 1);
    expect(target(touchDown(l, rest.x, rest.y, field(world, 2)))).toBe("sinewRight");
  });

  it("answers its own seat only: the other side's handle falls through", () => {
    const world = hung();
    const l1 = layout("p1");
    const right = sinewHandleCircle(l1, CFG, tendon(world), world.beat, 0, 1);
    expect(target(touchDown(l1, right.x, right.y, field(world, 1)))).not.toBe("sinewRight");
    const l2 = layout("p2");
    const left = sinewHandleCircle(l2, CFG, tendon(world), world.beat, 0, -1);
    expect(target(touchDown(l2, left.x, left.y, field(world, 2)))).not.toBe("sinewLeft");
  });

  it("is nothing on a wave without the boss", () => {
    const l = layout("p1");
    const world = hung();
    const rest = sinewHandleCircle(l, CFG, tendon(world), world.beat, 0, -1);
    expect(target(touchDown(l, rest.x, rest.y, field(world, 1, null)))).not.toBe("sinewLeft");
  });

  it("reports a hand carried down as the depth the simulation reads", () => {
    const l = layout("p1");
    const world = hung();
    const rest = sinewHandleCircle(l, CFG, tendon(world), world.beat, 0, -1);
    const touch = touchDown(l, rest.x, rest.y, field(world, 1));
    if (touch?.hold === undefined || touch.hold === null) throw new Error("no hold");
    const moved = touchMove(l, touch.hold, rest.x, rest.y + l.tile);
    expect(moved?.command).toMatchObject({
      kind: "drag",
      target: "sinewLeft",
      on: true,
      fromYMilli: 1000,
    });
  });
});
