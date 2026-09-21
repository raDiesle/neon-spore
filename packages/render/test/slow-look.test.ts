import { afterEach, beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, NO_SLOW, type World } from "@neon-spore/sim";
import { computeLayout, type Layout } from "../src/layout.js";
import type { ViewState } from "../src/renderer.js";
import { drawFieldSlow, SLOW_LOOK, type SlowWindow, slowWindow } from "../src/slow-look.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The seam THE SLOW's picture will hang on, and the promise that it hangs
 * nothing today** (`src/slow-look.ts`).
 *
 * The window is two hashed beats and a stretched `tickMs`, and no pass in this
 * package ever asked about it — so the one moment that exists to be felt was
 * the one moment the picture said nothing about (`docs/queue.md`, 19 September
 * 2026). What lands here is the record a VERSUS candidate patches and the pass
 * that reads it; what ships is still nothing, which is the first case below
 * and the only one of these a regression would show up in the running game.
 *
 * The window is **set** rather than played into, as `boss-cue-candle.test.ts`
 * sets THE CANDLE's: `sim/test/slow.test.ts` owns when a boss opens one, and a
 * render test that waited out `instarSlowBeats` would be that suite's second
 * copy.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Layout = computeLayout(VIEWPORT, CFG, "p1");

function slowed(from: number, to: number, beat: number): World {
  const world = createWorld(CFG, 5);
  world.beat = beat;
  world.slowFromBeat = from;
  world.slowToBeat = to;
  return world;
}

function viewOf(world: World, beatPhase: number): ViewState {
  return { world, beatPhase, role: "p1", time: 0, dt: 0 } as unknown as ViewState;
}

/** The paint back to its shipped no-op, whatever a case did to it. */
const SHIPPED = SLOW_LOOK.paint;
afterEach(() => {
  SLOW_LOOK.paint = SHIPPED;
});

describe("the shipped look", () => {
  it("draws nothing inside a window, which is what it drew before this file", () => {
    const { ctx } = stubCanvas();
    const world = slowed(4, 8, 5);
    drawFieldSlow(ctx as unknown as CanvasRenderingContext2D, LAYOUT, world, viewOf(world, 0.5));
    expect(ctx.calls).toBe(0);
  });
});

describe("slowWindow", () => {
  it("is null on an ordinary frame", () => {
    const world = createWorld(CFG, 5);
    expect(world.slowToBeat).toBe(NO_SLOW);
    expect(slowWindow(world, 0)).toBeNull();
  });

  it("is null on the beat the window shuts — half-open, like every window here", () => {
    expect(slowWindow(slowed(4, 8, 8), 0)).toBeNull();
  });

  it("runs 0 to 1 across the window, and counts the beats left down with it", () => {
    const at = (beat: number, phase: number): SlowWindow => {
      const win = slowWindow(slowed(4, 8, beat), phase);
      if (win === null) throw new Error(`no window at beat ${beat}`);
      return win;
    };
    expect(at(4, 0).beats).toBe(4);
    expect(at(4, 0).through).toBe(0);
    expect(at(4, 0).left).toBe(4);
    expect(at(6, 0).through).toBe(0.5);
    expect(at(6, 0).left).toBe(2);
    // The phase is the only interpolation the simulation allows, and the
    // border a candidate closes has to move on it rather than in beat steps.
    expect(at(6, 0.5).through).toBe(0.625);
    expect(at(7, 0.75).left).toBe(0.25);
  });

  /**
   * A second window opened while one is up moves the end and keeps the start
   * (`sim/slow.ts`), which THE INSTAR does whenever a mark is taken during the
   * span a step already opened. What the picture must not do is restart: one
   * border closing over the whole of it, not two halves.
   */
  it("reads a re-opened window as one wider window, not a new one", () => {
    const win = slowWindow(slowed(4, 12, 6), 0);
    expect(win?.beats).toBe(8);
    expect(win?.through).toBe(0.25);
  });
});

describe("the pass", () => {
  it("hands the window to the paint, once, and only inside one", () => {
    const seen: SlowWindow[] = [];
    SLOW_LOOK.paint = (_ctx, _l, _w, _v, win) => {
      seen.push(win);
    };
    const { ctx } = stubCanvas();
    const draw = (world: World, phase: number) =>
      drawFieldSlow(
        ctx as unknown as CanvasRenderingContext2D,
        LAYOUT,
        world,
        viewOf(world, phase),
      );
    draw(createWorld(CFG, 5), 0);
    expect(seen).toHaveLength(0);
    draw(slowed(4, 8, 5), 0.25);
    expect(seen).toHaveLength(1);
    expect(seen[0]?.through).toBeCloseTo(0.3125, 6);
  });

  /**
   * Nothing this pass knows outlives the frame it was read in. A candidate
   * that remembers has to say so in `Effects` and be cleared in
   * `Effects.reset()` (`test/restart.test.ts`); the *seam* remembers nothing,
   * so a window that has shut leaves no second call behind it.
   */
  it("forgets a window the moment it shuts", () => {
    let calls = 0;
    SLOW_LOOK.paint = () => {
      calls++;
    };
    const { ctx } = stubCanvas();
    const world = slowed(4, 6, 4);
    for (let beat = 4; beat < 10; beat++) {
      world.beat = beat;
      drawFieldSlow(ctx as unknown as CanvasRenderingContext2D, LAYOUT, world, viewOf(world, 0));
    }
    expect(calls).toBe(2);
  });
});
