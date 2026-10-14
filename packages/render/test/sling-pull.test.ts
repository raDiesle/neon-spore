import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { SlingStep, World } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { slingPulls } from "../src/sling-pull.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";
import { posed, stood } from "./sling-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SLING's pull knob** (`sling-pull.ts`): a cord whose hold has counted
 * is a knob where its mark was, carried toward the lit side as the pull
 * runs, on every screen — and not before the hold has counted.
 */

beforeAll(() => {
  installCanvasGlobals();
});

const LEFT: SlingStep = { ask: "left", aim: "left", color: "either", beats: 4 };
const BOTH: SlingStep = { ask: "both", aim: "right", color: "either", beats: 4 };

function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 6, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

describe("THE SLING's pull", () => {
  it("is asked of a cord once its hold has counted, and only while its step asks it", () => {
    const world = stood();
    const s = posed(world, LEFT);
    expect(slingPulls(s, 0)).toBe(false);
    s.held = [true, true];
    expect(slingPulls(s, 0)).toBe(true);
    expect(slingPulls(s, 1)).toBe(false);
    posed(world, BOTH, (b) => {
      b.held = [true, true];
    });
    expect(slingPulls(s, 1)).toBe(true);
  });

  it.each(ROLES)("puts a knob where the held cord's mark was, on %s", (role) => {
    const holding = frame(role, (w) => {
      posed(w, LEFT, (s) => {
        s.holding = [true, false];
      });
    });
    const held = frame(role, (w) => {
      posed(w, LEFT, (s) => {
        s.holding = [true, false];
        s.held = [true, false];
      });
    });
    expect(held).not.toBe(holding);
  });

  it.each(ROLES)("carries the knob along as the pull runs, on %s", (role) => {
    const taken = frame(role, (w) => {
      posed(w, BOTH, (s) => {
        s.held = [true, true];
        s.holding = [true, true];
        s.pullMilli = [0, 0];
      });
    });
    const along = frame(role, (w) => {
      posed(w, BOTH, (s) => {
        s.held = [true, true];
        s.holding = [true, true];
        s.pullMilli = [1200, 1200];
      });
    });
    expect(along).not.toBe(taken);
  });
});
