import { beforeAll, describe, expect, it } from "bun:test";
import { buildQueue, CONTROL_SETS, controlSetForWave } from "@neon-spore/content";
import { createWorld, step, ticksPerBeat } from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import type { ViewRole } from "../src/layout.js";
import type { Viewport } from "../src/renderer.js";
import {
  CFG,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

/**
 * Draw the game and see whether the canvas objects. This is the check that was
 * missing when a colour went out as `rgb(...)` where a `#rrggbb` was required:
 * every type was right, every test was green, and the first frame threw.
 *
 * It asserts nothing about how the game looks — that is what
 * `tools/shape-sheet` is for. It asserts only that every value handed to the
 * canvas is one a canvas accepts, over enough frames that the moving parts
 * (the film drift, the sweep, a wave arriving, a hit, the end of a run) have
 * all been through it.
 *
 * A plain wave lives here; every subject with a picture of its own — a
 * creature, a boss, a round, the sheet after the run — has its own
 * `*-frame.test.ts` beside this one, over the loop in `frame-harness.ts`.
 */

beforeAll(installCanvasGlobals);

function frames(role: ViewRole, ticks: number, viewport: Viewport = VIEWPORT) {
  return runFrames(createWorld(CFG, 7, buildQueue(0, CFG.cols)), role, ticks, { viewport });
}

describe("a frame", () => {
  for (const role of ROLES) {
    it(`draws a wave for ${role} without the canvas refusing a value`, () => {
      // Long enough for the first creatures to reach the hull and damage it.
      const { ctx } = frames(role, ticksPerBeat(CFG) * 18);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("survives a viewport nobody designed for", () => {
    // A hidden tab reports zero, a desktop window is far wider than a phone,
    // and both used to reach the canvas as a negative radius.
    for (const viewport of [
      { width: 0, height: 0, dpr: 1 },
      { width: 3840, height: 400, dpr: 1 },
      { width: 320, height: 480, dpr: 3 },
    ]) {
      expect(() => frames("test", 8, viewport)).not.toThrow();
    }
  });
});

describe("the guard lapsing", () => {
  for (const role of ROLES) {
    it(`draws armed, lapsing and idle-again for ${role} without the canvas refusing a value`, () => {
      // One press and nothing after it: no rock ever reaches the shield's
      // column, so the window has to close unarmed rather than on a deflect.
      // That is the exact case the fading guard button exists for, and the
      // run is long enough to pass through armed, the fade, and back to idle.
      const ticks = Math.round((CFG.guardWindowMs / 1000) * CFG.tickHz) + 60;
      const { ctx } = runFrames(createWorld(CFG, 11, buildQueue(0, CFG.cols)), role, ticks, {
        every: 1,
        onTick: (tick, world) =>
          step(world, tick === 5 ? [{ tick, player: 1, command: { kind: "guard" } }] : []),
      });
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }
});

/**
 * THE PANEL DRAWN IS THE ONE THE CALLER NAMES, NOT THE ONE `world.wave` HAPPENS
 * TO INDEX IN THE SHIPPED `WAVES`.
 *
 * `world.wave` means two different things depending on who holds the world:
 * for the shipped game it indexes `WAVES`, and the two were built to agree.
 * The director plays a draft at the same index and they do not — which is why
 * `ViewState.controls` exists at all. This is the proof: a world at wave 0,
 * whose shipped wave is not on the lance panel, is drawn with the lance panel
 * the moment `controls` says so, and drawn without it the moment `controls`
 * is left unset — the same object, the same `world.wave`, two different frames.
 */
describe("the band draws the panel it is handed", () => {
  const lance = CONTROL_SETS.find((s) => s.id === "lance");
  if (!lance) throw new Error("no lance set registered");

  function drawnNames(world: ReturnType<typeof createWorld>, controls?: typeof lance) {
    const { canvas, ctx } = stubCanvas();
    const renderer = new Canvas2DRenderer(canvas);
    renderer.resize(VIEWPORT);
    const seen: string[] = [];
    const original = ctx.fillText.bind(ctx);
    ctx.fillText = (text: string, x: number, y: number) => {
      seen.push(text);
      original(text, x, y);
    };
    renderer.draw({
      world,
      beatPhase: 0,
      role: "test",
      time: 0,
      dt: 1 / 60,
      events: [],
      running: true,
      controls,
    });
    return seen;
  }

  it("follows an explicit override rather than the shipped wave at the same index", () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    // world.wave is 0, and the shipped wave there is not the lance panel —
    // proof that a match below cannot be `controlSetForWave` agreeing by luck.
    expect(controlSetForWave(world.wave).id).not.toBe(lance.id);

    expect(drawnNames(world)).not.toContain(lance.name);
    expect(drawnNames(world, lance)).toContain(lance.name);
  });
});
