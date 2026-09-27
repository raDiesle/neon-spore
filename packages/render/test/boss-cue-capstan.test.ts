import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CapstanState,
  type CapstanStep,
  capstanBoss,
  createWorld,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { capstanRubStanding } from "../src/capstan-grip.js";
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
 * **THE CAPSTAN, and the three words the field may say about it**
 * (`render/src/boss-cue-read-zl.ts`): `LEAN` to the seat that steers until
 * the band's face is round, `RUB` on that face to the other seat once it is;
 * on a hold `LEAN` to both until somebody leans, then `RUB` to the seat that
 * is not leaning; and `FIRE` under the middle column on a bared core. What is
 * *not* said: nothing between steps, and never the shot's colour.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LEAN = CFG.capstanLeanMilli;
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The drum standing, `ask` lit a beat ago, level, unworn and covered. */
function lit(ask: CapstanStep["ask"] | null): { world: World; s: CapstanState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("capstan");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = capstanBoss(world);
  if (s === null) throw new Error("the capstan wave stood no drum");
  s.phase = ask === null ? "rest" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.wear = [0, 0];
  s.bared = false;
  s.tiltMilli = [0, 0];
  s.rubs = [0, 0];
  s.heldBeats = 0;
  if (ask !== null) s.steps[0] = { ask, color: ask === "fire" ? "red" : "either", beats: 10 };
  return { world, s };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE CAPSTAN", () => {
  it.each([
    ["left", "p1", "p2", 0, -LEAN],
    ["right", "p2", "p1", 1, LEAN],
  ] as const)(
    "says LEAN on a %s band to the steerer, then RUB to the other",
    (ask, steerer, wearer, i, tilt) => {
      const { world, s } = lit(ask);
      expect(cue(world, steerer)?.word).toBe("LEAN");
      expect(cue(world, steerer)?.kind).toBe("HOLD");
      expect(cue(world, wearer)).toBeNull();
      s.tiltMilli[i] = -tilt;
      expect(cue(world, steerer)?.word).toBe("LEAN");
      s.tiltMilli[i] = tilt;
      expect(cue(world, steerer)).toBeNull();
      const said = cue(world, wearer);
      const at = capstanRubStanding(LAYOUT[wearer], CFG, s, world.beat, 0);
      expect(said?.word).toBe("RUB");
      expect(said?.kind).toBe("CARRY");
      expect(said?.x).toBeCloseTo(at.x);
      expect(said?.y).toBeCloseTo(at.y);
    },
  );

  it("says LEAN on a hold to both until one leans, then RUB to the other", () => {
    const { world, s } = lit("hold");
    expect(cue(world, "p1")?.word).toBe("LEAN");
    expect(cue(world, "p2")?.word).toBe("LEAN");
    s.tiltMilli = [0, LEAN];
    expect(cue(world, "p2")).toBeNull();
    expect(cue(world, "p1")?.word).toBe("RUB");
  });

  it("says FIRE under the middle column on a bared core, and never the colour", () => {
    const { world, s } = lit("fire");
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
