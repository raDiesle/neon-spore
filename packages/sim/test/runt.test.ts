import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  hullRow,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
// A creature entered at beat 0 stands on row (beat - 1) — see rules.test.ts.
const IMPACT_TICK = TPB * (HULL + 1);

const runt = (col: number): SpawnEntry => ({ beat: 0, col, kind: "runt", color: null });
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

describe("the runt", () => {
  const COL = 3;
  const SHOT_TICK = TPB * 3;
  // Read the score before the beat after the shot lands: once the field is
  // empty, the next `onBeat` clears the wave and adds `scoreWave`, which would
  // otherwise mix into a number this test means to pin exactly.
  const BEFORE_NEXT_BEAT = TPB * 4 - 2;

  it("costs points and is removed by a shot of either colour", () => {
    for (const color of ["red", "cyan"] as const) {
      const start = createWorld({ ...CFG }, 0, [runt(COL)]);
      start.score = 1000;
      const byTick = new Map<number, TimedCommand[]>([
        [SHOT_TICK, [aim(SHOT_TICK, COL), fire(SHOT_TICK, color)]],
      ]);
      const events: SimEvent[] = [];
      for (let t = 0; t < BEFORE_NEXT_BEAT; t++) {
        step(start, byTick.get(t) ?? []);
        events.push(...start.events);
      }
      expect(start.creatures).toHaveLength(0);
      expect(start.score).toBe(1000 - CFG.scoreRuntPenalty);
      expect(events.some((e) => e.type === "destroy")).toBe(true);
    }
  });

  it("never takes the score below zero", () => {
    const world = createWorld({ ...CFG }, 0, [runt(COL)]);
    world.score = 10; // less than scoreRuntPenalty
    const inputs = [aim(SHOT_TICK, COL), fire(SHOT_TICK, "red")];
    const byTick = new Map<number, TimedCommand[]>();
    for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
    for (let t = 0; t < BEFORE_NEXT_BEAT; t++) step(world, byTick.get(t) ?? []);
    expect(world.score).toBe(0);
  });

  it("costs the hull exactly like any other missed creature if left alone", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [runt(COL)]);
    for (let t = 0; t < IMPACT_TICK + 1; t++) step(world, []);
    expect(hullPercent(world)).toBe(100 - CFG.damageCreature);
    expect(world.creatures).toHaveLength(0);
  });

  it("replays deterministically: a shot lands on it, and the fingerprint pins that", () => {
    const replay = record({
      name: "runt shot by mistake",
      seed: 0,
      queue: [runt(COL)],
      ticks: SHOT_TICK + TPB,
      inputs: [aim(SHOT_TICK, COL), fire(SHOT_TICK, "red")],
    });
    const world = runReplay(replay);
    expect(world.creatures).toHaveLength(0);
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });
});
