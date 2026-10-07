import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type FlueState,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { flueSightAt, flueSightR } from "../src/flue-shape.js";
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
 * **THE FLUE, and the words the field may say about it**
 * (`render/src/boss-cue-read-zo.ts`): `CALL` over `NOW` at the sight to the
 * pilot, who sees the ember, and `FIRE` on a bolt level or `HOLD` on a beam
 * level at the hull under the held cannon to the navigator, who fires. What
 * is *not* said: the level's colour, or how many shots are left — but the
 * mark is drawn in that colour, never the red of every other boss's.
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

/** THE FLUE's wave, stepped to its first level lighting. */
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
  it("says CALL NOW at the sight to the pilot", () => {
    const { world } = toLit();
    const call = cue(world, "p1");
    const sight = flueSightAt(LAYOUT.p1, CFG);
    expect(call).toMatchObject({ seat: 1, word: "NOW", kind: "CALL" });
    expect(call?.x).toBeCloseTo(sight.x);
    expect(call?.y).toBeCloseTo(sight.y);
  });

  it("says FIRE on a bolt level and HOLD on a beam one to the navigator, at the hull under the cannon", () => {
    const { world, s } = toLit();
    for (const [weapon, word, kind] of [
      ["bolt", "FIRE", "PRESS"],
      ["beam", "HOLD", "HOLD"],
    ] as const) {
      const level = s.levels[s.cursor];
      if (level === undefined) throw new Error("no level lit");
      s.levels[s.cursor] = { ...level, weapon };
      const said = cue(world, "p2");
      expect(said).toMatchObject({ seat: 2, word, kind });
      expect(said?.x).toBeCloseTo(fieldX(LAYOUT.p2, midCol(CFG)));
      expect(said?.y).toBeCloseTo(LAYOUT.p2.hullY);
      // The owner, 29 September 2026, every boss: a shot cue carries a clear
      // aim target (`cue-helper.ts`). The word stays at the hull, where the
      // cannon is; the crosshair rides the sight, where the shot is judged.
      const sight = flueSightAt(LAYOUT.p2, CFG);
      expect(said?.aim?.x).toBeCloseTo(sight.x, 5);
      expect(said?.aim?.y).toBeCloseTo(sight.y, 5);
      expect(said?.aim?.r).toBeCloseTo(flueSightR(LAYOUT.p2), 5);
    }
  });

  it("draws the navigator's mark in the level's colour, so a cyan level never says red", () => {
    const { world, s } = toLit();
    for (const color of ["red", "cyan"] as const) {
      const level = s.levels[s.cursor];
      if (level === undefined) throw new Error("no level lit");
      for (const weapon of ["bolt", "beam"] as const) {
        s.levels[s.cursor] = { ...level, weapon, color };
        expect(cue(world, "p2")?.tint).toBe(color);
      }
    }
  });

  it("says nothing between levels", () => {
    const { world, s } = toLit();
    s.phase = "rest";
    for (const role of ["p1", "p2"] as const) expect(cue(world, role)).toBeNull();
  });
});
