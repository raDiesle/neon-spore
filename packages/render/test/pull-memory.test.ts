import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { pullCountsOf } from "../src/pull-counts.js";
import { PullMemory, pullMemoryOf, watchPulls } from "../src/pull-memory.js";
import { drawPullTrack } from "../src/pull-track.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **What a pull handle has just been through** (`pull-memory.ts`): the clocks
 * FIZZ plays the PULL LAB's moments from, kept for a handle by its key.
 */

beforeAll(installCanvasGlobals);

const TRACK = {
  pts: [
    { x: 0, y: 0 },
    { x: 0, y: 200 },
  ],
  w: 6,
};

/** A memory stepped one frame to `now`, a handle observed on it. */
function at(m: PullMemory, now: number, p: Parameters<PullMemory["observe"]>[0]) {
  m.frame(now);
  return m.observe(p);
}

describe("a pull handle's memory", () => {
  it("takes a handle on the first frame as already there, and one after it as coming in", () => {
    const m = new PullMemory();
    expect(at(m, 1, { key: "a", held: false, at: 0, origin: 0 }).born).toBeGreaterThan(10);
    expect(at(m, 2, { key: "b", held: false, at: 0, origin: 0 }).born).toBe(0);
    expect(at(m, 2.5, { key: "b", held: false, at: 0, origin: 0 }).born).toBeCloseTo(0.5);
  });

  it("starts the grab's clock on the press and the lift's on the let-go", () => {
    const m = new PullMemory();
    at(m, 1, { key: "a", held: false, at: 0, origin: 0 });
    expect(at(m, 2, { key: "a", held: true, at: 0, origin: 0 }).grabbed).toBe(0);
    expect(at(m, 2.4, { key: "a", held: true, at: 0.01, origin: 0 }).grabbed).toBeCloseTo(0.4);
    const gone = at(m, 3, { key: "a", held: false, at: 0.01, origin: 0 });
    expect(gone.lifted).toBe(0);
    // A lift that went nowhere is not shown going home.
    expect(gone.last).toBeNull();
  });

  it("shows a short lift going home from where it was let go, once the boss sends it", () => {
    const m = new PullMemory();
    at(m, 1, { key: "a", held: true, at: 0, origin: 0 });
    at(m, 2, { key: "a", held: true, at: 0.5, origin: 0 });
    // The boss sends it home on the tick the hand lets go.
    const a = at(m, 3, { key: "a", held: false, at: 0, origin: 0 });
    expect([a.last, a.age, a.from?.at]).toEqual(["refused", 0, 0.5]);
    expect(at(m, 3.5, { key: "a", held: false, at: 0, origin: 0 }).rested).toBeCloseTo(0.5);
  });

  it("plays nothing for a knob the boss keeps where it was let go", () => {
    const m = new PullMemory();
    at(m, 1, { key: "a", held: true, at: 0, origin: 0 });
    at(m, 2, { key: "a", held: true, at: 0.5, origin: 0 });
    expect(at(m, 3, { key: "a", held: false, at: 0.5, origin: 0 }).last).toBeNull();
    expect(at(m, 3.5, { key: "a", held: false, at: 0.5, origin: 0 }).last).toBeNull();
    // Wound home much later, by the boss, is not a refusal either.
    expect(at(m, 6, { key: "a", held: false, at: 0, origin: 0 }).last).toBeNull();
  });

  it("counts only on the caller's word, once, where the knob is", () => {
    const m = new PullMemory();
    at(m, 1, { key: "a", held: true, at: 0, origin: 0 });
    // The whole way is not a count: some bosses want the cord held taut first.
    expect(at(m, 2, { key: "a", held: true, at: 1, origin: 0 }).last).toBeNull();
    const counted = at(m, 3, { key: "a", held: true, at: 1, origin: 0, counted: true });
    expect([counted.last, counted.age, counted.from?.at]).toEqual(["counted", 0, 1]);
    expect(at(m, 3.5, { key: "a", held: true, at: 1, origin: 0, counted: true }).age).toBe(0.5);
    // Let go after the count, it is still the count, not a short lift.
    expect(at(m, 4, { key: "a", held: false, at: 1, origin: 0, counted: true }).last).toBe(
      "counted",
    );
  });

  it("counts on the boss's event where the hand had it, before the boss moved the knob", () => {
    const m = new PullMemory();
    at(m, 1, { key: "a", held: true, at: 0, origin: 0 });
    at(m, 2, { key: "a", held: true, at: 0.9, origin: 0 });
    m.count("a");
    // The boss has already put the knob back at the start for the next slab.
    const a = at(m, 2.1, { key: "a", held: true, at: 0, origin: 0 });
    expect([a.last, a.from?.at]).toEqual(["counted", 0.9]);
    // And its let-go is no refusal.
    expect(at(m, 2.5, { key: "a", held: false, at: 0, origin: 0 }).last).toBe("counted");
  });

  it("takes a let-go from the end of the way as no short pull", () => {
    const m = new PullMemory();
    at(m, 1, { key: "a", held: true, at: 0, origin: 0 });
    at(m, 2, { key: "a", held: true, at: 1, origin: 0 });
    expect(at(m, 3, { key: "a", held: false, at: 0, origin: 0 }).last).toBeNull();
  });

  it("shows the knob again wherever the boss has it once a count has waited long enough", () => {
    const m = new PullMemory();
    at(m, 1, { key: "a", held: true, at: 0.5, origin: 0 });
    at(m, 2, { key: "a", held: false, at: 0.5, origin: 0, counted: true });
    expect(at(m, 3, { key: "a", held: false, at: 0.5, origin: 0, counted: true }).rested).toBe(0);
    const late = at(m, 4.5, { key: "a", held: false, at: 0.5, origin: 0, counted: true });
    expect(late.rested).toBeGreaterThan(0);
  });

  it("finishes a count's fizz when the boss stops drawing the handle, and then forgets it", () => {
    const m = new PullMemory();
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const draw = (now: number, counted: boolean) => {
      watchPulls(c, m, now);
      drawPullTrack(c, TRACK, {
        hex: "#fff",
        rim: "#fff",
        held: true,
        origin: 0,
        at: 1,
        time: now,
        key: "a",
        counted,
      });
      m.endFrame(c);
    };
    draw(1, false);
    draw(2, true);
    const before = ctx.calls;
    watchPulls(c, m, 2.2);
    m.endFrame(c);
    expect(ctx.calls).toBeGreaterThan(before);
    // Long past its fizz and gone a while: forgotten, and nothing drawn.
    watchPulls(c, m, 6);
    m.endFrame(c);
    const after = ctx.calls;
    watchPulls(c, m, 6.1);
    m.endFrame(c);
    expect(ctx.calls).toBe(after);
    expect(pullMemoryOf(c)).toBe(m);
  });

  it("remembers nothing for a handle drawn with no key", () => {
    const m = new PullMemory();
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    watchPulls(c, m, 1);
    drawPullTrack(c, TRACK, { hex: "#fff", rim: "#fff", held: true, origin: 0, at: 1, time: 1 });
    watchPulls(c, m, 1.1);
    const before = ctx.calls;
    m.endFrame(c);
    expect(ctx.calls).toBe(before);
  });

  it("names a counted pull by the key its drawing passes", () => {
    const sinew = { type: "sinewPart", fibres: 3, row: 2, col: 4 } as const;
    expect(pullCountsOf(sinew as never)).toEqual(["sinew:-1", "sinew:1"]);
    expect(pullCountsOf({ type: "latchTurn", grip: 1, col: 4 } as never)).toEqual(["latch:1"]);
    expect(pullCountsOf({ type: "eyeOpen" } as never)).toEqual([]);
  });
});
