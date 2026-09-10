import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { runStageLoopWhileSeen } from "../src/stage-loop.js";

/**
 * A stage nobody can see costs nothing.
 *
 * On a phone the director shows one view at a time, and the GAME view is
 * `display: none` behind WAVE and MAP — which does not stop
 * `requestAnimationFrame`. Before `runStageLoopWhileSeen` the world was
 * stepped and painted sixty times a second into a hidden canvas, so a phone
 * editing a wave paid the whole cost of playing one. The gate is an
 * `IntersectionObserver`; this drives a fake one and counts frames.
 */

type Entry = { isIntersecting: boolean };
type Callback = (entries: Entry[]) => void;

let callback: Callback | null = null;
let observed: Element[] = [];
let disconnected = 0;
let frames: FrameRequestCallback[] = [];
let cancelled: number[] = [];
/** The fake wall clock, in ms — what `performance.now()` answers. */
let clock = 0;

const g = globalThis as unknown as Record<string, unknown>;
const saved: Record<string, unknown> = {};

beforeEach(() => {
  callback = null;
  observed = [];
  disconnected = 0;
  frames = [];
  cancelled = [];
  clock = 0;
  for (const k of [
    "IntersectionObserver",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "performance",
  ]) {
    saved[k] = g[k];
  }
  g.IntersectionObserver = class {
    constructor(cb: Callback) {
      callback = cb;
    }
    observe(el: Element): void {
      observed.push(el);
    }
    disconnect(): void {
      disconnected++;
    }
  };
  g.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    frames.push(cb);
    return frames.length;
  };
  g.cancelAnimationFrame = (id: number): void => {
    cancelled.push(id);
  };
  g.performance = { now: () => clock };
});

afterEach(() => {
  for (const [k, v] of Object.entries(saved)) g[k] = v;
});

/** Run every frame queued so far, once, at `now`. */
function runFrames(now: number): void {
  clock = now;
  const due = frames;
  frames = [];
  for (const f of due) f(now);
}

function seen(isIntersecting: boolean): void {
  if (!callback) throw new Error("observer never constructed");
  callback([{ isIntersecting }]);
}

describe("the stage loop runs only while its canvas is on screen", () => {
  const canvas = {} as Element;

  test("nothing is stepped or painted before the observer has said the canvas is visible", () => {
    let painted = 0;
    runStageLoopWhileSeen(canvas, { tickHz: () => 30, advance: () => {}, paint: () => painted++ });
    expect(observed).toEqual([canvas]);
    expect(frames).toEqual([]);
    expect(painted).toBe(0);
  });

  test("seen starts the frames; hidden stops them; seen again resumes with no catch-up burst", () => {
    let advanced = 0;
    let painted = 0;
    runStageLoopWhileSeen(canvas, {
      tickHz: () => 30,
      advance: () => advanced++,
      paint: () => painted++,
    });

    seen(true);
    expect(frames.length).toBe(1);
    runFrames(100);
    runFrames(200);
    expect(painted).toBe(2);
    expect(advanced).toBe(6); // 200 ms at 30 Hz
    expect(frames.length).toBe(1); // re-armed

    seen(false);
    expect(cancelled.length).toBe(1);
    // A frame the browser already had queued does nothing once stopped.
    runFrames(300);
    expect(painted).toBe(2);
    expect(frames).toEqual([]);

    // Ten minutes away, then back: the world held, and the first frame back
    // does not try to step ten minutes of ticks.
    clock = 600_000;
    seen(true);
    runFrames(600_016);
    expect(painted).toBe(3);
    expect(advanced).toBe(6);
  });

  test("a second 'seen' while already running does not start a second loop", () => {
    runStageLoopWhileSeen(canvas, { tickHz: () => 30, advance: () => {}, paint: () => {} });
    seen(true);
    seen(true);
    expect(frames.length).toBe(1);
  });

  test("stop() lets go of the observer and the loop", () => {
    const handle = runStageLoopWhileSeen(canvas, {
      tickHz: () => 30,
      advance: () => {},
      paint: () => {},
    });
    seen(true);
    handle.stop();
    expect(disconnected).toBe(1);
    expect(cancelled.length).toBe(1);
  });

  test("with no IntersectionObserver at all, the loop simply runs", () => {
    g.IntersectionObserver = undefined;
    runStageLoopWhileSeen(canvas, { tickHz: () => 30, advance: () => {}, paint: () => {} });
    expect(frames.length).toBe(1);
  });
});
