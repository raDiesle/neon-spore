import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  type DragTarget,
  grindstoneClamped,
  step,
  trivetClosed,
  type World,
} from "@neon-spore/sim";
import { deskDownAll } from "../src/desk-grab.js";
import { pointerSeats } from "../src/desk-seat.js";
import { Fingers } from "../src/fingers.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout } from "../src/layout.js";
import type { Pinched } from "../src/pinch-pair.js";
import type { Field } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";
import * as grindstone from "./grindstone-harness.js";
import * as halter from "./halter-harness.js";
import * as trivet from "./trivet-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **TEST's one mouse closes every chord** (`desk-chord.ts`). The owner, 3
 * October 2026, on THE GRINDSTONE: *the hold does not work for me* — a mouse
 * was one pad on one jaw, and `desk-reach.test.ts` asks only whether a handle
 * is reached, never whether it can be finished. Here a single held press on
 * one body, through the same `Fingers` the hosts keep, is the whole chord.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
const BOTH = pointerSeats("test", undefined);
const PHASE = 0.5;

function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: PHASE,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    slow: world,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

/** One held mouse on `part`, at the desk, as the hosts send it: what it says, then the world told. */
function press(world: World, part: DragTarget, fingers = new Fingers()): Pinched[] {
  const at = handleCircle(L, world, part, PHASE);
  if (at === null) throw new Error(`no ${part} standing`);
  const touches = deskDownAll(L, at.x, at.y, BOTH, (seat) => fieldOf(world, seat));
  const holds = touches.flatMap((t) => (t.hold ? [t.hold] : []));
  const said = fingers.down(L, 1, holds, at.x, at.y);
  step(
    world,
    said.map((s) => ({ tick: world.tick, player: s.player, command: s.command })),
  );
  return said;
}

describe("one mouse at the desk closes a chord", () => {
  it.each(["grindJawLeft", "grindJawRight"] as const)("clamps THE GRINDSTONE from %s", (jaw) => {
    const world = grindstone.stood();
    const s = grindstone.posed(world, { ask: "clamp", color: "either", beats: 8 });
    press(world, jaw);
    expect(grindstoneClamped(s)).toBe(true);
  });

  it("lets the clamp go again on the lift", () => {
    const world = grindstone.stood();
    const s = grindstone.posed(world, { ask: "clamp", color: "either", beats: 8 });
    const fingers = new Fingers();
    press(world, "grindJawLeft", fingers);
    const lifted = fingers.up(1);
    step(
      world,
      lifted.map((p) => ({ tick: world.tick, player: p.player, command: p.command })),
    );
    expect(s.padsDown).toEqual([0, 0]);
  });

  it("holds both of THE TRIVET's feet with every pad", () => {
    const world = trivet.stood();
    const s = trivet.posed(world, { ask: "both", pads: 3, color: "either", beats: 4 }, false);
    s.padsDown = [0, 0];
    press(world, "trivetPadFront");
    expect(trivetClosed(s)).toBe(true);
  });

  it("takes both of THE HALTER's grips for the chording seat, and none for the rester", () => {
    const world = halter.stood();
    const s = halter.posed(world, { ask: "left", color: "either", beats: 8 });
    const said = press(world, "halterChordLeft");
    expect(said.every((p) => p.player === 1)).toBe(true);
    expect(s.grips).toEqual([3, 0]);
  });

  it("is one pad a finger on a phone", () => {
    const world = grindstone.stood();
    const s = grindstone.posed(world, { ask: "clamp", color: "either", beats: 8 });
    const l = computeLayout(VIEWPORT, CFG, "p1");
    const at = handleCircle(l, world, "grindJawLeft", PHASE);
    if (at === null) throw new Error("no jaw standing");
    const touches = deskDownAll(l, at.x, at.y, [1], (seat) => fieldOf(world, seat));
    const holds = touches.flatMap((t) => (t.hold ? [t.hold] : []));
    const said = new Fingers().down(l, 1, holds, at.x, at.y);
    step(
      world,
      said.map((p) => ({ tick: world.tick, player: p.player, command: p.command })),
    );
    expect(s.padsDown).toEqual([1, 0]);
  });
});
