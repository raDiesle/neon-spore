import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import { createWorld, step, ticksPerBeat } from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import type { ViewRole } from "../src/layout.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The screen after the run draws numbers no other frame does — a percentage
 * that can be null, bars whose width comes from a division, and a run that
 * ended before anything was asked of the pair. All three used to be
 * unreachable, because no frame in this package ever set `over`.
 */

beforeAll(installCanvasGlobals);

describe("the balance sheet", () => {
  function overFrame(role: ViewRole, fill: (world: ReturnType<typeof createWorld>) => void) {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    const { canvas, ctx } = stubCanvas();
    const renderer = new Canvas2DRenderer(canvas);
    renderer.resize(VIEWPORT);

    for (let tick = 0; tick < ticksPerBeat(CFG) * 4; tick++) step(world, []);
    fill(world);
    world.over = true;

    for (let frame = 0; frame < 4; frame++) {
      renderer.draw({
        world,
        beatPhase: 0,
        role,
        time: frame / 15,
        dt: 1 / 15,
        events: [],
        running: true,
      });
    }
    return ctx;
  }

  for (const role of ROLES) {
    it(`draws a run worth talking about for ${role}`, () => {
      const ctx = overFrame(role, (world) => {
        world.guard.tries = 9;
        world.guard.deflected = 6;
        world.guard.mistimed = 2;
        world.balance.podsFreed = 4;
        world.balance.podsTaken = 3;
        world.balance.podsLost = 1;
        world.balance.colorHits = 14;
        world.balance.colorMisses = 3;
        world.balance.bestStreak = 11;
        world.balance.wavesCleared = 3;
      });
      expect(ctx.calls).toBeGreaterThan(50);
    });
  }

  it("draws a run that asked nothing of the pair", () => {
    // Every tally empty: the sync value is null and every bar is a dash.
    expect(() => overFrame("test", () => {})).not.toThrow();
  });

  /**
   * **The sheet grows, and it is drawn down a flowing `y` with no page.**
   *
   * Every row is `y += 22`, or 30 when it is empty and says why, and the last
   * thing on the screen is the words that tell the pair how to start over. A
   * fifth row arrived with THE HUSK — the first time this list has grown since
   * it was written — and nothing anywhere would have said if it had pushed
   * `tap to restart` off the bottom of a screen. So the check is the worst
   * case twice over: every tally empty, which is the tallest the sheet can be,
   * on the smallest viewport this file draws it at. There is about one row of
   * slack left there, which is the number the next line on this sheet has to
   * be spent against.
   */
  it("keeps the last words on the screen when every row is the tall kind", () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    const { canvas, ctx } = stubCanvas();
    ctx.texts = [];
    const renderer = new Canvas2DRenderer(canvas);
    const short = { width: 240, height: 420, dpr: 1 };
    renderer.resize(short);
    world.over = true;
    renderer.draw({
      world,
      beatPhase: 0,
      role: "test",
      time: 0,
      dt: 1 / 60,
      events: [],
      running: true,
    });
    const texts = (ctx.texts ?? []) as TextBox[];
    const last = texts.find((t) => t.text === "tap to restart");
    expect(last).toBeDefined();
    expect((last as TextBox).y + (last as TextBox).h).toBeLessThanOrEqual(short.height);
  });

  it("fits a viewport narrower than the sheet's own column", () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    const { canvas, ctx } = stubCanvas();
    const renderer = new Canvas2DRenderer(canvas);
    renderer.resize({ width: 240, height: 420, dpr: 1 });
    world.over = true;
    renderer.draw({
      world,
      beatPhase: 0,
      role: "test",
      time: 0,
      dt: 1 / 60,
      events: [],
      running: true,
    });
    expect(ctx.calls).toBeGreaterThan(20);
  });
});
