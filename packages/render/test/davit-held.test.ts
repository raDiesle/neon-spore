import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type DavitState, type DavitStep, davitBoss, type World } from "@neon-spore/sim";
import { davitDrawCount } from "../src/davit-verdicts.js";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { posed, stood } from "./davit-harness.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE DAVIT's steer says it is right, and the draw says how far** — the
 * owner, 7 October 2026, THE CAPSTAN's rule for every boss
 * (`davit-verdicts.ts`, `mark-progress.ts`): a boom held on its target is
 * green on both screens, one off it or let go is not; and the drawing seat's
 * beats ride the hook on both screens, one segment for each the step needs.
 */

beforeAll(installCanvasGlobals);

const LEAN = -20_000;
/** A segment of the draw's count not yet held, as `drawMarkProgress` strokes it. */
const TRACK = rgba(PALETTE.text, 0.3);

function step(ask: DavitStep["ask"]): DavitStep {
  return { ask, leanMilli: LEAN, rangeMilli: 6_000, color: "either", beats: 4 };
}

function lit(ask: DavitStep["ask"], arrange?: (s: DavitState) => void): World {
  const world = stood();
  posed(world, step(ask), LEAN, arrange);
  return world;
}

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

const boom = (world: World) => {
  const s = davitBoss(world);
  if (s === null) throw new Error("no boom");
  return s;
};

describe("THE DAVIT's boom held", () => {
  it.each(["p1", "p2"] as const)("greens the boom on %s once the steer is on target", (role) => {
    const free = lit("left");
    const off = lit("left", (s) => {
      s.tiltMilli = [LEAN + 30_000, s.tiltMilli[1]];
    });
    const held = lit("left", (s) => {
      s.tiltMilli = [LEAN, s.tiltMilli[1]];
    });
    const green = (w: World) => count(frame(role, w), PALETTE.good);
    expect(green(held)).toBeGreaterThan(green(free));
    expect(green(off)).toBe(green(free));
  });
});

describe("THE DAVIT's draw count", () => {
  it("counts the drawer's beats on a swing, the seat not steering on a reland, nothing on a shot", () => {
    const left = boom(
      lit("left", (s) => {
        s.drawnBeats = [0, 3];
      }),
    );
    expect(davitDrawCount(left)).toEqual({ share: 3 / 4, segments: 4 });
    const right = boom(
      lit("right", (s) => {
        s.drawnBeats = [1, 3];
      }),
    );
    expect(davitDrawCount(right)?.share).toBeCloseTo(1 / 4);
    expect(davitDrawCount(boom(lit("reland")))).toBeNull();
    const reland = boom(
      lit("reland", (s) => {
        s.tiltMilli = [s.tiltMilli[0], LEAN];
        s.drawnBeats = [2, 0];
      }),
    );
    expect(davitDrawCount(reland)?.share).toBeCloseTo(2 / 4);
    expect(davitDrawCount(boom(lit("fire")))).toBeNull();
  });

  it.each(["p1", "p2"] as const)("shows every beat still owed on %s", (role) => {
    const fresh = count(frame(role, lit("left")), TRACK);
    const drawn = count(
      frame(
        role,
        lit("left", (s) => {
          s.drawnBeats = [0, 3];
        }),
      ),
      TRACK,
    );
    expect(fresh).toBeGreaterThan(drawn);
    expect(fresh).toBeGreaterThan(0);
  });
});
