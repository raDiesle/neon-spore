import { describe, expect, it } from "bun:test";
import { MAX_CATCH_UP_MS, startLoop } from "../src/loop.js";

/**
 * The fixed-timestep driver, run by hand.
 *
 * Two things here are worth proving and neither can be seen from outside
 * without owning the clock: that a tab which was in a pocket for a minute does
 * not come back and run a minute of ticks in one frame, and that `stop`
 * actually ends the chain rather than leaving a loop nobody can see running.
 */

const HZ = 100;
const TICK_MS = 1000 / HZ;

/** A `requestAnimationFrame` the test calls itself, and a clock it winds. */
function driven() {
  let at = 0;
  let next: ((now: number) => void) | null = null;
  let scheduled = 0;
  const ticks: number[] = [];
  const frames: number[] = [];

  const loop = startLoop(
    HZ,
    () => ticks.push(at),
    () => frames.push(at),
    {
      now: () => at,
      raf: (frame) => {
        scheduled += 1;
        next = frame;
      },
    },
  );

  return {
    loop,
    ticks,
    frames,
    scheduled: () => scheduled,
    /** Move the clock on and deliver one frame. */
    advance: (ms: number) => {
      at += ms;
      const frame = next;
      next = null;
      frame?.(at);
    },
  };
}

describe("the catch-up cap", () => {
  it("runs the ticks a frame's worth of time is owed", () => {
    const d = driven();
    d.advance(TICK_MS * 3);
    expect(d.ticks.length).toBe(3);
  });

  it("keeps the remainder, so a slow frame is not a lost tick", () => {
    const d = driven();
    d.advance(TICK_MS * 1.5);
    expect(d.ticks.length).toBe(1);
    d.advance(TICK_MS * 0.5);
    expect(d.ticks.length).toBe(2);
  });

  it("refuses more than the cap, however long the tab was away", () => {
    const d = driven();
    // A minute in a pocket. Uncapped this would be six thousand ticks in one
    // frame, in front of somebody who has just looked at their phone again.
    d.advance(60_000);
    expect(d.ticks.length).toBe(MAX_CATCH_UP_MS / TICK_MS);
  });

  it("does not carry the refused time forward into the next frame", () => {
    // Time the loop refuses is time the simulation never hears about — nobody
    // was playing. Banking it would only move the flood one frame later.
    const d = driven();
    d.advance(60_000);
    const after = d.ticks.length;
    d.advance(TICK_MS);
    expect(d.ticks.length).toBe(after + 1);
  });

  it("draws once a frame whether or not a tick ran", () => {
    const d = driven();
    d.advance(TICK_MS / 4);
    expect(d.ticks.length).toBe(0);
    expect(d.frames.length).toBe(1);
  });
});

describe("stopping", () => {
  it("ends the chain rather than leaving one nobody can see", () => {
    const d = driven();
    d.advance(TICK_MS);
    const scheduledBefore = d.scheduled();
    d.loop.stop();
    d.advance(TICK_MS * 5);
    expect(d.scheduled()).toBe(scheduledBefore);
  });

  it("stops ticking and stops drawing", () => {
    const d = driven();
    d.advance(TICK_MS);
    d.loop.stop();
    const ticks = d.ticks.length;
    const frames = d.frames.length;
    d.advance(TICK_MS * 5);
    expect(d.ticks.length).toBe(ticks);
    expect(d.frames.length).toBe(frames);
  });

  it("is safe to stop twice", () => {
    const d = driven();
    d.loop.stop();
    d.loop.stop();
    expect(d.ticks.length).toBe(0);
  });
});
