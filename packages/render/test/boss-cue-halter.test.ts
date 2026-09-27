import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type HalterState,
  type HalterStep,
  halterBoss,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { halterGripStanding } from "../src/halter-grip.js";
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
 * **THE HALTER, and the two words the field may say about it**
 * (`render/src/boss-cue-read-zk.ts`): `HOLD` between the lit segment's grips,
 * to the seat that grips, gone once both grips are down; on a guard to both
 * until a thumb is on a grip, then to that seat alone; and `FIRE` under the
 * middle column on a shot with the centre bared. What is *not* said: nothing
 * to the resting seat, nothing between steps, and never the shot's colour.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The seam in, `ask` lit a beat ago, nobody resting and no grip down. */
function lit(ask: HalterStep | null): { world: World; s: HalterState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("halter");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = halterBoss(world);
  if (s === null) throw new Error("the halter wave stood no seam");
  s.phase = ask === null ? "pause" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.restBeats = [0, 0];
  s.grips = [0, 0];
  s.bared = false;
  if (ask !== null) s.steps[0] = ask;
  return { world, s };
}

const stepOf = (ask: HalterStep["ask"]): HalterStep => ({
  ask,
  color: ask === "fire" ? "red" : "either",
  beats: 10,
});

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE HALTER", () => {
  it.each([
    ["left", "p1", "p2"],
    ["right", "p2", "p1"],
  ] as const)("says HOLD on a %s step to the gripper's screen alone", (ask, gripper, rester) => {
    const { world, s } = lit(stepOf(ask));
    const l = LAYOUT[gripper];
    const a = halterGripStanding(l, CFG, s, 0, world.beat, 0);
    const b = halterGripStanding(l, CFG, s, 1, world.beat, 0);
    if (a === null || b === null) throw new Error("no grips drawn");
    const said = cue(world, gripper);
    expect(said?.word).toBe("HOLD");
    expect(said?.kind).toBe("HOLD");
    expect(said?.x).toBeCloseTo((a.x + b.x) / 2);
    expect(said?.y).toBeCloseTo((a.y + b.y) / 2);
    expect(cue(world, rester)).toBeNull();
  });

  it("stops saying HOLD once both grips are down, and says it again on a slip", () => {
    const { world, s } = lit(stepOf("left"));
    s.grips = [1, 0];
    expect(cue(world, "p1")?.word).toBe("HOLD");
    s.grips = [3, 0];
    expect(cue(world, "p1")).toBeNull();
    s.grips = [2, 0];
    expect(cue(world, "p1")?.word).toBe("HOLD");
  });

  it("says HOLD on a guard to both until a thumb is down, then to that seat alone", () => {
    const { world, s } = lit(stepOf("guard"));
    expect(cue(world, "p1")?.word).toBe("HOLD");
    expect(cue(world, "p2")?.word).toBe("HOLD");
    s.grips = [0, 1];
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("HOLD");
    s.grips = [0, 3];
    expect(cue(world, "p2")).toBeNull();
  });

  it("says FIRE under the middle column on a shot with the centre bared, and never the colour", () => {
    const { world, s } = lit(stepOf("fire"));
    expect(cue(world, "p1")).toBeNull();
    s.bared = true;
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role);
      expect(said?.word).toBe("FIRE");
      expect(said?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)));
      expect(said?.y).toBe(LAYOUT[role].hullY);
    }
  });

  it("says nothing between steps", () => {
    const { world } = lit(null);
    for (const role of ["p1", "p2", "test"] as const) expect(cue(world, role)).toBeNull();
  });
});
