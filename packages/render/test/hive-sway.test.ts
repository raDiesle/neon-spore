import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type HiveState,
  hiveBoss,
  hiveNext,
  hiveNextBeat,
  hiveOnWall,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { hiveSite, SITE_HANG, SITE_R } from "../src/hive-shape.js";
import { hiveStopper } from "../src/hive-stop.js";
import { HIVE_TIP, hiveLean } from "../src/hive-sway.js";
import { computeLayout } from "../src/layout.js";
import { NO_SPAN } from "../src/slow-hush.js";

/**
 * THE HIVE's drops (`hive-sway.ts`): a shut drop's tip swings across by more
 * than half a tile each way and never past its cap, a sealed site hangs
 * still, the next site is plumb by its swell, and a bolt meets the drop's tip
 * where the shear has put it.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);
const TIP = SITE_R * SITE_HANG;

function hung(): { world: World; s: HiveState } {
  const world = createWorld(CFG, 5);
  const index = WAVES.findIndex((w) => w.boss?.kind === "hive");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 2; i++) step(world, []);
  const s = hiveBoss(world);
  if (s === null) throw new Error("the hive wave hung no mass");
  world.slowFromBeat = NO_SPAN.slowFromBeat;
  world.slowToBeat = NO_SPAN.slowToBeat;
  return { world, s };
}

/** A site that is shut, under the mass, and not the next to swell. */
function quiet(s: HiveState): number {
  const next = hiveNext(s);
  const i = s.cols.findIndex((_, k) => !hiveOnWall(s, k) && k !== next && k !== next + 1);
  if (i < 0) throw new Error("no quiet site to sway");
  return i;
}

const tips = (world: World, s: HiveState, i: number, from = world.beat) =>
  QUARTERS.map((q) => TIP * hiveLean(world, s, i, from + Math.floor(q / 4), (q % 4) / 4));

describe("THE HIVE's drops sway on their sites", () => {
  it("swings a shut drop's tip by more than half a tile each way, and never past its cap", () => {
    const { world, s } = hung();
    const x = tips(world, s, quiet(s));
    expect(Math.max(...x)).toBeGreaterThan(0.5);
    expect(Math.min(...x)).toBeLessThan(-0.5);
    expect(Math.max(...x.map(Math.abs))).toBeLessThanOrEqual(HIVE_TIP + 1e-9);
  });

  it("holds a sealed site still, and has the next one plumb by its swell", () => {
    const { world, s } = hung();
    const i = quiet(s);
    s.sealed[i] = true;
    expect(Math.max(...tips(world, s, i).map(Math.abs))).toBe(0);
    const next = hiveNext(s);
    const swells = hiveNextBeat(s, CFG) - CFG.hiveSwellBeats;
    expect(hiveLean(world, s, next, swells, 0)).toBe(0);
  });

  it("stops a bolt at the drop's tip where the lean has put it", () => {
    const { world, s } = hung();
    const i = quiet(s);
    const lean = 0.4;
    const hangs = s.cols.map((_, k) => (k === i ? { drop: 0, open: 1, lean } : undefined));
    const stop = hiveStopper(L, world, s, { x: 0, y: 0 }, 1, hangs);
    const at = hiveSite(L, s, i);
    const r = SITE_R * L.tile;
    let low = { x: 0, y: -1 };
    for (let x = at.x - 2 * r; x <= at.x + 2 * r; x += 0.25) {
      const y = stop(s.cols[i] ?? 0, x, "red")?.y ?? -1;
      if (y > low.y) low = { x, y };
    }
    expect(Math.abs(low.x - (at.x + lean * r * SITE_HANG))).toBeLessThan(1);
    expect(Math.abs(low.y - (at.y + r * SITE_HANG))).toBeLessThan(1);
  });
});
