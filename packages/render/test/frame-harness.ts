import { buildBoss, buildQueue, type ControlSet, WAVES, type Wave } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import type { ViewRole } from "../src/layout.js";
import type { Viewport } from "../src/renderer.js";
import type { ShipHand } from "../src/touch-ship.js";
import type { StubContext } from "./canvas-stub.js";
import { stubCanvas } from "./canvas-stub.js";

/**
 * One run of the game through a canvas that refuses what a real one refuses.
 *
 * Every frame test in this package used to carry its own copy of the same
 * twenty lines — step, collect `world.events`, draw every fourth tick, clear
 * the events — and the copies had begun to disagree about which tick a frame
 * falls on. The differences between subjects are all in what happens *during*
 * a tick, so that is the one thing left to the caller (`onTick`); the loop,
 * the renderer, the viewport and the event bookkeeping live here.
 *
 * It asserts nothing about how the game looks — that is what
 * `tools/shape-sheet` is for. It asserts only that every value handed to the
 * canvas is one a canvas accepts.
 */

export { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

export const CFG = DEFAULT_CONFIG;
export const ROLES: ViewRole[] = ["p1", "p2", "test"];
export const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

/** The index of the wave carrying a boss of this kind. */
export function waveWith(kind: NonNullable<Wave["boss"]>["kind"]): number {
  const index = WAVES.findIndex((w) => w.boss?.kind === kind);
  if (index === -1) throw new Error(`no wave carries the ${kind}`);
  return index;
}

/**
 * A wave stepped to the tick where it carries the most bodies — its dearest
 * picture, which is the one a budget wants to be a ceiling on.
 *
 * Two passes rather than one, because a world only goes forwards: the first
 * finds the busiest tick and the second builds a fresh world and stops there.
 * The simulation is deterministic from a seed, so the two runs are the same
 * run — that is the property rule 2 in `CLAUDE.md` exists for.
 *
 * **The wave is named by id, not by index**, for `frame-budget.test.ts`'s
 * reason: a wave inserted earlier in the campaign moves every index after it,
 * and an index here would be a silent claim about the order of the whole game.
 */
export function peakWorld(id: string, seed = 3, beats = 24): World {
  const index = WAVES.findIndex((w) => w.id === id);
  if (index === -1) throw new Error(`no wave with the id ${id}`);
  const build = () => {
    const world = createWorld(DEFAULT_CONFIG, seed, []);
    startWave(
      world,
      index,
      buildQueue(index, DEFAULT_CONFIG.cols),
      [],
      buildBoss(index, DEFAULT_CONFIG.cols),
    );
    return world;
  };
  const ticks = ticksPerBeat(DEFAULT_CONFIG) * beats;
  const scout = build();
  let peakTick = 0;
  let peak = scout.creatures.length;
  for (let t = 1; t <= ticks; t++) {
    step(scout, []);
    if (scout.creatures.length > peak) {
      peak = scout.creatures.length;
      peakTick = t;
    }
  }
  const world = build();
  for (let t = 0; t < peakTick; t++) step(world, []);
  return world;
}

export interface FramesOptions {
  viewport?: Viewport;
  /**
   * Draw every nth tick. Four is about what 60 Hz gives at 120 Hz; a creature
   * whose whole picture happens between beats wants a finer sampling than
   * that, and a button that fades wants every tick.
   */
  every?: number;
  /**
   * What happens on this tick, stepping the world itself. The default steps
   * with no commands; a subject that needs a press, a mid-run mutation or a
   * second step does it here, before the events of the tick are collected.
   */
  onTick?: (tick: number, world: World) => void;
  /**
   * The canvas, before a frame has been drawn on it — for a caller that wants
   * the ordered log of every call, which is how two seats are compared as
   * pictures rather than as counts.
   */
  onCanvas?: (ctx: StubContext) => void;
  /**
   * The canvas just after the nth frame was drawn on it — for a caller that
   * measures one frame at a time and needs the tally zeroed between them.
   */
  onDrawn?: (ctx: StubContext, frame: number) => void;
  /**
   * The panel to draw, for a caller standing in for a host playing a wave the
   * shipped `WAVES` does not hold — the director's draft. Left unset, the
   * drawing infers it from `world.wave`, which is the phone's case.
   */
  controls?: ControlSet;
  /**
   * What this device's own hand is on, for a caller drawing the ring that
   * says so. Unset everywhere else, which is what a host with no pointer of
   * its own hands the renderer.
   */
  hand?: ShipHand;
}

/**
 * Runs `world` for `ticks`, drawing it as `role`. Returns the world it left
 * behind, the canvas that took the frames, the renderer that drew them — for
 * a caller that carries on drawing after the run, which is how a restart is
 * told from a fresh start — and every event the run produced, the last of
 * which is what a caller checks when it needs to know the run reached the
 * state its frames were supposed to prove.
 */
export function runFrames(
  world: World,
  role: ViewRole,
  ticks: number,
  options: FramesOptions = {},
): { world: World; ctx: StubContext; renderer: Canvas2DRenderer; events: SimEvent[] } {
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize(options.viewport ?? VIEWPORT);
  options.onCanvas?.(ctx);

  const every = options.every ?? 4;
  // The world's own configuration, not `DEFAULT_CONFIG`: a subject built on
  // `PAIR_ON` or a charged shot runs at whatever tempo it was created with.
  const cfg = world.cfg;
  const tpb = ticksPerBeat(cfg);
  const all: SimEvent[] = [];
  let events: SimEvent[] = [];
  let frame = 0;
  for (let tick = 0; tick < ticks; tick++) {
    if (options.onTick) options.onTick(tick, world);
    else step(world, []);
    if (world.events.length) {
      events.push(...world.events);
      all.push(...world.events);
    }
    if (tick % every !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role,
      time: tick / cfg.tickHz,
      dt: every / cfg.tickHz,
      events,
      running: true,
      controls: options.controls,
      hand: options.hand,
    });
    events = [];
    options.onDrawn?.(ctx, frame++);
  }
  return { world, ctx, renderer, events: all };
}
