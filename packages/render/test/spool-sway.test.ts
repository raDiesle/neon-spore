import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  NO_BRAKE,
  type SpoolState,
  spoolBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { NO_SPAN } from "../src/slow-hush.js";
import { SPOOL_SWING, spoolSway } from "../src/spool-sway.js";

/**
 * THE SPOOL's barrel (`spool-sway.ts`): its far end, the barrel's length from
 * the brake's flange, rises and dips by more than half a tile each way and
 * never past the cap; a hand on the brake changes nothing about it, since
 * the navigator is never shown the grip; and the slack spool is still.
 */

const CFG = DEFAULT_CONFIG;
/** The barrel's length, flange to flange, in tiles (`spool-shape.ts`, twice its half). */
const LONG = 2 * 2.6;
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);

function slung(): { world: World; s: SpoolState } {
  const world = createWorld(CFG, 5);
  const index = WAVES.findIndex((w) => w.boss?.kind === "spool");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 2; i++) step(world, []);
  const s = spoolBoss(world);
  if (s === null) throw new Error("the spool wave slung no spool");
  world.slowFromBeat = NO_SPAN.slowFromBeat;
  world.slowToBeat = NO_SPAN.slowToBeat;
  s.brakeMilli = NO_BRAKE;
  return { world, s };
}

const ends = (world: World, s: SpoolState) =>
  QUARTERS.map(
    (q) => LONG * Math.sin(spoolSway(world, s, world.beat + Math.floor(q / 4), (q % 4) / 4)),
  );

describe("THE SPOOL's barrel rolls on the brake's flange", () => {
  it("moves its far end by more than half a tile each way, and never past its cap", () => {
    const { world, s } = slung();
    const y = ends(world, s);
    expect(Math.max(...y)).toBeGreaterThan(0.5);
    expect(Math.min(...y)).toBeLessThan(-0.5);
    expect(Math.max(...y.map(Math.abs))).toBeLessThanOrEqual(LONG * Math.sin(SPOOL_SWING));
  });

  it("rolls the same under a hand on the brake, and holds still once it goes slack", () => {
    const { world, s } = slung();
    const free = ends(world, s);
    s.brakeMilli = 500;
    expect(ends(world, s)).toEqual(free);
    s.brakeMilli = NO_BRAKE;
    s.phase = "slack";
    expect(Math.max(...ends(world, s).map(Math.abs))).toBe(0);
  });
});
