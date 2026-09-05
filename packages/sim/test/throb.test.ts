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
  THROB_TURN_MILLI,
  type TimedCommand,
  throbFacing,
  throbTurnMilli,
  ticksPerBeat,
} from "../src/index.js";

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
// A creature entered at beat 0 stands on row (beat - 1) — see rules.test.ts.
const IMPACT_TICK = TPB * (HULL + 1);
// The beat it is actually *through* the hull, which is one past the beat it
// lands on it: every body spends the beat render/ draws it come down the last
// tile standing on the ship's row (`BREACH_TICK` in rules.test.ts).
const BREACH_TICK = IMPACT_TICK + TPB;

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

const throb = (col: number): SpawnEntry => ({ beat: 0, col, kind: "throb", color: "red" });
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

describe("the turn", () => {
  it("goes round once every throbSpinBeats and wraps rather than growing", () => {
    expect(throbTurnMilli(CFG, 0)).toBe(0);
    expect(throbTurnMilli(CFG, CFG.throbSpinBeats / 2)).toBe(THROB_TURN_MILLI / 2);
    expect(throbTurnMilli(CFG, CFG.throbSpinBeats)).toBe(0);
    expect(throbTurnMilli(CFG, CFG.throbSpinBeats * 3)).toBe(0);
  });

  it("clocks forward, never back — clockwise is the whole tell", () => {
    let last = -1;
    for (let b = 0; b < CFG.throbSpinBeats; b += CFG.throbSpinBeats / 16) {
      const turn = throbTurnMilli(CFG, b);
      expect(turn).toBeGreaterThan(last);
      last = turn;
    }
  });

  it("presents the colour for throbFaceMilli of every turn, centred on straight down", () => {
    let facing = 0;
    const steps = 1000;
    for (let i = 0; i < steps; i++) {
      if (throbFacing(CFG, (i * CFG.throbSpinBeats) / steps)) facing += 1;
    }
    expect(facing).toBe(CFG.throbFaceMilli);
    // The middle of the window is the turn's own zero, and the far side of it
    // is plating.
    expect(throbFacing(CFG, 0)).toBe(true);
    expect(throbFacing(CFG, CFG.throbSpinBeats / 2)).toBe(false);
  });
});

describe("the throb", () => {
  const COL = 3;
  // `throbSpinBeats` is 4 and the colour is out for half of it, so beats 3, 0
  // and 1 of every turn have the colour square to the cannon and beats 1 and 2
  // have the plating. Both of these are well inside the fall — see
  // IMPACT_TICK, which is beat HULL + 1.
  const PLATE_TICK = TPB * 5; // beat 5, `5 % 4` is 1 — plating
  const COLOUR_TICK = TPB * 8; // beat 8, `8 % 4` is 0 — the middle of the window

  it("swallows a shot into the plating, even in its own colour", () => {
    const { world, events } = run([throb(COL)], PLATE_TICK + TPB, [
      aim(PLATE_TICK, COL),
      fire(PLATE_TICK, "red"),
    ]);
    expect(world.creatures).toHaveLength(1);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(events.some((e) => e.type === "reject")).toBe(true);
  });

  it("refuses the wrong colour on the coloured half, and books it as a colour miss", () => {
    const { world, events } = run([throb(COL)], COLOUR_TICK + TPB, [
      aim(COLOUR_TICK, COL),
      fire(COLOUR_TICK, "cyan"),
    ]);
    expect(world.creatures).toHaveLength(1);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(events.some((e) => e.type === "reject")).toBe(true);
  });

  it("lands the matching colour on the coloured half, and pays scoreThrobHit", () => {
    const { world, events } = run([throb(COL)], COLOUR_TICK + TPB, [
      aim(COLOUR_TICK, COL),
      fire(COLOUR_TICK, "red"),
    ]);
    expect(world.creatures).toHaveLength(0);
    expect(events.some((e) => e.type === "destroy")).toBe(true);
    expect(world.score).toBeGreaterThanOrEqual(CFG.scoreThrobHit);
  });

  it("costs the hull exactly like any other missed creature if never hit", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [throb(COL)]);
    for (let t = 0; t < BREACH_TICK + 1; t++) step(world, []);
    expect(hullPercent(world)).toBe(100 - CFG.damageCreature);
  });

  it("replays deterministically: hit on the turn, and the fingerprint pins that", () => {
    const replay = record({
      name: "throb hit on the turn",
      seed: 0,
      queue: [throb(COL)],
      ticks: COLOUR_TICK + TPB,
      inputs: [aim(COLOUR_TICK, COL), fire(COLOUR_TICK, "red")],
    });
    const world = runReplay(replay);
    expect(world.creatures).toHaveLength(0);
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });
});
