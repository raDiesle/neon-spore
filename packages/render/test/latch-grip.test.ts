import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import { type Command, type LatchGrip, step, type World } from "@neon-spore/sim";
import { handleCircle } from "../src/handle-place.js";
import { latchGripRest } from "../src/latch-shape.js";
import { LatchVerdicts } from "../src/latch-verdicts.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown, touchUp } from "../src/touch.js";
import { touchMove } from "../src/touch-move.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";
import { posed, stood } from "./latch-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE LATCH** (`render/src/latch-grip.ts`): whether the knob
 * the picture draws is where a press is taken, on either seat's screen;
 * whether the press alone takes hold — a holder never moves; whether a thumb
 * carried down hauls the rope; and whether the partner's grip is pressed
 * through for the simulation to refuse aloud, rather than falling through.
 */

const STANDARD: ControlSet = controlSet("default");
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function field(world: World, seat: 1 | 2): Field {
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
    boss: world.boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function send(world: World, player: 1 | 2, command: Command | null | undefined): string[] {
  step(world, command ? [{ tick: world.tick, player, command }] : []);
  return world.events.map((e) => e.type);
}

function press(world: World, role: ViewRole, seat: 1 | 2, grip: LatchGrip) {
  const at = latchGripRest(layout(role), CFG, grip);
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

describe("thumbs on THE LATCH", () => {
  it("answers a press where the knob is drawn, and the handle stands there too", () => {
    const world = stood();
    posed(world);
    const l = layout("p1");
    const knob = handleCircle(l, world, "latchGripLeft", 0);
    expect(knob).toMatchObject(latchGripRest(l, CFG, 0));
    const touch = press(world, "p1", 1, 0);
    expect(touch?.command).toMatchObject({ target: "latchGripLeft", on: true, fromYMilli: 0 });
  });

  it("takes hold on the press alone, and hauls the rope as the thumb is carried down", () => {
    const world = stood();
    const s = posed(world);
    send(world, 2, press(world, "p2", 2, 1)?.command);
    const down = press(world, "p1", 1, 0);
    send(world, 1, down?.command);
    expect(s.down).toEqual([true, true]);
    if (down?.hold?.kind !== "drag") throw new Error("the press took no hold");
    const l = layout("p1");
    const moved = touchMove(l, down.hold, down.hold.originX, down.hold.originY + l.tile * 1.5);
    send(world, 1, moved?.command);
    expect(s.hauledMilli).toBeGreaterThan(1000);
    const up = touchUp(l, down.hold, { x: down.hold.originX, y: down.hold.originY + l.tile * 1.5 });
    expect(send(world, 1, up?.command)).not.toContain("latchSlip");
  });

  it("presses the partner's grip through, for the simulation to say no", () => {
    const world = stood();
    const s = posed(world);
    const touch = press(world, "p1", 1, 1);
    expect(touch?.command).toMatchObject({ target: "latchGripRight", on: true });
    expect(send(world, 1, touch?.command)).toContain("latchWrong");
    expect(s.down).toEqual([false, false]);
  });

  it("greens a grip taken and reddens the partner's grip pressed, from the simulation's words", () => {
    const world = stood();
    posed(world);
    const v = new LatchVerdicts();
    send(world, 1, press(world, "p1", 1, 0)?.command);
    v.ingest(world.events);
    expect(v.verdicts.at(0)?.good).toBe(true);
    send(world, 1, press(world, "p1", 1, 1)?.command);
    v.ingest(world.events);
    expect(v.verdicts.at(1)?.good).toBe(false);
  });
});
