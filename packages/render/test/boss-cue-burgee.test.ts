import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type BurgeeState,
  createWorld,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { burgeeMarks } from "../src/burgee-marks.js";
import { burgeeSpindleAt, burgeeSpindleTall } from "../src/burgee-shape.js";
import { fieldX } from "../src/field-flip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE BURGEE, and the three words the field may say about it**
 * (`render/src/boss-cue-read-zn.ts`): `TAP` on the ring to the step's
 * freezer until the flag is still, `SWIPE` on the track to the seat that
 * draws, and `FIRE` under the middle column once the spindle is lit. What is
 * *not* said: *when* to tap, which way to swipe, or the shot's colour.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

/** THE BURGEE's wave, stepped to its first catch: player 1 freezes, player 2 draws. */
function toLit(): { world: World; b: BurgeeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("burgee");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "burgee") throw new Error("the burgee's wave installed no burgee");
  let guard = 0;
  while (b.phase !== "lit" && guard++ < 60 * ticksPerBeat(CFG)) step(world, []);
  return { world, b };
}

function marksOf(role: ViewRole, b: BurgeeState) {
  const lit = b.steps[b.cursor];
  if (lit === undefined) throw new Error("no lit step");
  return burgeeMarks(LAYOUT[role], CFG, lit);
}

describe("THE BURGEE", () => {
  it("says TAP on the ring to the freezer, and SWIPE on the track to the other seat", () => {
    const { world, b } = toLit();
    expect(b.steps[b.cursor]).toMatchObject({ ask: "catch", freezer: 1 });
    const tap = cue(world, "p1");
    const ring = marksOf("p1", b).ring;
    expect(tap).toMatchObject({ word: "TAP", kind: "PRESS" });
    expect(tap?.x).toBeCloseTo(ring.x);
    expect(tap?.y).toBeCloseTo(ring.y);
    const swipe = cue(world, "p2");
    const { from, to } = marksOf("p2", b);
    expect(swipe).toMatchObject({ word: "SWIPE", kind: "HOLD" });
    expect(swipe?.x).toBeCloseTo((from.x + to.x) / 2);
    expect(swipe?.y).toBeCloseTo(from.y);
  });

  it("stops saying TAP once the flag is still, and keeps the swipe", () => {
    const { world, b } = toLit();
    b.frozenBeats = CFG.burgeeFreezeBeats;
    b.frozenBy = 0;
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("SWIPE");
  });

  it("says both words to both seats on a recatch, until one of them has frozen it", () => {
    const { world, b } = toLit();
    const at = b.steps.findIndex((s) => s.ask === "recatch");
    b.cursor = at;
    for (const role of ["p1", "p2"] as const) expect(cue(world, role)?.word).toBe("TAP");
    b.frozenBeats = CFG.burgeeFreezeBeats;
    b.frozenBy = 1;
    expect(cue(world, "p1")?.word).toBe("SWIPE");
    expect(cue(world, "p2")).toBeNull();
  });

  it("says FIRE under the middle column once the spindle is lit, and nothing before", () => {
    const { world, b } = toLit();
    b.cursor = b.steps.findIndex((s) => s.ask === "fire");
    b.spindleLit = false;
    expect(cue(world, "p1")).toBeNull();
    b.spindleLit = true;
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role);
      expect(said).toMatchObject({ word: "FIRE", kind: "PRESS" });
      expect(said?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)));
      expect(said?.y).toBeCloseTo(LAYOUT[role].hullY);
      // The owner, 29 September 2026, every boss: a shot cue carries a clear
      // aim target (`cue-helper.ts`). The word stays at the hull, where the
      // cannon goes; the crosshair rides the thing it is fired at.
      const want = { ...burgeeSpindleAt(LAYOUT[role], CFG), r: burgeeSpindleTall(LAYOUT[role]) };
      expect(said?.aim?.x).toBeCloseTo(want.x, 5);
      expect(said?.aim?.y).toBeCloseTo(want.y, 5);
      expect(said?.aim?.r).toBeCloseTo(want.r, 5);
      expect(said?.aim?.y).toBeLessThan(LAYOUT[role].hullY);
    }
  });

  it("says nothing between steps", () => {
    const { world, b } = toLit();
    b.phase = "rest";
    for (const role of ["p1", "p2"] as const) expect(cue(world, role)).toBeNull();
  });
});
