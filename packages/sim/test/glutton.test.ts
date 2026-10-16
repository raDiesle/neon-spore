import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  gluttonFed,
  hashWorld,
  hullRow,
  type PodEntry,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE GLUTTON: it eats your pods if you are slow.
 *
 * A slow body that steers at the nearest hanging pod and eats it if it gets
 * there first. The meal takes the pod's debt with it — no `podLost`, the wave
 * can still clear — and costs one more matching shot to kill (`sim/glutton.ts`).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: false };
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
/** Long enough for a glutton entering at the top to have reached the hull. */
const FALL = TPB * (HULL * CFG.gluttonFallBeats + 6);

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(
  queue: SpawnEntry[],
  pods: PodEntry[],
  ticks: number,
  inputs: TimedCommand[] = [],
): Run {
  const world = createWorld({ ...CFG }, 0, queue, pods);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const glutton = (col: number): SpawnEntry => ({ beat: 0, col, kind: "glutton", color: "red" });
const POD: PodEntry = { beat: 0, col: 5, row: 4, kind: "pod" };
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: "red" | "cyan" = "red"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

/** The tick of the meal, or -1. */
function mealTick(queue: SpawnEntry[], pods: PodEntry[], inputs: TimedCommand[] = []): number {
  const world = createWorld({ ...CFG }, 0, queue, pods);
  const byTick = new Map(inputs.map((i) => [i.tick, [i]]));
  for (let t = 0; t < FALL; t++) {
    step(world, byTick.get(t) ?? []);
    if (world.events.some((e) => e.type === "gluttonFeeds")) return t;
  }
  return -1;
}

describe("a meal", () => {
  it("is a hanging pod it reaches: the pod is gone, the body a size bigger", () => {
    const at = mealTick([glutton(3)], [POD]);
    expect(at).toBeGreaterThan(0);
    const r = run([glutton(3)], [POD], at + 1);
    expect(r.world.pods).toHaveLength(0);
    const g = r.world.creatures.find((c) => c.kind === "glutton")!;
    expect(gluttonFed(g)).toBe(1);
    expect(g.col).toBe(5);
  });

  it("takes the debt with it: no pod is lost, and killing it clears the wave", () => {
    const at = mealTick([glutton(3)], [POD]);
    const shots = [aim(at + 2, 5), fire(at + TPB), fire(at + TPB * 3)];
    const r = run([glutton(3)], [POD], at + TPB * 6, shots);
    expect(r.events.some((e) => e.type === "podLost")).toBe(false);
    expect(r.events.some((e) => e.type === "gluttonShrinks")).toBe(true);
    expect(r.events.some((e) => e.type === "destroy" && e.kind === "glutton")).toBe(true);
    expect(failHolds(r.world)).toBe(false);
    expect(r.world.balance.wavesCleared).toBe(1);
  });

  it("costs a shot more: one matching shot only gives the meal back", () => {
    const at = mealTick([glutton(3)], [POD]);
    const r = run([glutton(3)], [POD], at + TPB * 3, [aim(at + 2, 5), fire(at + TPB)]);
    const g = r.world.creatures.find((c) => c.kind === "glutton");
    expect(g).toBeDefined();
    expect(gluttonFed(g!)).toBe(0);
  });

  it("is never a pod already shot loose", () => {
    // The cannon under the pod from the start, the shot well before the
    // glutton can reach its row.
    const r = run([glutton(3)], [POD], FALL, [aim(2, 5), fire(TPB)]);
    expect(r.events.some((e) => e.type === "podLoose")).toBe(true);
    expect(r.events.some((e) => e.type === "gluttonFeeds")).toBe(false);
  });
});

describe("a hungry one", () => {
  it("dies to one matching shot", () => {
    const r = run([glutton(3)], [], TPB * 4, [aim(2, 3), fire(TPB * 2 + 4)]);
    expect(r.events.some((e) => e.type === "destroy" && e.kind === "glutton")).toBe(true);
    expect(r.events.some((e) => e.type === "gluttonShrinks")).toBe(false);
  });

  it("unshot, breaks the hull", () => {
    const r = run([glutton(3)], [], FALL, [aim(2, 0)]);
    expect(r.events.some((e) => e.type === "breach")).toBe(true);
  });
});

describe("a glutton wave replays", () => {
  it("runs the same twice", () => {
    const replay = record({
      name: "a glutton eats one pod and is shot twice",
      seed: 3,
      queues: [[glutton(3)]],
      podQueues: [[POD]],
      ticks: FALL,
      inputs: [aim(2, 5), fire(TPB * 10), fire(TPB * 12)],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(hashWorld(runReplay(replay))).toBe(hashWorld(runReplay(replay)));
  });
});
