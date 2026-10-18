import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
  type PodEntry,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE ROE: three pods strung down one column, freed by one shot.
 *
 * The roe pods hanging in a column are one string: the shot that frees one
 * frees them all, every one sliding the same way, and from rows three apart
 * they land a beat apart — so one press of the maw takes two and the third
 * needs a second (`freePod`, `sim/pods.ts`).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: false };
const TPB = ticksPerBeat(CFG);

const roe = (row: number, col = 5): PodEntry => ({ beat: 0, col, row, kind: "pod", roe: true });
const STRING: PodEntry[] = [roe(1), roe(4), roe(7)];

const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color: "red" },
});
const intake = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "intake" },
});

function run(pods: PodEntry[], ticks: number, inputs: TimedCommand[]) {
  const world = createWorld({ ...CFG }, 0, [], pods);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: { tick: number; e: SimEvent }[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    for (const e of world.events) events.push({ tick: t, e });
  }
  return { world, events };
}

const SHOT: TimedCommand[] = [aim(2, 5), fire(TPB * 2)];
const of = (r: ReturnType<typeof run>, type: SimEvent["type"]) =>
  r.events.filter((x) => x.e.type === type);

describe("one shot", () => {
  it("frees the whole string, every pod the same way", () => {
    const r = run(STRING, TPB * 3, SHOT);
    expect(of(r, "podLoose")).toHaveLength(3);
    expect(r.world.balance.podsFreed).toBe(3);
    const drifts = new Set(r.world.pods.map((p) => Math.sign(p.driftMilli)));
    expect(drifts.size).toBe(1);
  });

  it("frees only the string: a lone pod in the column and a roe in another stay", () => {
    const pods = [...STRING, { beat: 0, col: 5, row: 9, kind: "pod" as const }, roe(4, 8)];
    const r = run(pods, TPB * 3, SHOT);
    // The shot meets the lone pod first, the lowest in the column.
    expect(of(r, "podLoose")).toHaveLength(1);
    // A beat longer than the first: the second shot reaches the string a tick
    // inside three beats on fifteen rows and past them on sixteen (18 October
    // 2026, rows 15 → 16), so the run waits for it.
    const again = run(pods, TPB * 4, [...SHOT, fire(TPB * 2 + 40)]);
    expect(of(again, "podLoose")).toHaveLength(4);
    expect(again.world.pods.filter((p) => !p.loose)).toHaveLength(1);
  });
});

describe("the catch", () => {
  it("lands a beat apart, so one press takes two and a second the third", () => {
    const landing = run(STRING, TPB * 8, [...SHOT, ...held(TPB * 4, TPB * 8)]);
    const taken = of(landing, "podTaken").map((x) => x.tick);
    expect(taken).toHaveLength(3);
    expect(taken[1]! - taken[0]!).toBe(TPB);
    expect(taken[2]! - taken[1]!).toBe(TPB);
    // Opened once, on the first landing: two taken and the third lost.
    const once = run(STRING, TPB * 8, [...SHOT, intake(taken[0]! - 2)]);
    expect(of(once, "podTaken")).toHaveLength(2);
    expect(of(once, "podLost")).toHaveLength(1);
    expect(failHolds(once.world)).toBe(true);
    // And twice, the second on the third: the string is paid.
    const twice = run(STRING, TPB * 8, [...SHOT, intake(taken[0]! - 2), intake(taken[2]! - 2)]);
    expect(of(twice, "podTaken")).toHaveLength(3);
    expect(failHolds(twice.world)).toBe(false);
  });
});

function held(from: number, to: number): TimedCommand[] {
  const out: TimedCommand[] = [];
  for (let t = from; t < to; t += 20) out.push(intake(t));
  return out;
}

describe("a roe replays", () => {
  it("runs the same twice", () => {
    const replay = record({
      name: "a roe freed by one shot and taken on two presses",
      seed: 3,
      queues: [[]],
      podQueues: [STRING],
      ticks: TPB * 8,
      inputs: [...SHOT, ...held(TPB * 4, TPB * 8)],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(hashWorld(runReplay(replay))).toBe(hashWorld(runReplay(replay)));
  });
});
