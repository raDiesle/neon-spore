import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type KeelState,
  keelBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { HUSH } from "../src/idle-drift.js";
import { keelSegs } from "../src/keel-pose.js";
import { KEEL_HEAVE, keelHeave } from "../src/keel-sway.js";
import { computeLayout } from "../src/layout.js";
import { NO_SPAN } from "../src/slow-hush.js";

/**
 * THE KEEL's heave (`keel-sway.ts`): a loose segment, as `keelSegs` hands it
 * to the drawing and the thumb, rises and falls by more than half a tile and
 * never past its cap; a locked one does not move; a third is left under THE
 * SLOW; and nothing heaves once the spine is done.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);

function hung(): { world: World; s: KeelState } {
  const world = createWorld(CFG, 5);
  const index = WAVES.findIndex((w) => w.boss?.kind === "keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * (CFG.keelStillBeats + 1); i++) step(world, []);
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  world.slowFromBeat = NO_SPAN.slowFromBeat;
  world.slowToBeat = NO_SPAN.slowToBeat;
  return { world, s };
}

/** Segment `k`'s centre's height over the scan, in tiles, as `keelSegs` has it. */
const heights = (world: World, s: KeelState, k: number) =>
  QUARTERS.map((q) => {
    const seg = keelSegs(L, CFG, s, world.beat + Math.floor(q / 4), (q % 4) / 4, world)[k];
    return (seg?.centre.y ?? 0) / L.tile;
  });
const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs);

describe("THE KEEL's loose segments heave on a swell", () => {
  it("lifts and drops a loose segment by more than half a tile each way, and never past its cap", () => {
    const { world, s } = hung();
    s.locked = s.locked.map(() => false);
    const h = QUARTERS.map((q) =>
      keelHeave(CFG, s, 0, 0, world.beat + Math.floor(q / 4), (q % 4) / 4),
    );
    expect(Math.max(...h)).toBeGreaterThan(0.5);
    expect(Math.min(...h)).toBeLessThan(-0.5);
    expect(Math.max(...h.map(Math.abs))).toBeLessThanOrEqual(KEEL_HEAVE);
    expect(spread(heights(world, s, 0))).toBeGreaterThan(1);
  });

  it("holds a locked segment still", () => {
    const { world, s } = hung();
    s.locked = s.locked.map((_, k) => k === 0);
    expect(spread(heights(world, s, 0))).toBe(0);
    expect(spread(heights(world, s, 1))).toBeGreaterThan(1);
  });

  it("keeps a third under THE SLOW, and nothing once the spine is done", () => {
    const { world, s } = hung();
    s.locked = s.locked.map(() => false);
    world.slowFromBeat = world.beat;
    world.slowToBeat = world.beat + 1000;
    const slowed = QUARTERS.filter((q) => q >= 4).map((q) =>
      keelHeave(CFG, s, 0, 0, world.beat + Math.floor(q / 4), (q % 4) / 4, world),
    );
    expect(Math.max(...slowed.map(Math.abs))).toBeLessThanOrEqual(KEEL_HEAVE * HUSH.marks);
    const done = { ...s, phase: "straight" as const };
    const h = QUARTERS.map((q) => keelHeave(CFG, done, 0, 0, world.beat + Math.floor(q / 4), 0));
    expect(Math.max(...h.map(Math.abs))).toBe(0);
  });
});
