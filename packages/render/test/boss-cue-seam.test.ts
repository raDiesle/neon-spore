import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  type SeamAsk,
  type SeamState,
  seamBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue, bossCues } from "../src/boss-cue.js";
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
 * **THE SEAM, and the two words the field may say about it**
 * (`render/src/boss-cue-read-zr.ts`): `FIRE` at the hull under the column
 * the lit step's shot is wanted in, and `SHIELD` under the ridge while grit
 * falls, to either seat. What is *not* said: the colour, and anything on the
 * false point or the dark, where the answer is to send nothing.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};
const MID = midCol(CFG);

function all(world: World, role: ViewRole = "test"): readonly BossCue[] {
  const l = LAYOUT[role];
  return bossCues(l, world, 0, () => l.hullY);
}

/** THE SEAM's wave, stood up and its first step lit as `ask`. */
function lit(ask: SeamAsk, offset = 0): { world: World; s: SeamState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("seam");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  const s = seamBoss(world);
  if (s === null) throw new Error("the seam wave stood no ridge");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  s.shot = false;
  s.guarded = false;
  s.steps[0] = { ask, color: "either", offset, seals: false };
  return { world, s };
}

describe("THE SEAM", () => {
  it.each(["point", "glow"] as const)(
    "says FIRE under the ridge on a lit %s, to either seat",
    (ask) => {
      const { world } = lit(ask);
      const cues = all(world);
      expect(cues).toHaveLength(1);
      expect(cues[0]).toMatchObject({ seat: null, kind: "PRESS", word: "FIRE" });
      expect(cues[0]?.x).toBeCloseTo(fieldX(LAYOUT.test, MID));
      expect(cues[0]?.y).toBe(LAYOUT.test.hullY);
      for (const role of ["p1", "p2"] as const) {
        const l = LAYOUT[role];
        expect(bossCue(l, world, 0, () => l.hullY)?.word).toBe("FIRE");
      }
    },
  );

  it("says FIRE under the rock's own column, not the ridge's", () => {
    const { world } = lit("rock", 2);
    const [fire] = all(world);
    expect(fire?.word).toBe("FIRE");
    expect(fire?.x).toBeCloseTo(fieldX(LAYOUT.test, MID + 2));
  });

  it.each(["grit", "blind"] as const)("says SHIELD under the ridge while %s falls", (ask) => {
    const { world } = lit(ask);
    const cues = all(world);
    expect(cues.map((c) => c.word)).toEqual(["SHIELD"]);
    expect(cues[0]?.x).toBeCloseTo(fieldX(LAYOUT.test, MID));
    expect(cues[0]?.seat).toBeNull();
  });

  it("says both for grit and a rock at once, and drops each half once it is answered", () => {
    const { world, s } = lit("both", -2);
    expect(all(world).map((c) => c.word)).toEqual(["SHIELD", "FIRE"]);
    expect(all(world)[1]?.x).toBeCloseTo(fieldX(LAYOUT.test, MID - 2));
    s.guarded = true;
    expect(all(world).map((c) => c.word)).toEqual(["FIRE"]);
    s.shot = true;
    expect(all(world)).toEqual([]);
  });

  // The owner, 29 September 2026, every boss: a shot cue carries a clear aim
  // target (`cue-helper.ts`). The word stays at the hull, where the cannon goes.
  it("aims the FIRE on the lit point, up on the ridge", () => {
    const { world } = lit("point");
    const [fire] = all(world);
    expect(fire?.aim?.x).toBeCloseTo(fieldX(LAYOUT.test, MID));
    expect(fire?.aim?.y).toBeLessThan(LAYOUT.test.hullY - LAYOUT.test.tile);
  });

  it("aims the FIRE on the rock in flight, between the crack and its column", () => {
    const { world } = lit("rock", 2);
    const aim = all(world)[0]?.aim;
    expect(aim).toBeDefined();
    expect(aim?.x).toBeGreaterThanOrEqual(fieldX(LAYOUT.test, MID) - 1);
    expect(aim?.x).toBeLessThanOrEqual(fieldX(LAYOUT.test, MID + 2) + 1);
    expect(aim?.y).toBeLessThan(LAYOUT.test.hullY);
  });

  it("goes quiet once the lit point has been shot", () => {
    const { world, s } = lit("point");
    s.shot = true;
    expect(all(world)).toEqual([]);
  });

  it.each(["decoy", "dark"] as const)(
    "says nothing on the %s, where the answer is to send nothing",
    (ask) => {
      const { world } = lit(ask);
      expect(all(world)).toEqual([]);
    },
  );

  it.each(["still", "rest", "split"] as const)("says nothing while the ridge is %s", (phase) => {
    const { world, s } = lit("point");
    s.phase = phase;
    expect(all(world)).toEqual([]);
  });
});
