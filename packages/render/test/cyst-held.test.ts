import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { CystStep, World } from "@neon-spore/sim";
import {
  CYST_LEFT_FLANK_MARK,
  CYST_LEFT_FREEZE_MARK,
  CYST_RIGHT_FLANK_MARK,
  CYST_RIGHT_FREEZE_MARK,
  cystMarkHeld,
  cystPinchCount,
} from "../src/cyst-verdicts.js";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { posed, stood } from "./cyst-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE CYST's held parts say they are right, and the pinch says how far** —
 * the owner, 7 October 2026, THE CAPSTAN's rule (`cyst-verdicts.ts`,
 * `mark-progress.ts`): a freeze mark whose flank it stilled and a flank
 * pinched shut are green on both screens; the flank being kept shut carries
 * its beats over a dim track of the step's, both flanks on a swell; and a
 * shot carries no count.
 */

beforeAll(installCanvasGlobals);

const LEFT: CystStep = { ask: "left", color: "either", beats: 3 };
const SWELL: CystStep = { ask: "swell", color: "either", beats: 2 };
const FIRE: CystStep = { ask: "fire", color: "cyan", beats: 3 };
/** A segment of a count not yet earned, as `drawMarkProgress` strokes it. */
const TRACK = rgba(PALETTE.text, 0.3);

function frame(role: ViewRole, world: World): string {
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

const count = (text: string, what: string) => text.split(what).length - 1;
const SHUT = CFG.cystShutMilli;

describe("THE CYST's parts held", () => {
  it("holds the freeze mark its flank stilled, and the flank once pinched shut", () => {
    const world = stood();
    const s = posed(world, LEFT, (x) => {
      x.phase = "frozen";
    });
    expect(cystMarkHeld(world, s, CYST_LEFT_FREEZE_MARK)).toBe(true);
    expect(cystMarkHeld(world, s, CYST_RIGHT_FREEZE_MARK)).toBe(false);
    expect(cystMarkHeld(world, s, CYST_LEFT_FLANK_MARK)).toBe(false);
    s.gapMilli[0] = SHUT;
    expect(cystMarkHeld(world, s, CYST_LEFT_FLANK_MARK)).toBe(true);
    // Before the tap it is stilled by, a freeze mark is asked, not held.
    s.phase = "lit";
    expect(cystMarkHeld(world, s, CYST_LEFT_FREEZE_MARK)).toBe(false);
  });

  it("holds each flank of a swell pinched shut, and no freeze mark", () => {
    const world = stood();
    const s = posed(world, SWELL, (x) => {
      x.gapMilli = [SHUT, CFG.cystOpenMilli];
    });
    expect(cystMarkHeld(world, s, CYST_LEFT_FLANK_MARK)).toBe(true);
    expect(cystMarkHeld(world, s, CYST_RIGHT_FLANK_MARK)).toBe(false);
    expect(cystMarkHeld(world, s, CYST_LEFT_FREEZE_MARK)).toBe(false);
  });

  it("counts the pinch's beats out of the step's, on the flank or both, and nothing on a shot", () => {
    const frozen = posed(stood(), LEFT, (x) => {
      x.phase = "frozen";
      x.heldBeats = 1;
    });
    expect(cystPinchCount(frozen)).toEqual({
      share: 1 / 3,
      segments: 3,
      flanks: [CYST_LEFT_FLANK_MARK],
    });
    const swell = posed(stood(), SWELL);
    expect(cystPinchCount(swell)?.flanks).toEqual([CYST_LEFT_FLANK_MARK, CYST_RIGHT_FLANK_MARK]);
    expect(cystPinchCount(posed(stood(), LEFT))).toBeNull();
    expect(cystPinchCount(posed(stood(), FIRE))).toBeNull();
  });

  it.each(["p1", "p2"] as const)(
    "greens the stilled freeze mark and draws the pinch's track, on %s",
    (role) => {
      const lit = stood();
      posed(lit, LEFT);
      const frozen = stood();
      posed(frozen, LEFT, (x) => {
        x.phase = "frozen";
      });
      const shown = frame(role, frozen);
      expect(count(shown, PALETTE.good)).toBeGreaterThan(count(frame(role, lit), PALETTE.good));
      expect(count(shown, TRACK)).toBeGreaterThanOrEqual(LEFT.beats);
    },
  );
});
