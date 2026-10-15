import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  type BlisterBy,
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
import { touchDown } from "../src/touch.js";
import type { Field } from "../src/touch-field.js";
import { touchMove } from "../src/touch-move.js";
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
 * THE BLISTER's LEVER, pressed and drawn (`blister-tap.ts`,
 * `blister-lever-help.ts`): a press on one that is up takes its knob as a
 * `blisterLever` drag, every move carries it down the groove, and on every
 * screen the groove, its band and the knob are drawn over the TAP blister's body.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

const levered = (col: number, by: BlisterBy): SpawnEntry => ({
  beat: 0,
  col,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count: 3,
  gesture: "lever",
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

describe("a press on a LEVER blister", () => {
  it("takes its knob as a blisterLever drag, and a move carries it down the groove", () => {
    const world = createWorld(CFG, 3, [levered(5, 2)]);
    while (!world.creatures.some(blisterIsUp)) step(world, []);
    const body = world.creatures.find(blisterIsUp)!;
    const at = flatCenter(L, body, 0);
    const down = touchDown(L, at.x, at.y, fieldOf(world, 2));
    expect(down?.command).toEqual({
      kind: "drag",
      target: "blisterLever",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: body.id,
    });
    const moved = touchMove(L, down!.hold!, at.x, at.y + L.tile);
    expect(moved?.command).toMatchObject({ target: "blisterLever", on: true, fromYMilli: 1000 });
  });
});

/** Every blister's knob taken, carried into its band and held: press, then the band. */
function leverFrames(role: ViewRole, ticks: number, sampling: { every?: number; phase?: number }) {
  const queue = [levered(2, 1), levered(5, 2), levered(8, "both")];
  const band = Math.round((CFG.blisterLeverFromMilli + CFG.blisterLeverToMilli) / 2);
  const { ctx, events } = runFrames(createWorld(CFG, 3, queue), role, ticks, {
    ...sampling,
    onTick: (_tick, w) => {
      const inputs: TimedCommand[] = [];
      for (const c of w.creatures) {
        if (!blisterIsUp(c)) continue;
        const player = blisterMayTap(c, 1) ? 1 : 2;
        const spent = ((c.blisterStrokes ?? 0) & (player << 2)) !== 0;
        const on = !spent;
        const fromYMilli = (c.blisterStrokes ?? 0) & player ? band : 0;
        inputs.push({
          tick: w.tick,
          player,
          command: { kind: "drag", target: "blisterLever", id: c.id, on, fromMilli: 0, fromYMilli },
        });
      }
      step(w, inputs);
    },
  });
  return { ctx, blows: events.filter((e) => e.type === "blisterBlow").length };
}

describe("the LEVER blister", () => {
  const played = remembered((role) => leverFrames(role, TPB * 10, thirdOf(4, ROLES.indexOf(role))));

  for (const role of ROLES) {
    it(`draws the groove, its band and the knob for ${role}`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really held blows out of them", () => {
    expect(played("test").blows).toBeGreaterThan(0);
  });
});
