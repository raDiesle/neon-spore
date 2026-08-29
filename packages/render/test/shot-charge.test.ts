import { beforeAll, describe, expect, it } from "bun:test";
import {
  chargeMilli,
  chargePartTicks,
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { drawLay } from "../src/cannon-maw.js";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The shot being laid, drawn — the muzzle dilating, the skin beside it parting
 * and the bolt gathering behind the opening (`cannon-maw.ts`).
 *
 * None of it is reachable from `frame.test.ts`: every world there is built
 * from `DEFAULT_CONFIG`, where `shotChargeBeats` is zero and a press is a
 * bullet with no wind-up at all. So this file is what `frame-pair.test.ts` is
 * for the pair switches — the same strict canvas, over the one configuration
 * that reaches this picture.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, shotChargeBeats: 0.5 };
const TPB = ticksPerBeat(CFG);
const PART = chargePartTicks(CFG);
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const COL = 3;

beforeAll(installCanvasGlobals);

/**
 * A press, the half beat it waits, and the bolt going out — twice over, so the
 * opening is drawn shut, dilating, at full and shut again.
 */
function layFrames(role: ViewRole, ticks: number) {
  const queue: SpawnEntry[] = [
    { beat: 0, col: COL, kind: "slick", color: "red" },
    { beat: 2, col: COL, kind: "slick", color: "red" },
  ];
  const world = createWorld(CFG, 5, queue);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });

  let laid = 0;
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    const inputs: TimedCommand[] =
      tick === 0
        ? [{ tick, player: 1, command: { kind: "cannonCol", col: COL } }]
        : tick === 3 || tick === TPB + 3
          ? [{ tick, player: 2, command: { kind: "fire", color: "red" } }]
          : [];
    step(world, inputs);
    if (world.charge !== null) laid++;
    if (world.events.length) events.push(...world.events);
    // Every second tick is a frame here, not every fourth: a wind-up is 38
    // ticks long and the top of it is a handful of them.
    if (tick % 2 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % TPB) / TPB,
      role,
      time: tick / CFG.tickHz,
      dt: 2 / CFG.tickHz,
      events,
      running: true,
    });
    events = [];
  }
  return { world, ctx, laid };
}

describe("the shot being laid", () => {
  for (const role of ROLES) {
    it(`draws the wind-up and the departure for ${role} without the canvas refusing a value`, () => {
      const { ctx } = layFrames(role, TPB * 3);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really spent frames with a charge in the muzzle, or those proved nothing", () => {
    const { laid, world } = layFrames("test", TPB * 3);
    // Two presses, each waiting most of a half beat.
    expect(laid).toBeGreaterThan(PART);
    // And both of them arrived as bolts rather than being swallowed.
    expect(world.balance.colorHits).toBeGreaterThan(0);
  });
});

describe("the opening itself", () => {
  const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
  const surface = (x: number) => ({ x, y: L.hullY });

  it("draws nothing at all when no shot is being laid", () => {
    const { ctx } = stubCanvas();
    drawLay(
      ctx as unknown as CanvasRenderingContext2D,
      L,
      0,
      1.4,
      L.gridLeft + 40,
      L.hullY,
      0,
      surface,
    );
    expect(ctx.calls).toBe(0);
  });

  it("draws more of itself the closer the shot is to going", () => {
    const at = (lay: number): number => {
      const { ctx } = stubCanvas();
      drawLay(
        ctx as unknown as CanvasRenderingContext2D,
        L,
        lay,
        1.4,
        L.gridLeft + 40,
        L.hullY,
        0,
        surface,
      );
      return ctx.calls;
    };
    // Not a pixel comparison — the stub cannot make one. Only that the picture
    // exists at both ends of the wind-up and that neither end is refused.
    expect(at(0.15)).toBeGreaterThan(0);
    expect(at(1)).toBeGreaterThan(0);
  });

  it("is a share of the world's own countdown and nothing render/ keeps", () => {
    // The one thing that would break lockstep's picture: a wind-up counted on
    // the frame rate instead of on the tick both devices share.
    const world = createWorld(CFG, 1);
    step(world, [{ tick: 0, player: 2, command: { kind: "fire", color: "cyan" } }]);
    const early = chargeMilli(world);
    for (let i = 0; i < 20; i++) step(world, []);
    expect(chargeMilli(world)).toBeGreaterThan(early);
    expect(chargeMilli(world)).toBeLessThanOrEqual(1000);
  });
});
