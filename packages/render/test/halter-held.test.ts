import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type HalterState, type HalterStep, halterBoss, type World } from "@neon-spore/sim";
import { halterPairCount } from "../src/halter-verdicts.js";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";
import { FIRE, posed, stood } from "./halter-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE HALTER's chord says it is right, and the pair says how far** — the
 * owner, 7 October 2026, THE CAPSTAN's rule for every boss
 * (`halter-verdicts.ts`, `mark-progress.ts`): both grips down on the
 * gripping seat are green on both screens, one grip is not; and the pair's
 * count — the rester's still beats, then the beats held together — rides the
 * grips on both screens, one ring round the two, one segment for each it needs.
 */

beforeAll(installCanvasGlobals);

/** A segment of the pair's count not yet kept, as `drawMarkProgress` strokes it. */
const TRACK = rgba(PALETTE.text, 0.3);
const step = (ask: HalterStep["ask"]): HalterStep => ({ ask, color: "either", beats: 8 });

function lit(ask: HalterStep["ask"], arrange?: (s: HalterState) => void): World {
  const world = stood();
  posed(world, ask === "fire" ? FIRE : step(ask), arrange);
  return world;
}

function frame(role: ViewRole, world: World): string {
  const log: string[] = [];
  runFrames(world, role, 1, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

const count = (text: string, what: string) => text.split(what).length - 1;

function seam(world: World): HalterState {
  const s = halterBoss(world);
  if (s === null) throw new Error("no seam");
  return s;
}

describe("THE HALTER's chord held", () => {
  it.each(["p1", "p2"] as const)("greens the grips on %s once both are down", (role) => {
    const green = (w: World) => count(frame(role, w), PALETTE.good);
    const one = lit("left", (s) => {
      s.grips = [1, 0];
    });
    const both = lit("left", (s) => {
      s.grips = [3, 0];
    });
    expect(green(both)).toBeGreaterThan(green(one));
  });
});

describe("THE HALTER's pair count", () => {
  it("counts the rester's still beats, then the beats held, and nothing on a shot", () => {
    const segments = CFG.halterRestThreshold + CFG.halterHoldBeats;
    const left = halterPairCount(
      CFG,
      seam(
        lit("left", (s) => {
          s.restBeats = [0, CFG.halterRestThreshold];
          s.heldBeats = 1;
        }),
      ),
    );
    expect(left?.segments).toBe(segments);
    expect(left?.share).toBeCloseTo((CFG.halterRestThreshold + 1) / segments);
    const right = halterPairCount(
      CFG,
      seam(
        lit("right", (s) => {
          s.restBeats = [1, 0];
        }),
      ),
    );
    expect(right?.share).toBeCloseTo(1 / segments);
    expect(halterPairCount(CFG, seam(lit("guard")))).toBeNull();
    const guard = halterPairCount(
      CFG,
      seam(
        lit("guard", (s) => {
          s.grips = [0, 3];
          s.restBeats = [2, 0];
        }),
      ),
    );
    expect(guard?.share).toBeCloseTo(2 / segments);
    expect(halterPairCount(CFG, seam(lit("fire")))).toBeNull();
  });

  it.each(["p1", "p2"] as const)("shows every beat still owed on %s", (role) => {
    const fresh = count(frame(role, lit("left")), TRACK);
    const kept = count(
      frame(
        role,
        lit("left", (s) => {
          s.restBeats = [0, CFG.halterRestThreshold];
        }),
      ),
      TRACK,
    );
    expect(fresh).toBeGreaterThan(kept);
    expect(fresh).toBeGreaterThan(0);
  });
});
