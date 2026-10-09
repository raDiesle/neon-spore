import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  type BlisterBy,
  type BlisterWay,
  blisterIsUp,
  blisterMayTap,
  createWorld,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { flatCenter } from "../src/creature-place.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { touchDown, touchUp } from "../src/touch.js";
import type { Field } from "../src/touch-field.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  remembered,
  runFrames,
  thirdOf,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE BLISTER's SWIPE, pressed and drawn (`blister-tap.ts`, `blister-help.ts`):
 * a press on one that is up is a `blisterSwipe` drag whose lift carries how
 * far the hand went, and on every screen the track is laid across a body
 * whose shape is the TAP blister's, filling as a stroke is carried.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

const swiped = (col: number, by: BlisterBy, way: BlisterWay): SpawnEntry => ({
  beat: 0,
  col,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count: 3,
  gesture: "swipe",
  way,
});

function fieldOf(world: World, seat: 1 | 2): Field {
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
    slow: world,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("a press on a SWIPE blister", () => {
  it("is a blisterSwipe drag, and its lift carries how far the hand went", () => {
    const world = createWorld(CFG, 3, [swiped(5, 2, "right")]);
    while (!world.creatures.some(blisterIsUp)) step(world, []);
    const body = world.creatures.find(blisterIsUp)!;
    const at = flatCenter(L, body, 0);
    const down = touchDown(L, at.x, at.y, fieldOf(world, 2));
    expect(down?.command).toEqual({
      kind: "drag",
      target: "blisterSwipe",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: body.id,
    });
    const up = touchUp(L, down!.hold!, { x: at.x + L.tile, y: at.y - L.tile / 2 });
    expect(up?.command).toMatchObject({
      kind: "drag",
      target: "blisterSwipe",
      on: false,
      fromMilli: 1000,
      fromYMilli: -500,
    });
  });

  it("is not answered on the seat its `by` does not name", () => {
    const world = createWorld(CFG, 3, [swiped(5, 2, "right")]);
    while (!world.creatures.some(blisterIsUp)) step(world, []);
    const at = flatCenter(L, world.creatures.find(blisterIsUp)!, 0);
    expect(touchDown(L, at.x, at.y, fieldOf(world, 1))?.command?.kind).not.toBe("drag");
  });
});

const CARRY: Record<BlisterWay, [number, number]> = {
  right: [1, 0],
  left: [-1, 0],
  down: [0, 1],
  up: [0, -1],
};

/** Every blister stroked its way by the hand its `by` names: press, half, lift. */
function swipeFrames(role: ViewRole, ticks: number, sampling: { every?: number; phase?: number }) {
  const queue = [swiped(2, 1, "left"), swiped(5, 2, "up"), swiped(8, "both", "down")];
  const far = CFG.blisterSwipeMilli;
  const { ctx, events } = runFrames(createWorld(CFG, 3, queue), role, ticks, {
    ...sampling,
    onTick: (tick, w) => {
      const inputs: TimedCommand[] = [];
      const step3 = tick % 3;
      for (const c of w.creatures) {
        if (!blisterIsUp(c)) continue;
        const player = blisterMayTap(c, 1) ? 1 : 2;
        const [ux, uy] = CARRY[c.blisterWay ?? "right"];
        const reach = step3 === 0 ? 0 : step3 === 1 ? far / 2 : far;
        inputs.push({
          tick: w.tick,
          player,
          command: {
            kind: "drag",
            target: "blisterSwipe",
            id: c.id,
            on: step3 !== 2,
            fromMilli: ux * reach,
            fromYMilli: uy * reach,
          },
        });
      }
      step(w, inputs);
    },
  });
  return { ctx, blows: events.filter((e) => e.type === "blisterBlow").length };
}

describe("the SWIPE blister", () => {
  const played = remembered((role) => swipeFrames(role, TPB * 10, thirdOf(4, ROLES.indexOf(role))));

  for (const role of ROLES) {
    it(`draws the swipe track along its way for ${role}`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really stroked blows out of them", () => {
    expect(played("test").blows).toBeGreaterThan(0);
  });
});
