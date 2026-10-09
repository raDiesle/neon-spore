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
import { Rubs } from "../src/rub-turns.js";
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
 * THE BLISTER's RUB, pressed and drawn (`blister-tap.ts`, `blister-help.ts`):
 * a press on one that is up takes a rubbing hold and says nothing, the host's
 * count says the reversals with the body riding along, and on every screen
 * the rub's line and arrows are drawn over a body whose shape is the TAP
 * blister's.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

const rubbed = (col: number, by: BlisterBy): SpawnEntry => ({
  beat: 0,
  col,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count: 3,
  gesture: "rub",
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

describe("a press on a RUB blister", () => {
  it("takes a rubbing hold, and the host's count carries the body", () => {
    const world = createWorld(CFG, 3, [rubbed(5, 2)]);
    while (!world.creatures.some(blisterIsUp)) step(world, []);
    const body = world.creatures.find(blisterIsUp)!;
    const at = flatCenter(L, body, 0);
    const down = touchDown(L, at.x, at.y, fieldOf(world, 2));
    expect(down?.command).toBeNull();
    expect(down?.hold).toMatchObject({ target: "blisterRub", rub: true, id: body.id });
    const rubs = new Rubs();
    expect(rubs.down(7, [down!.hold!], at.x, at.y)?.command).toMatchObject({
      target: "blisterRub",
      fromMilli: body.id,
      id: 0,
    });
    rubs.move(L, 7, at.x + L.tile / 2, at.y);
    const back = rubs.move(L, 7, at.x, at.y);
    expect(back?.command).toMatchObject({
      target: "blisterRub",
      on: true,
      fromMilli: body.id,
      id: 1,
    });
    expect(rubs.up(7)?.command).toMatchObject({ on: false, fromMilli: body.id, id: 1 });
  });

  it("is not answered on the seat its `by` does not name", () => {
    const world = createWorld(CFG, 3, [rubbed(5, 2)]);
    while (!world.creatures.some(blisterIsUp)) step(world, []);
    const at = flatCenter(L, world.creatures.find(blisterIsUp)!, 0);
    expect(touchDown(L, at.x, at.y, fieldOf(world, 1))?.hold?.kind).not.toBe("drag");
  });
});

/** Every blister rubbed by the hand its `by` names, a reversal every other tick. */
function rubFrames(role: ViewRole, ticks: number, sampling: { every?: number; phase?: number }) {
  const queue = [rubbed(2, 1), rubbed(5, 2), rubbed(8, "both")];
  const { ctx, events } = runFrames(createWorld(CFG, 3, queue), role, ticks, {
    ...sampling,
    onTick: (tick, w) => {
      const inputs: TimedCommand[] = [];
      for (const c of w.creatures) {
        if (!blisterIsUp(c)) continue;
        const player = blisterMayTap(c, 1) ? 1 : 2;
        // One thumb that never lifts, turning back every other tick.
        const command = {
          kind: "drag",
          target: "blisterRub",
          on: true,
          fromMilli: c.id,
          fromYMilli: 0,
          id: Math.floor(tick / 2),
        } as const;
        inputs.push({ tick: w.tick, player, command });
      }
      step(w, inputs);
    },
  });
  return { ctx, blows: events.filter((e) => e.type === "blisterBlow").length };
}

describe("the RUB blister", () => {
  const played = remembered((role) => rubFrames(role, TPB * 10, thirdOf(4, ROLES.indexOf(role))));

  for (const role of ROLES) {
    it(`draws the rub's line and arrows for ${role}`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really rubbed blows out of them", () => {
    expect(played("test").blows).toBeGreaterThan(0);
  });
});
