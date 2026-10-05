import { describe, expect, it } from "bun:test";
import { HIVE_TOP, type HiveState, hiveBoss, hiveOnWall } from "../src/hive.js";
import { NO_PINCH } from "../src/hive-lobe.js";
import { hiveAim, hiveWallPlaces } from "../src/hive-wall.js";
import {
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { livingKindForColor } from "../src/kinds.js";

/**
 * THE HIVE's two walls (`hive-wall.ts`): cocoons one above the other down
 * each side of the field, the lowest of which is all a bolt fired straight
 * up the wall's column can reach, and the pilot's thumb held on a higher one
 * steering his shots round the corner into it.
 *
 * Every shot here is a real one, fired from the cannon and flown tick by
 * tick, because what is being pinned is *which cocoon a shot meets* — a
 * question about the flight and not about the judgment, which
 * `hive.test.ts` already holds.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, 6, [], [], { kind: "hive" });
  return world;
}

function body(world: World): HiveState {
  const s = hiveBoss(world);
  if (s === null) throw new Error("no hive installed");
  return s;
}

/** The site at `col` on `row`. */
function siteAt(s: HiveState, col: number, row: number): number {
  const i = s.cols.findIndex((c, k) => c === col && s.rows[k] === row);
  if (i < 0) throw new Error(`no site at ${col},${row}`);
  return i;
}

/**
 * Every site opened and sealed but `keep`, which is open: one breach on the
 * whole mass, nothing due to open, and the cadence put off so nothing spills
 * into the shots' way.
 */
function onlyOpen(world: World, keep: number[]): HiveState {
  const s = body(world);
  s.opened = s.cols.length;
  s.sealed = s.cols.map((_, i) => !keep.includes(i));
  s.phase = "spill";
  s.spillBeat = world.beat + 100;
  return s;
}

/** Run `n` beats with `inputs` on their ticks, and hand back every event of the boss's. */
function run(world: World, n: number, inputs: TimedCommand[] = []): SimEvent[] {
  const out: SimEvent[] = [];
  for (let t = 0; t < n * TPB; t++) {
    step(
      world,
      inputs.filter((i) => i.tick === world.tick),
    );
    out.push(...world.events.filter((e) => e.type.startsWith("hive")));
  }
  return out;
}

const cannon = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: Color): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
const hold = (tick: number, on: boolean, id: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target: "hiveLobe", on, fromMilli: 0, fromYMilli: 0, id },
});

describe("the walls coming in", () => {
  it("hangs hiveWallSites cocoons down each wall, and keeps the corners clear of sites", () => {
    const s = body(open());
    const walls = hiveWallPlaces(CFG);
    expect(walls).toHaveLength(2 * CFG.hiveWallSites);
    expect(s.cols).toHaveLength(CFG.hiveSites + walls.length);
    for (const w of walls) expect(hiveOnWall(s, siteAt(s, w.col, w.row))).toBe(true);
    for (let i = 0; i < s.cols.length; i++) {
      const col = s.cols[i] ?? -1;
      if (s.rows[i] === HIVE_TOP) {
        expect(col >= CFG.hiveCornerCols && col < CFG.cols - CFG.hiveCornerCols).toBe(true);
      } else {
        expect(col === 0 || col === CFG.cols - 1).toBe(true);
      }
    }
  });

  it("shuffles the walls in with the underside, so a seed may open a wall first", () => {
    const firstOnWall = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].some((seed) =>
      hiveOnWall(body(open(seed)), 0),
    );
    expect(firstOnWall).toBe(true);
  });
});

describe("a bolt fired straight up a wall", () => {
  it("meets the lowest cocoon on it, and never the one above", () => {
    const world = open();
    const s = body(world);
    const lowest = CFG.hiveWallRow + (CFG.hiveWallSites - 1) * CFG.hiveWallGap;
    const high = siteAt(s, 0, CFG.hiveWallRow);
    onlyOpen(world, [high]);
    const color = s.colors[high] ?? "red";
    const t = world.tick;
    const seen = run(world, 3, [cannon(t, 0), fire(t + 2, color)]);
    expect(seen.some((e) => e.type === "hiveSkin" && e.row === lowest)).toBe(true);
    expect(s.sealed[high]).toBe(false);
  });

  it("seals the lowest one when it is the open one", () => {
    const world = open();
    const s = body(world);
    const lowest = CFG.hiveWallRow + (CFG.hiveWallSites - 1) * CFG.hiveWallGap;
    const low = siteAt(s, CFG.cols - 1, lowest);
    const other = siteAt(s, 0, CFG.hiveWallRow);
    onlyOpen(world, [low, other]);
    const t = world.tick;
    const seen = run(world, 3, [cannon(t, CFG.cols - 1), fire(t + 2, s.colors[low] ?? "red")]);
    expect(seen.some((e) => e.type === "hiveSeal" && e.row === lowest)).toBe(true);
    expect(s.sealed[low]).toBe(true);
  });
});

describe("the pilot's thumb held on a cocoon", () => {
  it("steers his shot round the corner into it, past the ones below", () => {
    const world = open();
    const s = body(world);
    const high = siteAt(s, 0, CFG.hiveWallRow);
    const other = siteAt(s, CFG.cols - 1, CFG.hiveWallRow);
    onlyOpen(world, [high, other]);
    const t = world.tick;
    const seen = run(world, 4, [
      cannon(t, 3),
      hold(t + 1, true, high),
      fire(t + 2, s.colors[high] ?? "red"),
    ]);
    expect(s.aim).toBe(high);
    expect(
      seen.some((e) => e.type === "hiveSeal" && e.col === 0 && e.row === CFG.hiveWallRow),
    ).toBe(true);
    expect(s.sealed[high]).toBe(true);
  });

  it("steers nothing once it is lifted: the next shot goes straight up its column", () => {
    const world = open();
    const s = body(world);
    const high = siteAt(s, 0, CFG.hiveWallRow);
    const other = siteAt(s, CFG.cols - 1, CFG.hiveWallRow);
    onlyOpen(world, [high, other]);
    const t = world.tick;
    const seen = run(world, 4, [
      cannon(t, 3),
      hold(t + 1, true, high),
      hold(t + 2, false, high),
      fire(t + 3, s.colors[high] ?? "red"),
    ]);
    expect(s.aim).toBe(NO_PINCH);
    expect(s.sealed[high]).toBe(false);
    expect(seen.some((e) => e.type === "hiveSkin" && e.col === 3 && e.row === undefined)).toBe(
      true,
    );
  });

  it("steers nothing into a cocoon that is not open, nor while the mass is clenched", () => {
    const world = open();
    const s = body(world);
    const high = siteAt(s, 0, CFG.hiveWallRow);
    onlyOpen(world, []);
    run(world, 1, [hold(world.tick, true, high)]);
    expect(s.aim).toBe(high);
    expect(hiveAim(world)).toBeNull();
    s.sealed[high] = false;
    expect(hiveAim(world)).not.toBeNull();
    s.phase = "clench";
    expect(hiveAim(world)).toBeNull();
  });

  it("is a lock on nothing but a wall's cocoon", () => {
    const world = open();
    const s = body(world);
    const top = s.rows.indexOf(HIVE_TOP);
    run(world, 1, [hold(world.tick, true, top)]);
    expect(s.aim).toBe(NO_PINCH);
  });
});

describe("a wall's breach spilling", () => {
  it("drops its colour, living, into the column next to the wall, on its own row", () => {
    const world = open();
    const s = body(world);
    const high = siteAt(s, CFG.cols - 1, CFG.hiveWallRow);
    onlyOpen(world, [high]);
    s.spillBeat = world.beat - CFG.hiveSpillBeats;
    const seen = run(world, 1);
    expect(seen.some((e) => e.type === "hiveSpill" && e.row === CFG.hiveWallRow)).toBe(true);
    const color = s.colors[high] ?? "red";
    const spilled = world.creatures.find((c) => c.kind === livingKindForColor(color));
    expect(spilled?.col).toBe(CFG.cols - 2);
    expect(spilled?.fromRow).toBeGreaterThanOrEqual(CFG.hiveWallRow);
  });
});
