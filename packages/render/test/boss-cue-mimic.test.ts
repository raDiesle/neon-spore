import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type World } from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { mimicChart, mimicPictureBox, mimicTileAt } from "../src/mimic-board.js";
import { mimicPose } from "../src/mimic-pose.js";
import { CORE } from "../src/mimic-shape.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { CORE as CORE_STEP, posed, SIGN, SPLIT, stood } from "./mimic-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE MIMIC, and the words the field may say about it**
 * (`render/src/boss-cue-read-zt.ts`): `TILES` round the picture to the seat
 * that sees it, `TAP` on the board's top row to the seat that owes it, and
 * `TAP` on the bare core's tile. What is *not* said: either word to the wrong
 * seat, the picture's colours, the core's colour, and anything between asks.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The one word this screen is owed on this frame, or nothing. */
function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE MIMIC", () => {
  it.each([
    [1, "p1", "p2"],
    [2, "p2", "p1"],
  ] as const)(
    "calls the picture to the reader, seat %i, and says TAP on the board to the other",
    (reader, reads, draws) => {
      const world = stood();
      const s = posed(world, "sign", { ...SIGN, reader });
      const drawer = reader === 1 ? 2 : 1;
      const said = cue(world, reads);
      const l = LAYOUT[reads];
      const box = mimicPictureBox(l, CFG, s.signs[drawer - 1] ?? -1, s.origins[drawer - 1] ?? 0);
      expect(said?.word).toBe("TILES");
      expect(said?.kind).toBe("CALL");
      expect(said?.x).toBeCloseTo(box?.x ?? Number.NaN);
      expect(said?.y).toBeCloseTo(box?.y ?? Number.NaN);
      // Half a tile of room round the picture, every side.
      expect(said?.halfW ?? 0).toBeCloseTo((box?.w ?? 0) / 2 + l.tile / 2);
      const paint = cue(world, draws);
      const board = mimicChart(LAYOUT[draws], CFG);
      expect(paint?.word).toBe("TAP");
      expect(paint?.y ?? 0).toBeGreaterThan(board.top);
      expect(paint?.y ?? 0).toBeLessThan(board.top + board.tile);
    },
  );

  it("drops a seat's words once its half has peeled", () => {
    const world = stood();
    posed(world, "sign", SIGN, (s) => {
      s.peeled = [false, true];
    });
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("splits its words: each seat is told to call one half and paint the other", () => {
    const world = stood();
    posed(world, "sign", SPLIT);
    for (const role of ["p1", "p2"] as const) {
      const words = bossCue(LAYOUT[role], world, 0, () => LAYOUT[role].hullY);
      expect(words?.word === "TILES" || words?.word === "TAP").toBe(true);
    }
  });

  it("says nothing while it slaps in, wears a wrong sign, flinches, rolls, clenches or falls", () => {
    for (const phase of [
      "entering",
      "mimicking",
      "peeled",
      "rolling",
      "clench",
      "spent",
    ] as const) {
      const world = stood();
      posed(world, phase, SIGN, (s) => {
        s.signs = [-1, -1];
      });
      expect(cue(world, "p1"), phase).toBeNull();
      expect(cue(world, "p2"), phase).toBeNull();
    }
  });

  it("says TAP on the bare core's tile, and never the colour", () => {
    const world = stood();
    const s = posed(world, "core", CORE_STEP);
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role);
      const p = mimicPose(LAYOUT[role], CFG, s, world.beat, 0);
      const at = mimicTileAt(LAYOUT[role], midCol(CFG), CFG.mimicCoreRow);
      expect(said?.word).toBe("TAP");
      expect(said?.x).toBeCloseTo(at.x);
      expect(said?.y).toBeCloseTo(at.y);
      expect(said?.aim?.x).toBeCloseTo(p.x, 5);
      expect(said?.aim?.y).toBeCloseTo(p.y, 5);
      expect(said?.aim?.r).toBeCloseTo(CORE * p.r, 5);
    }
  });
});
