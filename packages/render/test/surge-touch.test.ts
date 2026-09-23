import { describe, expect, it } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SurgeState,
  startWave,
  surgeBoss,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { surgeBulbCircle } from "../src/surge-shape.js";
import { type Field, touchDown } from "../src/touch.js";

/**
 * **A real thumb on THE SURGE's bulb.**
 *
 * The rule is `sim/test/surge.test.ts`'s; what could not be tested there is
 * the half a simulation may not have — a point in pixels becoming a hold.
 * So this file asks what only a hit test can answer: that the bulb is
 * answered where it is drawn (`surgeBulbCircle` is the one place the circle
 * is written down), that it answers **both seats at the same place** — the
 * first handle in the game that does, and the split is on the seam, not on
 * the grip — that the command is the one `sim/surge-hand.ts` hears, and
 * that off the bulb, or on a wave without it, a press falls through.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const WAVE = 9;

const layout = (role: ViewRole = "p1"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function hung(): World {
  const world = createWorld(CFG, 5);
  startWave(world, WAVE, [], [], { kind: "surge" });
  return world;
}

function bulb(world: World): SurgeState {
  const s = surgeBoss(world);
  if (s === null) throw new Error("the surge wave hung no bulb");
  return s;
}

function field(world: World, seat: 1 | 2, surge: SurgeState | null = bulb(world)): Field {
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
    boss: surge,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("a thumb on THE SURGE's bulb", () => {
  it.each([1, 2] as const)("takes hold of the bulb for seat %i, where it is drawn", (seat) => {
    const l = layout(seat === 1 ? "p1" : "p2");
    const world = hung();
    const c = surgeBulbCircle(l, CFG, bulb(world));
    const touch = touchDown(l, c.x, c.y, field(world, seat));
    expect(target(touch)).toBe("surgeBulb");
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "surgeBulb",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    expect(touch?.player).toBe(seat);
  });

  it("answers anywhere inside the bulb, not only its centre", () => {
    const l = layout("p1");
    const world = hung();
    const c = surgeBulbCircle(l, CFG, bulb(world));
    expect(target(touchDown(l, c.x + c.r * 0.6, c.y - c.r * 0.5, field(world, 1)))).toBe(
      "surgeBulb",
    );
  });

  it("falls through beside the bulb", () => {
    const l = layout("p1");
    const world = hung();
    const c = surgeBulbCircle(l, CFG, bulb(world));
    expect(target(touchDown(l, c.x + c.r * 2.5, c.y, field(world, 1)))).not.toBe("surgeBulb");
  });

  it("is nothing on a wave without the boss", () => {
    const l = layout("p1");
    const world = hung();
    const c = surgeBulbCircle(l, CFG, bulb(world));
    expect(target(touchDown(l, c.x, c.y, field(world, 1, null)))).not.toBe("surgeBulb");
  });
});
