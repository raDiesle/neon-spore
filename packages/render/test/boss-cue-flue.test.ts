import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type FlueState,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
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
 * **THE FLUE says nothing on the field** (`render/src/boss-cue-read-zo.ts`):
 * the `CALL NOW` at the sight and the `FIRE` in its scan box at the hull
 * came off on 7 October 2026 (the owner: *remove the scanner box and the
 * text*). What a level asks is the sentence under the flue (`flue-card.ts`).
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};
const TPB = ticksPerBeat(CFG);

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
  it("says nothing to either screen while a level is lit, on a bolt level or a beam one", () => {
    const { world, s } = toLit();
    expect(s.phase).toBe("lit");
    for (const weapon of ["bolt", "beam"] as const) {
      const level = s.levels[s.cursor];
      if (level === undefined) throw new Error("no level lit");
      s.levels[s.cursor] = { ...level, weapon };
      for (const role of ["p1", "p2", "test"] as const) {
        const l = LAYOUT[role];
        expect(bossCue(l, world, 0, () => l.hullY)).toBeNull();
      }
    }
  });
});
