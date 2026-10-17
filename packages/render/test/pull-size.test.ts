import { expect, setDefaultTimeout, test } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { CUE_FRAME } from "../src/boss-cue-frame.js";
import { drawPullKnob, drawPullTrack, PULL_TRACK, type PullTrack } from "../src/index.js";
import { PULL_KNOB, PULL_SIZE } from "../src/pull-knob.js";
import { HOLD_MARK_R } from "../src/soak-hold.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * Every pull handle is drawn `PULL_SIZE` times what its own code asks — the
 * knob and its channel, never the path's length (the owner, 12 October 2026,
 * the PULL LAB's 2×, brought down to 1.7× on 17 October 2026).
 */
test("the knob and the channel are drawn PULL_SIZE times the size they are asked for", () => {
  installCanvasGlobals();
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  const inner = { knob: PULL_KNOB.paint, track: PULL_TRACK.paint };
  let knobR = 0;
  let laid: PullTrack = { pts: [], w: 0 };
  PULL_KNOB.paint = (_c, _at, r) => {
    knobR = r;
  };
  PULL_TRACK.paint = (_c, t) => {
    laid = t;
  };
  const track: PullTrack = {
    pts: [
      { x: 10, y: 10 },
      { x: 10, y: 90 },
    ],
    w: 3,
  };
  try {
    drawPullKnob(c, { x: 10, y: 10 }, 12, {
      hex: "#fff",
      rim: "#fff",
      held: false,
      time: 0,
      way: null,
    });
    drawPullTrack(c, track, { hex: "#fff", rim: "#fff", held: false, origin: 0, at: 0, time: 0 });
  } finally {
    PULL_KNOB.paint = inner.knob;
    PULL_TRACK.paint = inner.track;
  }
  expect(PULL_SIZE).toBe(1.7);
  expect(knobR).toBe(12 * PULL_SIZE);
  expect(laid).toEqual({ ...track, w: 3 * PULL_SIZE });
});

/**
 * A boss's hold, press and rub drop is the size of its pull's knob, to a
 * hundredth of a tile: the owner, 17 October 2026, *all on screen controls
 * should have same size … take "pull" as the basis*.
 */
test("a hold's drop on a cue frame is a pull knob's size", () => {
  const drop = Math.min(CUE_FRAME.w, CUE_FRAME.h) * HOLD_MARK_R;
  const knob = (DEFAULT_CONFIG.handleRadiusMilli / 1000) * PULL_SIZE;
  expect(Math.abs(drop - knob)).toBeLessThan(0.01);
});
