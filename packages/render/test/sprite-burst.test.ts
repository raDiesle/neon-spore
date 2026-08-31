import { beforeAll, describe, expect, it } from "bun:test";
import { BURST_SHEET, SpriteBursts } from "../src/sprite-burst.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The arithmetic between a clock and a frame number.
 *
 * It is four lines of code and it is the whole argument for using an atlas
 * instead of an APNG, so it is worth a test: the frame a burst is on is a
 * function of the seconds it has been alive, and of nothing else. No wall
 * clock, no browser animation timer, no state that another device could hold
 * differently. Feed the same `dt` sequence on two machines and they are on the
 * same frame.
 *
 * The other half is the guard: with no atlas installed, `spawn` does nothing
 * at all. That is what keeps the shipped field unchanged while the look is
 * still something the owner has not chosen — see CLAUDE.md.
 */

beforeAll(installCanvasGlobals);

/** Enough of an image for `drawImage`; the stub only checks the numbers. */
const ATLAS = {} as CanvasImageSource;

describe("a sprite burst with no atlas", () => {
  it("draws nothing and remembers nothing", () => {
    const { ctx } = stubCanvas();
    const target = ctx as unknown as CanvasRenderingContext2D;
    const bursts = new SpriteBursts();
    expect(bursts.installed).toBe(false);
    bursts.spawn(10, 10, 40);
    bursts.update(0.1);
    bursts.draw(target);
    expect(ctx.calls).toBe(0);
  });
});

describe("a sprite burst with an atlas", () => {
  it("puts an age on the frame the strip says it is on", () => {
    const bursts = new SpriteBursts();
    bursts.install(ATLAS);
    expect(bursts.frameAt(0)).toBe(0);
    expect(bursts.frameAt(BURST_SHEET.frameMs / 1000 - 0.001)).toBe(0);
    expect(bursts.frameAt(BURST_SHEET.frameMs / 1000)).toBe(1);
    const last = ((BURST_SHEET.frames - 1) * BURST_SHEET.frameMs) / 1000;
    expect(bursts.frameAt(last)).toBe(BURST_SHEET.frames - 1);
  });

  it("is over once the strip runs out, whatever the frame rate was", () => {
    const life = (BURST_SHEET.frames * BURST_SHEET.frameMs) / 1000;
    for (const dt of [1 / 60, 1 / 30, 1 / 12]) {
      const { ctx } = stubCanvas();
      const target = ctx as unknown as CanvasRenderingContext2D;
      const bursts = new SpriteBursts();
      bursts.install(ATLAS);
      bursts.spawn(50, 50, 40);
      for (let t = 0; t < life; t += dt) bursts.update(dt);
      bursts.update(dt);
      bursts.draw(target);
      expect(ctx.calls).toBe(0);
    }
  });

  it("costs one blit per burst per frame, whatever is drawn in it", () => {
    const { ctx } = stubCanvas();
    const target = ctx as unknown as CanvasRenderingContext2D;
    const bursts = new SpriteBursts();
    bursts.install(ATLAS);
    for (let i = 0; i < 5; i++) bursts.spawn(20 * i, 40, 30);
    bursts.update(1 / 60);
    bursts.draw(target);
    expect(ctx.calls).toBe(5);
  });

  it("is cleared by a restart", () => {
    const { ctx } = stubCanvas();
    const target = ctx as unknown as CanvasRenderingContext2D;
    const bursts = new SpriteBursts();
    bursts.install(ATLAS);
    bursts.spawn(10, 10, 40);
    bursts.clear();
    bursts.draw(target);
    expect(ctx.calls).toBe(0);
    // The atlas survives: installing it is the host's decision, not the wave's.
    expect(bursts.installed).toBe(true);
  });
});
