import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue, CONTROL_SETS, control, controlSetForWave } from "@neon-spore/content";
import { createWorld, step, ticksPerBeat } from "@neon-spore/sim";
import { bandControlSet } from "../src/band.js";
import { bandLobes } from "../src/band-lobes.js";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { computeLayout, computeStage, type ViewRole } from "../src/layout.js";
import type { Viewport } from "../src/renderer.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

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
 *
 * **What is read off the frame is the buttons, not a plate naming the panel.**
 * It used to be the latter, and the band drew no such plate any more: the owner
 * asked for the panel's name to come off the playing screen entirely, because a
 * label reading STANDARD 2 tells a player there is a STANDARD 3 (`band.ts`).
 * The lobes are the better witness anyway — THE CLAW's panel trades the maw and
 * the colours for an arm and a mouth of its own, so the two frames differ by
 * which buttons are on the band, which is the difference the override makes.
 *
 * **How a lobe is read changed when the words came off it.** An action button
 * used to write its own name and the frame could be searched for the string;
 * it draws an emblem now and writes nothing (`action-face.ts`), so the two
 * strip captions are all the text a band still carries. Those alone would
 * prove only half of this — the shield strip going away — so the row itself is
 * asked of `bandLobes`, which is not a re-derivation but the very function
 * `band.ts` calls to place and draw the circles, and `hover.ts` and `touch.ts`
 * to answer a thumb. What is asserted is still the buttons the override puts
 * on the band, read from the one place that decides them.
 */
describe("the band draws the panel it is handed", () => {
  const claw = CONTROL_SETS.find((s) => s.id === "claw");
  if (!claw) throw new Error("no claw set registered");

  function drawnNames(world: ReturnType<typeof createWorld>, controls?: typeof claw) {
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

  /** The ids on one seat's row of the band, or on both — `band.ts`'s own
   * `bandLobes`, asked the same question the drawing pass asks it. */
  function lobeIds(
    world: ReturnType<typeof createWorld>,
    controls?: typeof claw,
    player?: 1 | 2,
  ): string[] {
    const stage = computeStage(VIEWPORT, world.cfg, "test");
    const layout = computeLayout(
      { width: stage.width, height: stage.height, dpr: VIEWPORT.dpr },
      world.cfg,
      "test",
    );
    const set = bandControlSet(controls, world.wave);
    const seats: (1 | 2)[] = player ? [player] : [1, 2];
    return seats.flatMap((p) => bandLobes(layout, set, p).map((lobe) => lobe.control.id));
  }

  it("follows an explicit override rather than the shipped wave at the same index", () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    // SALVAGE, the first wave played on the whole standard panel — so the
    // shipped frame has a maw on it and the override's frame has an arm, which
    // is a trade in both directions rather than a button added.
    world.wave = 13;
    expect(controlSetForWave(world.wave).id).not.toBe(claw.id);
    // The arm is on THE CLAW's panel and on no other, so it is the whole of
    // the difference in one direction.
    expect(lobeIds(world)).not.toContain("reach");
    expect(lobeIds(world, claw)).toContain("reach");
    // And the trade in the other direction, so the override is a whole panel
    // rather than a button added to the one the wave already had. The mouth is
    // on both panels and moves seat rather than going away: the shipped maw is
    // player 1's `intake` and the claw's is player 2's `mawTake`
    // (`control-sets-table.ts`).
    expect(lobeIds(world, undefined, 1)).toContain("intake");
    expect(lobeIds(world, claw, 2)).toContain("mawTake");
    expect(lobeIds(world, claw, 1)).not.toContain("intake");

    // And the strips, which are the only text a band still writes: the shipped
    // panel gives player 2 a shield to slide and THE CLAW's does not.
    const shipped = drawnNames(world);
    const overridden = drawnNames(world, claw);
    expect(shipped).toContain(control("shield").label);
    expect(overridden).not.toContain(control("shield").label);
  });
});
