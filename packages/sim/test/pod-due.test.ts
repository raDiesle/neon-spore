import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullRow,
  type PodEntry,
  type SimConfig,
  type SimEvent,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * **A real pod is owed in time** — the owner, 16 October 2026, who rejected the
 * purge and the ward and kept one pod: from the beat it appears the pair has
 * `podDueBeats` to take it in, and a pod still on the field when the clock
 * runs out loses the wave (`Pod.dueTicks`, `pods.ts`). The hollow one wears
 * the same clock and is let go at no cost when it runs out.
 *
 * This file was the swallow's timing while a pod's cargo landed on the tick of
 * the catch; with no cargo the moment that has to be exact is the other end.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: false, podDriftTilesPerBeat: 0 };
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
const POD_COL = 3;
const ARRIVAL = Math.ceil((TPB * (HULL - 4)) / CFG.podFallTilesPerBeat) + TPB * 4;

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

/** Free the pod, then hold the column and the maw open for the whole fall. */
function hold(col: number): TimedCommand[] {
  const inputs: TimedCommand[] = [aim(2, POD_COL), fire(TPB + 4)];
  for (let t = TPB * 2; t < ARRIVAL; t += 20) {
    inputs.push(aim(t, col));
    inputs.push(intake(t));
  }
  return inputs;
}

/** The events of every tick, numbered by the tick they came out of. */
function play(pods: PodEntry[], ticks: number, inputs: TimedCommand[] = []): SimEvent[][] {
  const world = createWorld({ ...CFG }, 0, [], pods);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const out: SimEvent[][] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    out.push([...world.events]);
  }
  return out;
}

const firstTick = (ticks: SimEvent[][], type: SimEvent["type"]): number =>
  ticks.findIndex((events) => events.some((e) => e.type === type));

describe("a real pod's clock", () => {
  it("is paid by taking it in, and the wave is not lost", () => {
    const ticks = play([{ beat: 0, col: POD_COL, row: 4, kind: "pod" }], ARRIVAL, hold(POD_COL));
    expect(firstTick(ticks, "podTaken")).toBeGreaterThan(0);
    expect(firstTick(ticks, "waveFailed")).toBe(-1);
  });

  it("loses the wave where the pod hangs, on the beat the clock runs out", () => {
    const due = 4;
    const ticks = play([{ beat: 0, col: POD_COL, row: 4, kind: "pod", due }], TPB * (due + 3));
    const lostAt = firstTick(ticks, "podLost");
    expect(lostAt).toBeGreaterThan(0);
    expect(firstTick(ticks, "waveFailed")).toBe(lostAt);
    const lost = ticks[lostAt]!.find((e) => e.type === "podLost");
    // Where it was hanging, which no other lost pod says.
    expect(lost).toEqual({ type: "podLost", col: POD_COL, row: 4 });
    // And on the clock's own beat: the authored `due`, counted from the tick
    // the pod appeared, not from the start of the wave.
    const appeared = TPB * 1;
    expect(Math.abs(lostAt - (appeared + due * TPB))).toBeLessThanOrEqual(TPB);
  });

  it("runs `podDueBeats` when the wave says nothing", () => {
    const shipped = play([{ beat: 0, col: POD_COL, row: 4, kind: "pod" }], TPB * 30);
    const authored = play(
      [{ beat: 0, col: POD_COL, row: 4, kind: "pod", due: CFG.podDueBeats }],
      TPB * 30,
    );
    expect(firstTick(shipped, "podLost")).toBe(firstTick(authored, "podLost"));
  });
});

describe("a hollow pod's clock", () => {
  it("lets it go at no cost when it runs out", () => {
    const due = 4;
    const ticks = play([{ beat: 0, col: POD_COL, row: 4, kind: "husk", due }], TPB * (due + 3));
    expect(firstTick(ticks, "huskRefused")).toBeGreaterThan(0);
    expect(firstTick(ticks, "waveFailed")).toBe(-1);
  });
});

describe("dueTicks and the desync ledger", () => {
  it("is part of hashWorld — two worlds a tick apart on a pod's clock do not hash the same", () => {
    const pods: PodEntry[] = [{ beat: 0, col: POD_COL, row: 4, kind: "pod" }];
    const a = createWorld({ ...CFG }, 0, [], pods);
    const b = createWorld({ ...CFG }, 0, [], pods);
    for (let t = 0; t < TPB * 2; t++) {
      step(a, []);
      step(b, []);
    }
    b.pods[0]!.dueTicks -= 1;
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
