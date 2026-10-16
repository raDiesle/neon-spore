import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
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

/**
 * THE SEEDER: the kill is a debt.
 *
 * A shot kills it like a slick and leaves a real pod hanging where it died,
 * and from there the pod is an ordinary pod: it holds the wave open, a shot
 * frees it, the maw takes it, and its clock running out loses the wave
 * (`sim/seeder.ts`).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: false };
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
/** Long enough for a body entering at the top to have reached the hull. */
const FALL = TPB * (HULL + 4);

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

const seeder = (col: number): SpawnEntry => ({ beat: 0, col, kind: "seeder", color: "red" });
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
const intake = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "intake" },
});

/** The cannon under column 3 from the start, and one shot early in the fall. */
const KILL: TimedCommand[] = [aim(2, 3), fire(TPB * 2 + 4)];
/** And a second, a few beats later, at the pod the first one left. */
const FREE: TimedCommand[] = [...KILL, fire(TPB * 5)];

/** The maw held open the whole way down, so timing is not what is measured. */
function mawHeld(): TimedCommand[] {
  const out: TimedCommand[] = [];
  for (let t = TPB * 5; t < FALL; t += 20) out.push(intake(t));
  return out;
}

describe("the kill", () => {
  it("is a kill, and leaves a moored pod where it died", () => {
    const r = run([seeder(3)], TPB * 4, KILL);
    const died = r.events.find((e) => e.type === "destroy" && e.kind === "seeder");
    expect(died).toBeDefined();
    const seeded = r.events.find((e) => e.type === "seederSeeds");
    expect(seeded).toBeDefined();
    expect(r.world.creatures).toHaveLength(0);
    expect(r.world.pods).toHaveLength(1);
    const pod = r.world.pods[0]!;
    expect(pod.kind).toBe("pod");
    expect(pod.loose).toBe(false);
    expect(pod.colMilli).toBe(3000);
    if (seeded?.type === "seederSeeds") expect(pod.rowMilli).toBe(seeded.row * 1000);
  });

  it("in the wrong colour is a miss and leaves nothing behind", () => {
    const r = run([seeder(3)], TPB * 4, [aim(2, 3), fire(TPB * 2 + 4, "cyan")]);
    expect(r.events.some((e) => e.type === "seederSeeds")).toBe(false);
    expect(r.world.pods).toHaveLength(0);
  });

  it("holds the wave open while its pod hangs", () => {
    const r = run([seeder(3)], TPB * 6, KILL);
    expect(r.world.balance.wavesCleared).toBe(0);
  });
});

describe("the debt", () => {
  it("is paid by freeing the pod and swallowing it", () => {
    const r = run([seeder(3)], FALL + TPB * 4, [...FREE, ...mawHeld()]);
    expect(r.events.some((e) => e.type === "podTaken")).toBe(true);
    expect(failHolds(r.world)).toBe(false);
    expect(r.world.balance.wavesCleared).toBe(1);
  });

  it("loses the wave when nobody frees it before its clock runs out", () => {
    const due = CFG.podDueBeats * TPB;
    const r = run([seeder(3)], TPB * 3 + due + TPB, KILL);
    expect(r.events.some((e) => e.type === "podLost")).toBe(true);
    expect(failHolds(r.world)).toBe(true);
  });

  it("is never owed by one nobody shot: it breaks the hull and hangs nothing", () => {
    const r = run([seeder(3)], FALL, [aim(2, 3)]);
    expect(r.events.some((e) => e.type === "breach")).toBe(true);
    expect(r.events.some((e) => e.type === "seederSeeds")).toBe(false);
  });
});

describe("a seeder wave replays", () => {
  it("runs the same twice", () => {
    const replay = record({
      name: "one killed, its pod freed and swallowed, one left whole",
      seed: 3,
      queue: [seeder(3), { beat: 2, col: 6, kind: "seeder", color: "cyan" }],
      ticks: FALL + TPB * 4,
      inputs: [...FREE, ...mawHeld()],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(hashWorld(runReplay(replay))).toBe(hashWorld(runReplay(replay)));
  });
});
