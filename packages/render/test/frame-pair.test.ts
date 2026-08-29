import { beforeAll, describe, expect, it } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import {
  ackBriefing,
  briefingHolds,
  createWorld,
  DEFAULT_CONFIG,
  guideHolds,
  introHolds,
  PAIR_ON,
  readyFraction,
  readyHoldTicks,
  type SimConfig,
  type SimEvent,
  seatReady,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import type { ViewRole } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The other half of `frame.test.ts`.
 *
 * Every world in that file is built from `DEFAULT_CONFIG`, and both pair
 * switches (`config-pair.ts`) are off there on purpose — a determinism run, a
 * shape sheet and the director all want the wave rather than the lesson. The
 * consequence is that a wave's opening (`briefing.ts`) and the ready circles a
 * guide ends on (`ready-circles.ts`) are two of the newest things this renderer
 * draws and neither is reached by anything in that file, or anywhere in CI.
 *
 * This file is `PAIR_ON` for the same reason `apps/game` is: it is the one
 * caller here with a reason to see the lesson rather than the wave. An opening
 * up in every role, and a gate part filled and fully filled in every role, are
 * what the switch buys, and this file is what stands in for the throwaway
 * harnesses that checked them by hand and were then deleted.
 */

const CFG_PAIR: SimConfig = { ...DEFAULT_CONFIG, ...PAIR_ON };
const ROLES: ViewRole[] = ["p1", "p2", "test"];

beforeAll(installCanvasGlobals);

/**
 * A wave 0 that opens on its own card, drawn and never dismissed — the card
 * is meant to stay up for as long as anyone is looking at it, so nothing here
 * ever sends a `brief` command.
 */
function briefingFrames(
  role: ViewRole,
  ticks: number,
  acked: 0 | 1 = 0,
  viewport = { width: 900, height: 1600, dpr: 2 },
) {
  const world = createWorld(CFG_PAIR, 7, buildQueue(0, CFG_PAIR.cols));
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize(viewport);
  // One seat is already done: the footer's "WAITING FOR THEM"
  // and one filled pip are only reached with the two seats disagreeing.
  if (acked === 1) ackBriefing(world, 1);

  const tpb = ticksPerBeat(CFG_PAIR);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    step(world, []);
    if (world.events.length) events.push(...world.events);
    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role,
      time: tick / CFG_PAIR.tickHz,
      dt: 4 / CFG_PAIR.tickHz,
      events,
      running: true,
    });
    events = [];
  }
  return { world, ctx };
}

describe("a wave's opening", () => {
  for (const role of ROLES) {
    it(`draws the introduction for ${role} without the canvas refusing a value`, () => {
      const { world, ctx } = briefingFrames(role, ticksPerBeat(CFG_PAIR) * 6);
      // It really was up for every one of those frames, or this proves
      // nothing about `drawWaveOpening` at all.
      expect(introHolds(world)).toBe(true);
      expect(ctx.calls).toBeGreaterThan(500);
    });

    it(`draws one seat waiting on the other for ${role}`, () => {
      const { world, ctx } = briefingFrames(role, ticksPerBeat(CFG_PAIR) * 6, 1);
      expect(briefingHolds(world)).toBe(true);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("never opens under `DEFAULT_CONFIG` — only `PAIR_ON` reaches it", () => {
    const world = createWorld(DEFAULT_CONFIG, 7, buildQueue(0, DEFAULT_CONFIG.cols));
    expect(briefingHolds(world)).toBe(false);
  });
});

/**
 * A wave whose guide is up, with the two ready circles under it — both thumbs
 * down for `fillTicks` ticks, so the arcs are drawn part way round and, if
 * that is long enough, full and saying READY.
 *
 * Wave 0 carries a guide (`packages/content/src/waves/act-1.ts`), and it is
 * passed to `startWave` by hand: `createWorld` never claims one, so nothing
 * else in this file has ever reached the guide at all.
 */
function gateFrames(
  role: ViewRole,
  fillTicks: number,
  viewport = { width: 900, height: 1600, dpr: 2 },
) {
  const world = createWorld(CFG_PAIR, 7);
  startWave(world, 0, buildQueue(0, CFG_PAIR.cols), [], null, true);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize(viewport);
  // Past the introduction and onto the guide, without waiting out its timer.
  ackBriefing(world, 1);
  ackBriefing(world, 2);

  const tpb = ticksPerBeat(CFG_PAIR);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < fillTicks; tick++) {
    step(world, [
      { tick, player: 1, command: { kind: "brief", on: true } },
      { tick, player: 2, command: { kind: "brief", on: true } },
    ]);
    if (world.events.length) events.push(...world.events);
    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role,
      time: tick / CFG_PAIR.tickHz,
      dt: 4 / CFG_PAIR.tickHz,
      events,
      running: true,
    });
    events = [];
  }
  return { world, ctx };
}

describe("the ready gate", () => {
  const FULL = readyHoldTicks(CFG_PAIR);

  for (const role of ROLES) {
    it(`draws two part-filled circles for ${role} without the canvas refusing a value`, () => {
      const { world, ctx } = gateFrames(role, Math.floor(FULL / 2));
      expect(guideHolds(world)).toBe(true);
      expect(readyFraction(world, 1)).toBeGreaterThan(0);
      expect(seatReady(world, 1)).toBe(false);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("draws one circle saying READY while the other is still empty", () => {
    // Only player 1 holds, so the guide stays up with a latched READY on one
    // side — the state the pair is in for as long as one of them is still
    // reading, and the only one that draws the word.
    const world = createWorld(CFG_PAIR, 7);
    startWave(world, 0, buildQueue(0, CFG_PAIR.cols), [], null, true);
    ackBriefing(world, 1);
    ackBriefing(world, 2);
    const { canvas, ctx } = stubCanvas();
    const renderer = new Canvas2DRenderer(canvas);
    renderer.resize({ width: 900, height: 1600, dpr: 2 });
    for (let tick = 0; tick < FULL + 8; tick++) {
      step(world, [{ tick, player: 1, command: { kind: "brief", on: true } }]);
    }
    expect(seatReady(world, 1)).toBe(true);
    expect(seatReady(world, 2)).toBe(false);
    expect(guideHolds(world)).toBe(true);
    renderer.draw({
      world,
      beatPhase: 0,
      role: "p1",
      time: 1,
      dt: 1 / CFG_PAIR.tickHz,
      events: [],
      running: true,
    });
    // One frame rather than a run of them, so the bar is lower than above.
    expect(ctx.calls).toBeGreaterThan(100);
  });

  it("fills both circles and the wave starts", () => {
    const { world } = gateFrames("test", FULL);
    expect(guideHolds(world)).toBe(false);
  });
});
