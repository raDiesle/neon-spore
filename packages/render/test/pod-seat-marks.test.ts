import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { Pod } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawDriftArrows, showsPodClock } from "../src/pod-seat-marks.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG } from "./frame-harness.js";

/**
 * The two halves of a pod one seat is told and the other is not
 * (`pod-seat-marks.ts`): the drift arrows on player 2's screen and never
 * player 1's, and a `clockP1` pod's ring on player 1's and never player 2's.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

beforeAll(installCanvasGlobals);

const VP = { width: 390, height: 844, dpr: 2 };
const pod = (extra: Partial<Pod>): Pod => ({
  id: 1,
  colMilli: 5000,
  rowMilli: 6000,
  driftMilli: 0,
  loose: false,
  kind: "pod",
  dueTicks: 600,
  crossMilli: 0,
  ...extra,
});

function strokes(role: "p1" | "p2" | "test", pods: Pod[]): number {
  const l = computeLayout(VP, CFG, role);
  const { ctx } = stubCanvas();
  drawDriftArrows(ctx as unknown as CanvasRenderingContext2D, l, pods, l.tile * 0.38, 1.5);
  return ctx.tally.get("stroke") ?? 0;
}

describe("the drift, called", () => {
  const sliding = [pod({ loose: true, driftMilli: -5 })];
  it("is drawn on player 2's screen and the rig's, never player 1's", () => {
    expect(strokes("p1", sliding)).toBe(0);
    expect(strokes("p2", sliding)).toBeGreaterThan(0);
    expect(strokes("test", sliding)).toBeGreaterThan(0);
  });

  it("is not drawn on a pod still hanging, or one no longer sliding", () => {
    expect(strokes("p2", [pod({})])).toBe(0);
    expect(strokes("p2", [pod({ loose: true })])).toBe(0);
  });
});

describe("the clock on one screen", () => {
  it("is drawn on player 1's and the rig's, never player 2's", () => {
    const p = pod({ clockP1: true });
    expect(showsPodClock(computeLayout(VP, CFG, "p1"), p)).toBe(true);
    expect(showsPodClock(computeLayout(VP, CFG, "p2"), p)).toBe(false);
    expect(showsPodClock(computeLayout(VP, CFG, "test"), p)).toBe(true);
    expect(showsPodClock(computeLayout(VP, CFG, "p2"), pod({}))).toBe(true);
  });
});
