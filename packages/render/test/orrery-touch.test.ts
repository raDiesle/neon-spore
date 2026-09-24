import { describe, expect, it } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import {
  BEARING_TURN,
  createWorld,
  DEFAULT_CONFIG,
  NO_BEARING,
  NO_RING,
  type OrreryState,
  orreryGapSlot,
  orreryHandRing,
  orreryOrbit,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { handleThumb } from "../src/guide-hand.js";
import { handleCircle } from "../src/handles.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { orreryCorePoint, orreryPoint } from "../src/orrery-shape.js";
import { type Field, type Hold, touchDown, touchMove, touchUp } from "../src/touch.js";

/**
 * **A real thumb on THE ORRERY's ring.**
 *
 * The rule has been shipped and tested since the hand landed
 * (`sim/test/orrery-hand.test.ts`); what could not be tested there is the half
 * a simulation may not have — a point in pixels becoming a bearing. So this
 * file asks the two questions that only a hit test can answer. **Is the ring
 * answered where it is drawn**, which is `layout.ts`'s standing rule and is
 * sharper here than anywhere else in the game, because the control is an
 * ellipse the width of the field and its near and far sides are three rows
 * apart. And **does a finger going round it turn the ring the way the picture
 * says**, which is the un-squashing: the slot under the thumb, not the pixel
 * angle.
 *
 * The last test is the whole control end to end — presses and moves into
 * `step`, and a gap that has moved one organ at the other end.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const WAVE = 9;

const layout = (role: ViewRole = "p1", flip = false): Layout => ({
  ...computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role),
  flip,
});

function opened(): World {
  const world = createWorld(CFG, 5);
  startWave(world, WAVE, [], [], { kind: "orrery" });
  return world;
}

function rings(world: World): OrreryState {
  if (world.boss?.kind !== "orrery") throw new Error("the orrery wave installed no orrery");
  return world.boss;
}

function field(world: World, seat: 1 | 2 = 1): Field {
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
    boss: rings(world),
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

/** A point on the line of a ring, at a slot of it. */
function on(l: Layout, ring: number, slot: number): { x: number; y: number } {
  return orreryPoint(l, CFG, ring, slot);
}

/** Whether a press at that point took hold of the ring. */
function grabbed(touch: ReturnType<typeof touchDown>): boolean {
  return touch?.hold?.kind === "drag" && touch.hold.target === "orreryRing";
}

/** The bearing a move to a point reports, with the hold the grab gave. */
function bearingAt(l: Layout, hold: Hold, at: { x: number; y: number }): number {
  const touch = touchMove(l, hold, at.x, at.y);
  if (touch?.command?.kind !== "drag") throw new Error("the ring answered no drag");
  return touch.command.fromMilli;
}

describe("a thumb on THE ORRERY's ring", () => {
  it("takes hold of the line, and says nothing about where round it landed", () => {
    const l = layout();
    const world = opened();
    const touch = touchDown(l, on(l, 0, 0).x, on(l, 0, 0).y, field(world));
    expect(touch?.hold).toEqual({
      kind: "drag",
      target: "orreryRing",
      player: 1,
      originX: orreryCorePoint(l, CFG).x,
      originY: orreryCorePoint(l, CFG).y,
    });
    // The grab is a reference and nothing else: a bearing here would turn the
    // ring by however far round the finger happened to land
    // (`sim/orrery-hand.ts`).
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "orreryRing",
      on: true,
      fromMilli: NO_BEARING,
    });
  });

  it("is the pilot's, and a press from the other seat falls through it", () => {
    const l = layout("p2");
    const world = opened();
    const at = on(l, 0, 0);
    // Not a hold on the ring: whatever else that point is, it is not this
    // control.
    expect(grabbed(touchDown(l, at.x, at.y, field(world, 2)))).toBe(false);
  });

  it("finds nothing in the open space between the rings, so a rock behind it is still reachable", () => {
    const l = layout();
    const world = opened();
    const core = orreryCorePoint(l, CFG);
    const outer = on(l, 0, 0);
    const mid = { x: core.x, y: (core.y + outer.y) / 2 };
    expect(grabbed(touchDown(l, mid.x, mid.y, field(world)))).toBe(false);
  });

  it("moves inward as the rings come off, and is gone with the last of them", () => {
    const l = layout();
    const world = opened();
    const b = rings(world);
    b.broken = 1;
    const outer = on(l, 0, 0);
    const middle = on(l, 1, 0);
    expect(grabbed(touchDown(l, outer.x, outer.y, field(world)))).toBe(false);
    expect(touchDown(l, middle.x, middle.y, field(world))?.hold).toMatchObject({
      target: "orreryRing",
    });
    b.broken = 3;
    expect(orreryHandRing(b)).toBe(NO_RING);
    expect(grabbed(touchDown(l, middle.x, middle.y, field(world)))).toBe(false);
  });
});

describe("THE ORRERY's ring, turned", () => {
  const l = layout();
  const world = opened();
  const grab = touchDown(l, on(l, 0, 0).x, on(l, 0, 0).y, field(world));
  const hold = grab?.hold;
  if (!hold) throw new Error("the ring refused the grab");

  it("reports the slot under the finger, with nought at the bottom", () => {
    const orbit = orreryOrbit(CFG, 0);
    // The bottom is slot 0, which is the sim's own zero and the only slot a
    // shot passes through (`orreryGapSlot`).
    expect(bearingAt(l, hold, on(l, 0, 0))).toBe(0);
    // A quarter of the way round is a quarter of a turn, and so is every other
    // quarter: this is the un-squashing, and without it the flattened ring
    // would report a quarter turn a long way before the side of the field.
    expect(bearingAt(l, hold, on(l, 0, orbit / 4))).toBe(BEARING_TURN / 4);
    expect(bearingAt(l, hold, on(l, 0, orbit / 2))).toBe(BEARING_TURN / 2);
    expect(bearingAt(l, hold, on(l, 0, (orbit * 3) / 4))).toBe((BEARING_TURN * 3) / 4);
    // And an organ's worth of slot is an organ's worth of turn, which is what
    // makes a thumb that tracks an organ turn the ring at the rate the picture
    // is going at.
    expect(bearingAt(l, hold, on(l, 0, 1))).toBe(Math.round(BEARING_TURN / orbit));
  });

  it("is mirrored for the seat whose field is turned, because the finger is chasing a body", () => {
    const flipped = layout("p1", true);
    const orbit = orreryOrbit(CFG, 0);
    const quarter = on(flipped, 0, orbit / 4);
    const core = orreryCorePoint(flipped, CFG);
    const turned: Hold = {
      kind: "drag",
      target: "orreryRing",
      player: 1,
      originX: core.x,
      originY: core.y,
    };
    // The same slot, drawn on the other side of the core and reported as the
    // same slot: what goes on the wire is the ring's own number, and the fold
    // is only about which side of the screen the pilot's thumb has to be on.
    expect(quarter.x).toBeLessThan(core.x);
    expect(bearingAt(flipped, turned, quarter)).toBe(BEARING_TURN / 4);
  });

  it("has no bearing at all for a finger that has wandered in to the core", () => {
    const core = orreryCorePoint(l, CFG);
    expect(bearingAt(l, hold, core)).toBe(NO_BEARING);
    // Which is the same message a lift sends about the reference, so the next
    // sample outside the dead spot is a fresh start rather than a swing
    // (`sim/orrery-hand.ts`).
    expect(touchUp(l, hold)?.command).toMatchObject({
      target: "orreryRing",
      on: false,
    });
  });
});

describe("THE ORRERY's ring, end to end", () => {
  it("turns the gap one organ for a turn and a half of the thumb", () => {
    const l = layout();
    const world = opened();
    const b = rings(world);
    const orbit = orreryOrbit(CFG, 0);
    const was = orreryGapSlot(CFG, b, 0, 40);
    const start = on(l, 0, 0);
    const grab = touchDown(l, start.x, start.y, field(world));
    const hold = grab?.hold;
    if (!hold || grab?.command === null) throw new Error("the ring refused the grab");
    const send = (command: NonNullable<typeof grab.command>): void => {
      step(world, [{ tick: world.tick, player: 1, command }]);
    };
    send(grab.command);
    // A turn and a half of the thumb, in samples an eighth of a turn apart —
    // which is about what a finger reports between two ticks, and well inside
    // the half a bearing can be read across.
    const samples = Math.ceil((1.5 * 8 * CFG.orreryHandMilliPerOrgan) / BEARING_TURN);
    for (let i = 1; i <= samples; i++) {
      const at = on(l, 0, (i * orbit) / 8);
      const move = touchMove(l, hold, at.x, at.y);
      if (move?.command) send(move.command);
    }
    // One organ, and exactly one: the bank keeps the rest of the thumb's travel
    // against the next detent rather than paying part of one out.
    expect(orreryGapSlot(CFG, b, 0, 40)).toBe((was + 1) % orbit);
  });
});

/**
 * **Where the ghost hand of a rehearsal stands on the ring**, which is the one
 * question a real thumb never asks: a finger knows where it is, and a film's
 * hand has to be told.
 *
 * `handleCircle` answers it for every handle in the game, and every other one
 * of them is a small circle hanging off a body — so the branch this drives is
 * the only one that has to turn a *bearing* back into a point. A hand drawn at
 * a bearing the finger would have missed is exactly the disagreement
 * `orrery-grab.ts` exists to make impossible, so the two halves are asserted
 * against each other rather than against numbers typed here.
 */
describe("the hand a film puts on THE ORRERY's ring", () => {
  it("stands at the bottom of the ring before anything has hold of it", () => {
    const l = layout();
    const world = opened();
    // Slot 0, which is the only slot a shot passes and where every synthetic
    // hand starts from (`scene-turn.ts`, `keys-turn.ts`, `frames/ring.ts`).
    const at = handleCircle(l, world, "orreryRing", 0);
    const bottom = on(l, 0, 0);
    expect(at?.x).toBeCloseTo(bottom.x, 6);
    expect(at?.y).toBeCloseTo(bottom.y, 6);
  });

  it("rides the bearing the simulation recorded, wherever round the ring it is", () => {
    const l = layout();
    const world = opened();
    const b = rings(world);
    const orbit = orreryOrbit(CFG, 0);
    b.handAtMilli = BEARING_TURN / 4;
    const quarter = on(l, 0, orbit / 4);
    const at = handleCircle(l, world, "orreryRing", 0);
    expect(at?.x).toBeCloseTo(quarter.x, 6);
    expect(at?.y).toBeCloseTo(quarter.y, 6);
  });

  it("moves inward with the hand as the rings come off, and is gone with the last", () => {
    const l = layout();
    const world = opened();
    const b = rings(world);
    b.broken = 1;
    const middle = handleCircle(l, world, "orreryRing", 0);
    expect(middle?.x).toBeCloseTo(on(l, 1, 0).x, 6);
    b.broken = 3;
    expect(handleCircle(l, world, "orreryRing", 0)).toBeNull();
  });

  it("is the pilot's hand, and is drawn only while one is on the ring", () => {
    const l = layout();
    const world = opened();
    const b = rings(world);
    // No bearing on record is no hand at all on this control — a thumb off the
    // ring and a thumb with no reference yet are one state
    // (`sim/orrery-hand.ts`) — so there is nothing for a page to draw.
    expect(handleThumb(l, world, 1, 0)).toBeNull();
    b.handAtMilli = 0;
    expect(handleThumb(l, world, 1, 0)).not.toBeNull();
    expect(handleThumb(l, world, 2, 0)).toBeNull();
  });
});
