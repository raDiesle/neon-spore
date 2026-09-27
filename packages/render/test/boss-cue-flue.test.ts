import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type FlueState,
  flueSteady,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { flueCentre, flueEmberAt } from "../src/flue-shape.js";
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
 * **THE FLUE, and the three words the field may say about it**
 * (`render/src/boss-cue-read-zo.ts`): `STILL` at the flue's middle to the
 * seats a step asks to keep still, `TAP` on the stopped ember to the vent's
 * tapper, and `FIRE` under the middle column once the core is bared. What is
 * *not* said: how many taps are left, or the shot's colour.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};
const TPB = ticksPerBeat(CFG);

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

/** THE FLUE's wave, stepped to its first vent: player 2 keeps still, player 1 taps. */
function toLit(): { world: World; s: FlueState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("flue");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = world.boss;
  if (s === null || s.kind !== "flue") throw new Error("the flue's wave installed no flue");
  let guard = 0;
  while (s.phase !== "lit" && guard++ < 60 * TPB) step(world, []);
  return { world, s };
}

describe("THE FLUE", () => {
  it("says STILL at its middle to the vent's rester, and nothing to the tapper while the ember glides", () => {
    const { world, s } = toLit();
    expect(s.steps[s.cursor]).toMatchObject({ ask: "vent", rester: 2 });
    expect(flueSteady(world, s)).toBe(false);
    const still = cue(world, "p2");
    const mid = flueCentre(LAYOUT.p2, CFG);
    expect(still).toMatchObject({ word: "STILL", kind: "STILL" });
    expect(still?.x).toBeCloseTo(mid.x);
    expect(still?.y).toBeCloseTo(mid.y);
    expect(cue(world, "p1")).toBeNull();
  });

  it("says TAP on the ember to the tapper once it has stopped, and keeps the rester's STILL", () => {
    const { world, s } = toLit();
    s.restBeats[1] = CFG.flueRestThreshold;
    s.emberMilli = -1000;
    expect(flueSteady(world, s)).toBe(true);
    const tap = cue(world, "p1");
    const at = flueEmberAt(LAYOUT.p1, CFG, s.emberMilli);
    expect(tap).toMatchObject({ word: "TAP", kind: "PRESS" });
    expect(tap?.x).toBeCloseTo(at.x);
    expect(tap?.y).toBeCloseTo(at.y);
    expect(cue(world, "p2")?.word).toBe("STILL");
  });

  it("says STILL to both seats through a damper", () => {
    const { world, s } = toLit();
    s.cursor = s.steps.findIndex((k) => k.ask === "damper");
    s.bared = true;
    for (const role of ["p1", "p2"] as const) {
      expect(cue(world, role)).toMatchObject({ word: "STILL", kind: "STILL" });
    }
  });

  it("says FIRE under the middle column once the core is bared, and nothing before", () => {
    const { world, s } = toLit();
    s.cursor = s.steps.findIndex((k) => k.ask === "fire");
    s.bared = false;
    expect(cue(world, "p1")).toBeNull();
    s.bared = true;
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role);
      expect(said).toMatchObject({ word: "FIRE", kind: "PRESS" });
      expect(said?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)));
      expect(said?.y).toBeCloseTo(LAYOUT[role].hullY);
    }
  });

  it("says nothing between steps", () => {
    const { world, s } = toLit();
    s.phase = "rest";
    for (const role of ["p1", "p2"] as const) expect(cue(world, role)).toBeNull();
  });
});
