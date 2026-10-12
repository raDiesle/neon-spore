import { expect, setDefaultTimeout, test } from "bun:test";
import { drawPullKnob, drawPullTrack, PULL_TRACK, type PullTrack } from "../src/index.js";
import { PULL_KNOB, PULL_SIZE } from "../src/pull-knob.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * Every pull handle is drawn `PULL_SIZE` times what its own code asks — the
 * knob and its channel, never the path's length (the owner, 12 October 2026,
 * the PULL LAB's 2×).
 */
test("the knob and the channel are drawn twice the size they are asked for", () => {
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
  expect(PULL_SIZE).toBe(2);
  expect(knobR).toBe(12 * PULL_SIZE);
  expect(laid).toEqual({ ...track, w: 3 * PULL_SIZE });
});
