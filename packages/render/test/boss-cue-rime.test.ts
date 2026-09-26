import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  type RimeState,
  type RimeStep,
  rimeBoss,
  rimeIcicleCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
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
 * **THE RIME, and the two words the field may say about it**
 * (`render/src/boss-cue-read-zg.ts`): `FIRE` under the middle column while
 * the bared core is lit, `SHIELD` under the middle on a surge and under the
 * icicle's own column on an icicle. Nothing between steps, nothing on a wipe
 * or a whiteout (no touch on the field rubs yet), and never a colour.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function stood(): { world: World; s: RimeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("rime");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = rimeBoss(world);
  if (s === null) throw new Error("the rime wave stood no lens");
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  s.bared = true;
  s.rimeMilli = [0, 0];
  return { world, s };
}

function light(s: RimeState, world: World, lit: RimeStep): void {
  s.steps[0] = lit;
  s.phase = "lit";
  s.phaseBeat = world.beat;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE RIME's cue words", () => {
  it("puts FIRE under the middle column while the bared core is lit, on either screen", () => {
    const { world, s } = stood();
    light(s, world, { ask: "fire", color: "red", beats: 3 });
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("FIRE");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], MID), 5);
      expect(c?.y).toBe(LAYOUT[role].hullY);
    }
  });

  it("says no FIRE while the core is still covered", () => {
    const { world, s } = stood();
    light(s, world, { ask: "fire", color: "red", beats: 3 });
    s.bared = false;
    expect(cue(world, "p1")).toBeNull();
  });

  it("puts SHIELD under the middle on a surge", () => {
    const { world, s } = stood();
    light(s, world, { ask: "shield", color: "either", beats: 3 });
    const c = cue(world, "p2");
    expect(c?.word).toBe("SHIELD");
    expect(c?.x).toBeCloseTo(fieldX(LAYOUT.p2, MID), 5);
  });

  it("puts SHIELD under the icicle's column, not the lens's", () => {
    const { world, s } = stood();
    const icicle: RimeStep = { ask: "icicle", color: "either", beats: 4, offset: -2 };
    light(s, world, icicle);
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("SHIELD");
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], rimeIcicleCol(MID, icicle)), 5);
    }
  });

  it("says nothing on a wipe, a whiteout or between steps", () => {
    const { world, s } = stood();
    for (const ask of ["left", "right", "both"] as const) {
      light(s, world, { ask, color: "either", beats: 4 });
      expect(cue(world, "p1")).toBeNull();
      expect(cue(world, "p2")).toBeNull();
    }
    s.phase = "rest";
    expect(cue(world, "p1")).toBeNull();
  });
});
