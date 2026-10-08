import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { HalterStep, TrivetStep, World } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";
import * as halter from "./halter-harness.js";
import * as trivet from "./trivet-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A desk's chord body is drawn as `HOLD BOTH` is drawn**
 * (`desk-chord-ring.ts`): on the TEST screen, whose one pointer is the whole
 * chord (`desk-chord.ts`), every chord body a step asks for wears THE
 * INSTAR's ring and its `HOLD BOTH` word, and not the `HOLD` cue a phone
 * reads — until the chord is held, when the ring goes as the cue does. Drawn
 * as whole frames, so the canvas takes every value of it.
 */

beforeAll(installCanvasGlobals);

const BOTH: TrivetStep = { ask: "both", pads: 2, color: "either", beats: 4 };
const LEFT: HalterStep = { ask: "left", color: "either", beats: 10 };

/** The words a frame of `world` writes as `role`, posed by `arrange` before each tick. */
function words(world: World, role: ViewRole, arrange: (w: World) => void): string[] {
  const out: string[] = [];
  runFrames(world, role, 2, {
    every: 2,
    onTick: (_, w) => arrange(w),
    onCanvas: (c) => {
      c.texts = [];
    },
    onDrawn: (c) => {
      out.push(...(c.texts ?? []).map((t) => t.text));
    },
  });
  return out;
}

const said = (w: readonly string[], word: string) => w.filter((t) => t === word).length;

const BOSSES = [
  ["THE TRIVET's feet", trivet.stood, (w: World) => trivet.posed(w, BOTH, false), 2],
  ["THE HALTER's lit grips", halter.stood, (w: World) => halter.posed(w, LEFT), 1],
] as const;

describe("a desk's chord body", () => {
  it.each(BOSSES)("wears HOLD BOTH on %s on TEST", (_, stood, pose, bodies) => {
    const w = words(stood(), "test", pose);
    expect(said(w, "HOLD BOTH")).toBe(bodies);
    // The phone's cue is not drawn beside it; `HOLD BOTH` says its own kind.
    expect(said(w, "HOLD")).toBe(0);
  });

  it.each(BOSSES)("is the phone's HOLD cue on %s on a phone", (_, stood, pose) => {
    let asked = 0;
    for (const role of ["p1", "p2"] as const) {
      const w = words(stood(), role, pose);
      expect(said(w, "HOLD BOTH")).toBe(0);
      asked += said(w, "HOLD");
    }
    expect(asked).toBeGreaterThan(0);
  });

  it("goes as the chord is held", () => {
    const held = words(trivet.stood(), "test", (w) => {
      trivet.posed(w, BOTH, false).padsDown = [3, 3];
    });
    expect(said(held, "HOLD BOTH")).toBe(0);
  });
});
