import { describe, expect, it } from "bun:test";
import {
  countdownIsOpen,
  countdownMarks,
  countdownPeriod,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

// No regrowth, so what a shot off zero costs can be read off the bar.
const CFG: SimConfig = { ...DEFAULT_CONFIG, hullRegenPerSecond: 0 };
const TPB = ticksPerBeat(CFG);
const COL = 3;

const count = (col: number, color: "red" | "cyan" = "red"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "countdown",
  color,
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

/**
 * The phase is rolled, so the beats below are *found* rather than written: the
 * body is spawned, its count read through the same function the shot uses,
 * and the first open beat and the first shut beat after the body is well
 * inside the field are what the shots are timed to. A shot climbs
 * `bulletTilesPerBeat` tiles a beat and the body is one row lower every beat,
 * so a shot fired at the top of a beat at a body five or more beats in lands
 * inside the same beat.
 */
function beatsOf(): { open: number; shut: number } {
  const world = createWorld({ ...CFG }, 0, [count(COL)]);
  for (let t = 0; t < TPB; t++) step(world, []);
  const c = world.creatures[0]!;
  let open = -1;
  let shut = -1;
  for (let b = 5; b < 12; b++) {
    const isOpen = countdownIsOpen(CFG, b, c);
    if (isOpen && open < 0) open = b;
    if (!isOpen && shut < 0) shut = b;
  }
  return { open, shut };
}

describe("the count", () => {
  it("runs from countdownBeats down to nought, stays open, and starts again", () => {
    const world = createWorld({ ...CFG }, 0, [count(COL)]);
    for (let t = 0; t < TPB; t++) step(world, []);
    const c = world.creatures[0]!;
    const period = countdownPeriod(CFG);
    expect(period).toBe(CFG.countdownBeats + CFG.countdownOpenBeats);
    let opens = 0;
    let last = countdownMarks(CFG, -1, c);
    for (let b = 0; b < period * 3; b++) {
      const m = countdownMarks(CFG, b, c);
      expect(m).toBeGreaterThanOrEqual(0);
      expect(m).toBeLessThanOrEqual(CFG.countdownBeats);
      // Down by one, held at nought, or back to the top — never anything else.
      expect(m === last - 1 || (m === 0 && last === 0) || m === CFG.countdownBeats).toBe(true);
      if (m === 0) opens += 1;
      last = m;
    }
    expect(opens).toBe(CFG.countdownOpenBeats * 3);
  });

  it("rolls a phase of its own per body, from the world's stream", () => {
    const world = createWorld({ ...CFG }, 0, [
      count(1),
      { beat: 0, col: 3, kind: "countdown", color: "cyan" },
      count(5),
      { beat: 1, col: 2, kind: "countdown", color: "cyan" },
      count(4),
    ]);
    for (let t = 0; t < TPB * 2; t++) step(world, []);
    const phases = new Set(world.creatures.map((c) => c.countPhase));
    expect(world.creatures.every((c) => c.countPhase !== undefined)).toBe(true);
    expect(phases.size).toBeGreaterThan(1);
  });

  it("breaks the hull on a shot off zero, and keeps the body", () => {
    const { shut } = beatsOf();
    const at = shut * TPB;
    const { world, events } = run([count(COL)], at + TPB, [aim(at, COL), fire(at, "red")]);
    expect(world.creatures).toHaveLength(1);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(world.retries).toBe(1);
  });

  it("dies to its colour on zero, for scoreCountdownKill", () => {
    const { open } = beatsOf();
    const at = open * TPB;
    const { world, events } = run([count(COL)], at + TPB, [aim(at, COL), fire(at, "red")]);
    expect(world.creatures).toHaveLength(0);
    expect(events.some((e) => e.type === "destroy" && e.kind === "countdown")).toBe(true);
    expect(world.score).toBeGreaterThanOrEqual(CFG.scoreCountdownKill);
    expect(world.retries).toBe(0);
  });

  it("books the wrong colour on zero as a colour miss, not as a shot off zero", () => {
    const { open } = beatsOf();
    const at = open * TPB;
    const { world, events } = run([count(COL)], at + TPB, [aim(at, COL), fire(at, "cyan")]);
    expect(world.creatures).toHaveLength(1);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(world.retries).toBe(0);
  });

  it("replays deterministically: the kill on zero, and the fingerprint pins it", () => {
    const { open } = beatsOf();
    const at = open * TPB;
    const replay = record({
      name: "count killed on zero",
      seed: 0,
      queue: [count(COL)],
      ticks: at + TPB,
      inputs: [aim(at, COL), fire(at, "red")],
    });
    const world = runReplay(replay);
    expect(world.creatures).toHaveLength(0);
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });
});
