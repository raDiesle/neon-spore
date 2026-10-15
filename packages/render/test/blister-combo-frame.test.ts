import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  type BlisterBy,
  blisterIsUp,
  blisterMayTap,
  blisterStrokes,
  createWorld,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { flatCenter } from "../src/creature-place.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { touchDown } from "../src/touch.js";
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
 * THE BLISTER's COMBO, pressed and drawn (`blister-tap.ts`, `blister-help.ts`):
 * a press on one whose press is not yet done is a `tap`, and once it is, a
 * `blisterSwipe` drag — the pull come in where the tap's help was. On every
 * screen the help is drawn over a body whose shape is the TAP blister's.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

const combo = (col: number, by: BlisterBy): SpawnEntry => ({
  beat: 0,
  col,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count: 3,
  gesture: "combo",
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

describe("a press on a COMBO blister", () => {
  it("is a tap first, and a blisterSwipe drag once the tap is counted", () => {
    const world = createWorld(CFG, 3, [combo(5, 2)]);
    while (!world.creatures.some(blisterIsUp)) step(world, []);
    const body = world.creatures.find(blisterIsUp)!;
    const at = flatCenter(L, body, 0);
    const first = touchDown(L, at.x, at.y, fieldOf(world, 2));
    expect(first?.command).toEqual({ kind: "tap", id: body.id });
    step(world, [{ tick: world.tick, player: 2, command: { kind: "tap", id: body.id } }]);
    const second = touchDown(L, at.x, at.y, fieldOf(world, 2));
    expect(second?.command).toEqual({
      kind: "drag",
      target: "blisterSwipe",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: body.id,
    });
  });
});

/** Every blister pressed, then stroked to the right: tap, press, half, lift. */
function comboFrames(role: ViewRole, ticks: number, sampling: { every?: number; phase?: number }) {
  const queue = [combo(2, 1), combo(5, 2), combo(8, "both")];
  const far = CFG.blisterSwipeMilli;
  const { ctx, events } = runFrames(createWorld(CFG, 3, queue), role, ticks, {
    ...sampling,
    onTick: (tick, w) => {
      const inputs: TimedCommand[] = [];
      const step3 = tick % 3;
      for (const c of w.creatures) {
        if (!blisterIsUp(c)) continue;
        const player = blisterMayTap(c, 1) ? 1 : 2;
        if (!blisterStrokes(c)) {
          inputs.push({ tick: w.tick, player, command: { kind: "tap", id: c.id } });
          continue;
        }
        const reach = step3 === 0 ? 0 : step3 === 1 ? far / 2 : far;
        inputs.push({
          tick: w.tick,
          player,
          command: {
            kind: "drag",
            target: "blisterSwipe",
            id: c.id,
            on: step3 !== 2,
            fromMilli: reach,
            fromYMilli: 0,
          },
        });
      }
      step(w, inputs);
    },
  });
  return { ctx, blows: events.filter((e) => e.type === "blisterBlow").length };
}

describe("the COMBO blister", () => {
  const played = remembered((role) => comboFrames(role, TPB * 10, thirdOf(4, ROLES.indexOf(role))));

  for (const role of ROLES) {
    it(`draws the tap's help, then the pull, for ${role}`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really pressed and pulled blows out of them", () => {
    expect(played("test").blows).toBeGreaterThan(0);
  });
});
