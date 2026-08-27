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
  throbIsOpen,
  ticksPerBeat,
} from "../src/index.js";

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
// A creature entered at beat 0 stands on row (beat - 1) — see rules.test.ts.
const IMPACT_TICK = TPB * (HULL + 1);

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const throb = (col: number): SpawnEntry => ({ beat: 0, col, kind: "throb", color: null });
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

describe("throbIsOpen", () => {
  it("is open only on the first beat of every default cycle", () => {
    expect(throbIsOpen(CFG, 0)).toBe(true);
    expect(throbIsOpen(CFG, 1)).toBe(false);
    expect(throbIsOpen(CFG, 3)).toBe(false);
    expect(throbIsOpen(CFG, 4)).toBe(true);
    expect(throbIsOpen(CFG, 8)).toBe(true);
  });
});

describe("the throb", () => {
  const COL = 3;
  // Beat 2 (2 % 4 = 2) is shut; beat 4 (4 % 4 = 0) is open, both well inside
  // the fall — see IMPACT_TICK, which is beat HULL + 1.
  const SHUT_TICK = TPB * 2;
  const OPEN_TICK = TPB * 4;

  it("shrugs off a shot on a shut beat: no score, no destroy, it keeps falling", () => {
    const { world, events } = run([throb(COL)], SHUT_TICK + TPB, [
      aim(SHUT_TICK, COL),
      fire(SHUT_TICK, "red"),
    ]);
    expect(world.creatures).toHaveLength(1);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(events.some((e) => e.type === "reject")).toBe(true);
  });

  it("lands on the open beat, either colour, and pays scoreThrobHit", () => {
    const { world, events } = run([throb(COL)], OPEN_TICK + TPB, [
      aim(OPEN_TICK, COL),
      fire(OPEN_TICK, "cyan"),
    ]);
    expect(world.creatures).toHaveLength(0);
    expect(events.some((e) => e.type === "destroy")).toBe(true);
    expect(world.score).toBeGreaterThanOrEqual(CFG.scoreThrobHit);
  });

  it("costs the hull exactly like any other missed creature if never hit", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [throb(COL)]);
    for (let t = 0; t < IMPACT_TICK + 1; t++) step(world, []);
    expect(hullPercent(world)).toBe(100 - CFG.damageCreature);
  });

  it("replays deterministically: hit on the open beat, and the fingerprint pins that", () => {
    const replay = record({
      name: "throb hit on the beat",
      seed: 0,
      queue: [throb(COL)],
      ticks: OPEN_TICK + TPB,
      inputs: [aim(OPEN_TICK, COL), fire(OPEN_TICK, "red")],
    });
    const world = runReplay(replay);
    expect(world.creatures).toHaveLength(0);
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });
});
