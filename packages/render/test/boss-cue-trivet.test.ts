import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  startWave,
  step,
  type TrivetAsk,
  type TrivetState,
  ticksPerBeat,
  trivetBoss,
  trivetStepCol,
  trivetTipSide,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { trivetFootStanding } from "../src/trivet-grip.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE TRIVET, and the two words the field may say about it**
 * (`render/src/boss-cue-read-zh.ts`): `HOLD` on each foot a lit chord asks
 * for, gone the moment every lit pad is down, and `FIRE` under the middle
 * column while the hub is lit — under the swung hub on a lurch, with `HOLD`
 * on the leaning foot — and `SHIELD` under a needle's column. What is *not* said: nothing between steps or
 * as the stand collapses, never on a foot the step does not ask for, and
 * never how many fingers or the colour the hub wants.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The stand dropped in and resting, no pad down on either foot. */
function stood(): { world: World; s: TrivetState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("trivet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.trivetStillBeats + 1); i++) step(world, []);
  const s = trivetBoss(world);
  if (s === null) throw new Error("the trivet wave stood no stand");
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.padsDown = [0, 0];
  s.hubLit = false;
  return { world, s };
}

/** Light the first step of the script that asks `ask`, and its pads' mask. */
function light(s: TrivetState, world: World, ask: TrivetAsk): number {
  const at = s.steps.findIndex((x) => x.ask === ask);
  if (at < 0) throw new Error(`the trivet script has no ${ask} step`);
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = at;
  return (1 << (s.steps[at]?.pads ?? 0)) - 1;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE TRIVET", () => {
  it.each([
    ["front", 1, 2],
    ["rear", 2, 1],
  ] as const)("asks only the %s foot's seat to HOLD it, on its foot", (ask, seat, other) => {
    const { world, s } = stood();
    light(s, world, ask);
    const role = seat === 1 ? "p1" : "p2";
    const c = cue(world, role);
    expect(c?.word).toBe("HOLD");
    expect(c?.kind).toBe("HOLD");
    expect(c?.seat).toBe(seat);
    const foot = trivetFootStanding(LAYOUT[role], world, s, seat, 0);
    expect(c?.x).toBeCloseTo(foot.x, 5);
    expect(c?.y).toBeCloseTo(foot.y, 5);
    expect(cue(world, other === 1 ? "p1" : "p2")).toBeNull();
  });

  it("asks both seats on a both step, and takes each word off once that chord is down", () => {
    const { world, s } = stood();
    const mask = light(s, world, "both");
    expect(cue(world, "p1")?.word).toBe("HOLD");
    expect(cue(world, "p2")?.word).toBe("HOLD");
    s.padsDown = [mask, 0];
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("HOLD");
    s.padsDown = [mask, mask];
    expect(cue(world, "p2")).toBeNull();
  });

  it("keeps the word up while any lit pad is still off, and says it again to a chord let go", () => {
    const { world, s } = stood();
    const mask = light(s, world, "front");
    s.padsDown = [mask >> 1, 0];
    expect(cue(world, "p1")?.word).toBe("HOLD");
    s.padsDown = [mask, 0];
    expect(cue(world, "p1")).toBeNull();
    s.padsDown = [mask & ~1, 0];
    expect(cue(world, "p1")?.word).toBe("HOLD");
  });

  it("says nothing between steps or as it collapses", () => {
    const { world, s } = stood();
    for (const phase of ["still", "rest", "collapse"] as const) {
      s.phase = phase;
      expect(cue(world, "p1")).toBeNull();
      expect(cue(world, "p2")).toBeNull();
    }
  });

  it("puts FIRE under the middle column while the hub is lit, on either screen", () => {
    const { world, s } = stood();
    light(s, world, "fire");
    expect(cue(world, "p1")).toBeNull();
    s.hubLit = true;
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("FIRE");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)), 5);
      expect(c?.y).toBe(LAYOUT[role].hullY);
    }
  });

  it("on a lurch, asks the leaning foot's seat to HOLD and puts FIRE under the swung hub", () => {
    const { world, s } = stood();
    const mask = light(s, world, "tip");
    s.hubLit = true;
    const tip = s.steps[s.cursor];
    if (tip === undefined) throw new Error("no tip step");
    const col = trivetStepCol(midCol(CFG), tip);
    expect(col).not.toBe(midCol(CFG));
    const seat = trivetTipSide(tip) === 0 ? "p1" : "p2";
    const other = seat === "p1" ? "p2" : "p1";
    expect(cue(world, seat)?.word).toBe("HOLD");
    s.padsDown = trivetTipSide(tip) === 0 ? [mask, 0] : [0, mask];
    for (const role of [seat, other] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("FIRE");
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], col), 5);
    }
  });

  it("puts SHIELD at the hull under a needle's column, on either screen", () => {
    const { world, s } = stood();
    light(s, world, "needle");
    const needle = s.steps[s.cursor];
    if (needle === undefined) throw new Error("no needle step");
    const col = trivetStepCol(midCol(CFG), needle);
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("SHIELD");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], col), 5);
      expect(c?.y).toBe(LAYOUT[role].hullY);
    }
  });

  it("never writes a number, a colour or a column", () => {
    const { world, s } = stood();
    const words: string[] = [];
    for (const ask of ["front", "rear", "fire", "both", "tip", "needle"] as const) {
      light(s, world, ask);
      s.hubLit = true;
      for (const role of ["p1", "p2"] as const) words.push(cue(world, role)?.word ?? "");
    }
    for (const w of words) expect(w).toMatch(/^[A-Z ]*$/);
  });
});
