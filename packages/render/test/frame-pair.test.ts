import { beforeAll, describe, expect, it } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import {
  ackBriefing,
  briefingHolds,
  createWorld,
  currentBriefing,
  DEFAULT_CONFIG,
  forkHeld,
  forkOpen,
  PAIR_ON,
  type SimConfig,
  type SimEvent,
  step,
  type TimedCommand,
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
 * consequence is that the briefing card (`briefing.ts`) and THE FORK's overlay
 * (`hud.ts`'s `drawFork`) are two of the newest things this renderer draws and
 * neither is reached by anything in that file, or by anything else in CI.
 *
 * This file is `PAIR_ON` for the same reason `apps/game` is: it is the one
 * caller here with a reason to see the lesson rather than the wave. A card up
 * in every role and a fork open and held and unheld in every role are the two
 * things the switch buys, and this file is what stands in for the two
 * throwaway harnesses that checked them by hand and were then deleted.
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
  // One seat has already put the card away: the footer's "WAITING FOR THEM"
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
      banner: null,
    });
    events = [];
  }
  return { world, ctx };
}

describe("the briefing card", () => {
  for (const role of ROLES) {
    it(`draws the split card for ${role} without the canvas refusing a value`, () => {
      const { world, ctx } = briefingFrames(role, ticksPerBeat(CFG_PAIR) * 6);
      // It really was up for every one of those frames, or this proves
      // nothing about `drawBriefing` at all.
      expect(currentBriefing(world)).toBe("opening");
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
    expect(currentBriefing(world)).toBeNull();
  });
});

/**
 * THE FORK, with both switches on exactly as the game ships them: the wave's
 * own opening card is read and dismissed first — `fork.ts`'s note on the
 * order the two gates run in — and the field then clears with nothing
 * queued, so the rest runs out into a fork on its own.
 */
function forkFrames(
  role: ViewRole,
  ticks: number,
  held: boolean,
  viewport = { width: 900, height: 1600, dpr: 2 },
) {
  const world = createWorld(CFG_PAIR, 11, []);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize(viewport);

  const tpb = ticksPerBeat(CFG_PAIR);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    const cmds: TimedCommand[] = briefingHolds(world)
      ? [
          { tick, player: 1, command: { kind: "brief" } },
          { tick, player: 2, command: { kind: "brief" } },
        ]
      : held && forkOpen(world)
        ? [{ tick, player: 1, command: { kind: "prime", on: true } }]
        : [];
    step(world, cmds);
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
      banner: null,
    });
    events = [];
  }
  return { world, ctx };
}

describe("the fork", () => {
  // The opening card costs one tick; the wave then clears on its first beat
  // and the rest runs `waveRestBeats` beats before the fork opens. A few
  // beats of slack past that so a run of frames is drawn with it standing
  // open, not just the one it opened on.
  const OPEN_TICKS = ticksPerBeat(CFG_PAIR) * (CFG_PAIR.waveRestBeats + 6);

  for (const role of ROLES) {
    it(`draws an unheld fork for ${role} without the canvas refusing a value`, () => {
      const { world, ctx } = forkFrames(role, OPEN_TICKS, false);
      expect(forkOpen(world)).toBe(true);
      expect(forkHeld(world)).toBe(false);
      expect(ctx.calls).toBeGreaterThan(500);
    });

    it(`draws a held fork for ${role} without the canvas refusing a value`, () => {
      const { world, ctx } = forkFrames(role, OPEN_TICKS, true);
      expect(forkOpen(world)).toBe(true);
      expect(forkHeld(world)).toBe(true);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }
});
