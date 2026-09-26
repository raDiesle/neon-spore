import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type ViseAsk,
  type ViseState,
  viseBoss,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { viseLobeStanding } from "../src/vise-grip.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE VISE, and the two words the field may say about it**
 * (`render/src/boss-cue-read-zf.ts`): `SHUT` on each lobe a lit pinch asks
 * for, gone the moment that lobe is pinched under the shut line, and `FIRE`
 * under the middle column while the kernel is lit. What is *not* said:
 * nothing between steps or as the case splits, never on a lobe the step does
 * not ask for, and never the colour the kernel wants.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const OPEN = CFG.viseOpenMilli;
const SHUT = CFG.viseShutMilli;
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The case stood and resting, no pinch on either lobe. */
function stood(): { world: World; s: ViseState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("vise");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.viseStillBeats + 1); i++) step(world, []);
  const s = viseBoss(world);
  if (s === null) throw new Error("the vise wave stood no case");
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.gapMilli = [OPEN, OPEN];
  return { world, s };
}

/** Light the first step of the script that asks `ask`. */
function light(s: ViseState, world: World, ask: ViseAsk): void {
  const at = s.steps.findIndex((x) => x.ask === ask);
  if (at < 0) throw new Error(`the vise script has no ${ask} step`);
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = at;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE VISE", () => {
  it.each([
    ["left", 1, 2],
    ["right", 2, 1],
  ] as const)("asks only the %s lobe's seat to SHUT it, on its lobe", (ask, seat, other) => {
    const { world, s } = stood();
    light(s, world, ask);
    const role = seat === 1 ? "p1" : "p2";
    const c = cue(world, role);
    expect(c?.word).toBe("SHUT");
    expect(c?.kind).toBe("HOLD");
    expect(c?.seat).toBe(seat);
    const lobe = viseLobeStanding(LAYOUT[role], world, s, seat, 0);
    expect(c?.x).toBeCloseTo(lobe.x, 5);
    expect(c?.y).toBeCloseTo(lobe.y, 5);
    expect(cue(world, other === 1 ? "p1" : "p2")).toBeNull();
  });

  it("asks both seats on a both step, and takes each word off once that lobe is shut", () => {
    const { world, s } = stood();
    light(s, world, "both");
    expect(cue(world, "p1")?.word).toBe("SHUT");
    expect(cue(world, "p2")?.word).toBe("SHUT");
    s.gapMilli = [SHUT, OPEN];
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("SHUT");
    s.gapMilli = [SHUT, SHUT];
    expect(cue(world, "p2")).toBeNull();
  });

  it("says it again to a lobe let go before its count is up", () => {
    const { world, s } = stood();
    light(s, world, "left");
    s.gapMilli = [SHUT, OPEN];
    expect(cue(world, "p1")).toBeNull();
    s.gapMilli = [SHUT + 1, OPEN];
    expect(cue(world, "p1")?.word).toBe("SHUT");
  });

  it("says nothing between steps or as it splits", () => {
    const { world, s } = stood();
    for (const phase of ["still", "rest", "split"] as const) {
      s.phase = phase;
      expect(cue(world, "p1")).toBeNull();
      expect(cue(world, "p2")).toBeNull();
    }
  });

  it("puts FIRE under the middle column while the kernel is lit, on either screen", () => {
    const { world, s } = stood();
    light(s, world, "fire");
    s.bared = true;
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("FIRE");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)), 5);
      expect(c?.y).toBe(LAYOUT[role].hullY);
    }
  });

  it("never writes a number, a colour or a column", () => {
    const { world, s } = stood();
    const words: string[] = [];
    for (const ask of ["left", "right", "fire", "both"] as const) {
      light(s, world, ask);
      for (const role of ["p1", "p2"] as const) words.push(cue(world, role)?.word ?? "");
    }
    for (const w of words) expect(w).toMatch(/^[A-Z ]*$/);
  });
});
