import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  hullRow,
  lureVanishRow,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
  wornKind,
} from "../src/index.js";

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
// A creature entered at beat 0 stands on row (beat - 1) — see rules.test.ts.
const IMPACT_TICK = TPB * (HULL + 1);

const lure = (col: number, wears: "slick" | "bulb" = "bulb"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "lure",
  // The disguise's colour, authored beside the body it wears. A lure is the
  // one entry that names a kind and a colour at once, because they are two
  // facts rather than one said twice (`wave-types.ts`).
  color: wears === "slick" ? "red" : "cyan",
  wears,
});
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

describe("the lure", () => {
  const COL = 3;
  const SHOT_TICK = TPB * 3;
  const BEFORE_NEXT_BEAT = TPB * 4 - 2;
  const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };

  it("costs the hull and is removed by a shot of either colour", () => {
    for (const color of ["red", "cyan"] as const) {
      const world = createWorld({ ...noRegen }, 0, [lure(COL)]);
      const byTick = new Map<number, TimedCommand[]>([
        [SHOT_TICK, [aim(SHOT_TICK, COL), fire(SHOT_TICK, color)]],
      ]);
      const events: SimEvent[] = [];
      for (let t = 0; t < BEFORE_NEXT_BEAT; t++) {
        step(world, byTick.get(t) ?? []);
        events.push(...world.events);
      }
      expect(world.creatures).toHaveLength(0);
      expect(hullPercent(world)).toBe(100 - CFG.damageLure);
      expect(events.some((e) => e.type === "lureHit")).toBe(true);
    }
  });

  it("costs the hull even in the colour it is wearing", () => {
    // The point of the branch: a lure carries a colour, so without its own
    // case in `resolve` a matching shot would have been a kill and a wrong
    // one a mistake — making the *wrong* colour the cheaper thing to fire.
    const world = createWorld({ ...noRegen }, 0, [lure(COL, "slick")]);
    const byTick = new Map<number, TimedCommand[]>([
      [SHOT_TICK, [aim(SHOT_TICK, COL), fire(SHOT_TICK, "red")]],
    ]);
    for (let t = 0; t < BEFORE_NEXT_BEAT; t++) step(world, byTick.get(t) ?? []);
    expect(world.creatures).toHaveLength(0);
    expect(hullPercent(world)).toBe(100 - CFG.damageLure);
  });

  it("never takes the hull below zero", () => {
    const world = createWorld({ ...noRegen }, 0, [lure(COL)]);
    // Less hull left than one shot at a lure costs.
    world.hullMilli = 1000;
    const byTick = new Map<number, TimedCommand[]>([
      [SHOT_TICK, [aim(SHOT_TICK, COL), fire(SHOT_TICK, "red")]],
    ]);
    for (let t = 0; t < BEFORE_NEXT_BEAT; t++) step(world, byTick.get(t) ?? []);
    expect(hullPercent(world)).toBe(0);
    expect(world.over).toBe(true);
  });

  it("stands the row two above the hull for one beat, then goes, hull untouched", () => {
    const world = createWorld(noRegen, 0, [lure(COL)]);
    const events: SimEvent[] = [];
    const rowsSeen: number[] = [];
    for (let t = 0; t < IMPACT_TICK + TPB; t++) {
      step(world, []);
      events.push(...world.events);
      const c = world.creatures[0];
      if (c) rowsSeen.push(c.row);
    }
    const vanishRow = lureVanishRow(CFG);
    expect(vanishRow).toBe(HULL - CFG.lureVanishRows);
    // It occupied that row, and never a row below it.
    expect(rowsSeen).toContain(vanishRow);
    expect(Math.max(...rowsSeen)).toBe(vanishRow);
    // Exactly one beat of it: the beat it glided into that row.
    expect(rowsSeen.filter((r) => r === vanishRow).length).toBe(TPB);

    const gone = events.filter((e) => e.type === "lureVanished");
    expect(gone).toHaveLength(1);
    expect(gone[0]).toMatchObject({ col: COL, row: vanishRow, color: "cyan" });
    expect(world.creatures).toHaveLength(0);
    // Nothing reached the hull, so nothing was breached and nothing was lost.
    expect(hullPercent(world)).toBe(100);
    expect(events.some((e) => e.type === "breach")).toBe(false);
    expect(world.scars).toHaveLength(0);
  });

  it("is announced to the navigator's ear when it arrives, and only then", () => {
    const world = createWorld(noRegen, 0, [lure(COL)]);
    const events: SimEvent[] = [];
    for (let t = 0; t < IMPACT_TICK; t++) {
      step(world, []);
      events.push(...world.events);
    }
    expect(events.filter((e) => e.type === "lureSeen")).toHaveLength(1);
  });

  it("is drawn as the body it wears, never as itself", () => {
    const world = createWorld(noRegen, 0, [lure(COL, "slick")]);
    for (let t = 0; t < TPB * 2; t++) step(world, []);
    const c = world.creatures[0]!;
    expect(c.kind).toBe("lure");
    expect(wornKind(c)).toBe("slick");
    expect(c.color).toBe("red");
  });

  it("replays deterministically: a shot lands on it, and the fingerprint pins that", () => {
    const replay = record({
      name: "lure shot by mistake",
      seed: 0,
      queue: [lure(COL)],
      ticks: SHOT_TICK + TPB,
      inputs: [aim(SHOT_TICK, COL), fire(SHOT_TICK, "red")],
    });
    const world = runReplay(replay);
    expect(world.creatures).toHaveLength(0);
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });
});
