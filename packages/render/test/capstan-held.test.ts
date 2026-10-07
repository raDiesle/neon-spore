import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type CapstanState, capstanBoss, type World } from "@neon-spore/sim";
import { capstanPullHeld, capstanRubCount } from "../src/capstan-verdicts.js";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { posed, stood } from "./capstan-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE CAPSTAN's pull says it is right, and the rub says how far** — the
 * owner, 7 October 2026 (`capstan-verdicts.ts`, `mark-progress.ts`): the
 * steering seat's pull held on the right face is green, not asked again; a
 * pull on the wrong face, or none, is not; and the rub's count — a band's
 * reversals, a hold's beats — rides the end on both screens from the moment
 * the step lights, one segment for each it needs.
 */

beforeAll(installCanvasGlobals);

const PULL = CFG.capstanPullMilli + 200;
/** A segment of the rub's count not yet worn, as `drawMarkProgress` strokes it. */
const TRACK = rgba(PALETTE.text, 0.3);

function lit(ask: "left" | "right" | "hold" | "fire", arrange?: (s: CapstanState) => void): World {
  const world = stood();
  posed(world, { ask, color: "either", beats: 8 }, arrange);
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

describe("THE CAPSTAN's pull held", () => {
  it("is held only on the face the step asks, or either on a hold", () => {
    const held = (ask: "left" | "right" | "hold", pull: [number, number]) => {
      const world = lit(ask, (s) => {
        s.pullMilli = pull;
      });
      const s = capstanBoss(world);
      if (s === null) throw new Error("no drum");
      return capstanPullHeld(CFG, s);
    };
    expect(held("left", [0, 0])).toBe(false);
    expect(held("left", [PULL, 0])).toBe(false);
    expect(held("left", [-PULL, 0])).toBe(true);
    expect(held("right", [0, PULL])).toBe(true);
    expect(held("hold", [0, -PULL])).toBe(true);
  });

  it.each(["p1", "p2"] as const)("greens the middle on %s once the pull is right", (role) => {
    const free = lit("left");
    const held = lit("left", (s) => {
      s.pullMilli = [-PULL, 0];
    });
    expect(count(frame(role, held), PALETTE.good)).toBeGreaterThan(
      count(frame(role, free), PALETTE.good),
    );
  });
});

describe("THE CAPSTAN's rub count", () => {
  it("counts a band's reversals, a hold's beats, and nothing on a shot", () => {
    const of = (ask: "left" | "hold" | "fire", arrange?: (s: CapstanState) => void) => {
      const s = capstanBoss(lit(ask, arrange));
      if (s === null) throw new Error("no drum");
      return capstanRubCount(CFG, s, 0);
    };
    const worn = of("left", (s) => {
      s.wear = [3, 0];
    });
    expect(worn?.segments).toBe(CFG.capstanWearThreshold);
    expect(worn?.share).toBeCloseTo(3 / CFG.capstanWearThreshold);
    const kept = of("hold", (s) => {
      s.heldBeats = 1;
    });
    expect(kept?.segments).toBe(CFG.capstanHoldBeats);
    expect(kept?.share).toBeCloseTo(1 / CFG.capstanHoldBeats);
    expect(of("fire")).toBeNull();
  });

  it.each(["p1", "p2"] as const)("shows every reversal still owed on %s", (role) => {
    const fresh = count(frame(role, lit("left")), TRACK);
    const worn = count(
      frame(
        role,
        lit("left", (s) => {
          s.wear = [3, 0];
        }),
      ),
      TRACK,
    );
    expect(fresh).toBeGreaterThan(worn);
    expect(fresh).toBeGreaterThan(0);
  });
});
