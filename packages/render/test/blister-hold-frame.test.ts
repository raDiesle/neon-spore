import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  type BlisterBy,
  blisterIsUp,
  blisterMayTap,
  createWorld,
  gripsCreature,
  NO_GRIP,
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
 * THE BLISTER's HOLD, pressed and drawn (`blister-tap.ts`, `blister-help.ts`):
 * a mouse press on one that is up takes hold as a thumb does, its lift lets
 * go, and on every screen the hold's mark, its dial and the green held ring
 * are drawn over a body whose shape is the TAP blister's.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

const held = (col: number, by: BlisterBy): SpawnEntry => ({
  beat: 0,
  col,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count: 3,
  gesture: "hold",
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

describe("a mouse press on a HOLD blister", () => {
  it("takes hold as a thumb does, and its lift lets go", () => {
    const world = createWorld(CFG, 3, [held(5, 2)]);
    while (!world.creatures.some(blisterIsUp)) step(world, []);
    const body = world.creatures.find(blisterIsUp)!;
    const at = flatCenter(L, body, 0);
    const down = touchDown(L, at.x, at.y, fieldOf(world, 2));
    expect(down?.command).toEqual({ kind: "grip", id: body.id });
    step(world, [{ tick: world.tick, player: 2, command: down!.command! }]);
    expect(gripsCreature(world, 2, body.id)).toBe(true);
    const up = touchUp(L, down!.hold!, at);
    expect(up?.command).toEqual({ kind: "grip", id: NO_GRIP });
  });

  it("is not answered on the seat its `by` does not name", () => {
    const world = createWorld(CFG, 3, [held(5, 2)]);
    while (!world.creatures.some(blisterIsUp)) step(world, []);
    const at = flatCenter(L, world.creatures.find(blisterIsUp)!, 0);
    expect(touchDown(L, at.x, at.y, fieldOf(world, 1))?.command?.kind).not.toBe("grip");
  });
});

/** Every blister held by the hand its `by` names, from the tick it comes up. */
function holdFrames(role: ViewRole, ticks: number, sampling: { every?: number; phase?: number }) {
  const queue = [held(2, 1), held(5, 2), held(8, "both")];
  const { ctx, events } = runFrames(createWorld(CFG, 3, queue), role, ticks, {
    ...sampling,
    onTick: (_tick, w) => {
      const inputs: TimedCommand[] = [];
      for (const c of w.creatures) {
        if (!blisterIsUp(c)) continue;
        const player = blisterMayTap(c, 1) ? 1 : 2;
        if (!gripsCreature(w, player, c.id))
          inputs.push({ tick: w.tick, player, command: { kind: "grip", id: c.id } });
      }
      step(w, inputs);
    },
  });
  return { ctx, blows: events.filter((e) => e.type === "blisterBlow").length };
}

describe("the HOLD blister", () => {
  const played = remembered((role) => holdFrames(role, TPB * 10, thirdOf(4, ROLES.indexOf(role))));

  for (const role of ROLES) {
    it(`draws the hold's mark, its dial and the held ring for ${role}`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really held blows out of them", () => {
    expect(played("test").blows).toBeGreaterThan(0);
  });
});
