import { describe, expect, it } from "bun:test";
import {
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
  MILLI,
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
 * The three options on a pod (`sim/pod-options.ts`): a coloured pod only its
 * colour frees, a heavy pod the maw takes in two presses, and a pod that
 * swings and is let go the way it was swinging.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: false };
const TPB = ticksPerBeat(CFG);

const pod = (extra: Partial<PodEntry>): PodEntry => ({
  beat: 0,
  col: 5,
  row: 4,
  kind: "pod",
  ...extra,
});

const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: Color = "red"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
const intake = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "intake" } });

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

const of = (r: ReturnType<typeof run>, type: SimEvent["type"]) =>
  r.events.filter((x) => x.e.type === type);

describe("a coloured pod", () => {
  it("turns away the other colour and is freed by its own", () => {
    const cyan = [pod({ tint: "cyan" })];
    const wrong = run(cyan, TPB * 3, [aim(2, 5), fire(TPB, "red")]);
    expect(of(wrong, "bounce")).toHaveLength(1);
    expect(of(wrong, "podLoose")).toHaveLength(0);
    const right = run(cyan, TPB * 3, [aim(2, 5), fire(TPB, "cyan")]);
    expect(of(right, "podLoose")).toHaveLength(1);
  });
});

/** The tick a heavy pod freed at `TPB` reaches the mouth, held open. */
function gripTick(): number {
  const r = run([pod({ heavy: true })], TPB * 6, [aim(2, 5), fire(TPB), ...held(TPB * 2, TPB * 6)]);
  return of(r, "podGripped")[0]!.tick;
}

function held(from: number, to: number): TimedCommand[] {
  const out: TimedCommand[] = [];
  for (let t = from; t < to; t += 200) out.push(intake(t));
  return out;
}

describe("a heavy pod", () => {
  it("falls straight down", () => {
    const r = run([pod({ heavy: true })], TPB * 2, [aim(2, 5), fire(TPB)]);
    expect(r.world.pods[0]!.loose).toBe(true);
    expect(r.world.pods[0]!.driftMilli).toBe(0);
    expect(r.world.pods[0]!.colMilli).toBe(5 * MILLI);
  });

  it("is gripped by one press and taken by a second", () => {
    const at = gripTick();
    const once = run([pod({ heavy: true })], at + TPB * 4, [aim(2, 5), fire(TPB), intake(at - 4)]);
    expect(of(once, "podGripped")).toHaveLength(1);
    expect(of(once, "podTaken")).toHaveLength(0);
    // Nobody pressed again: it slipped out of the mouth, and the wave is lost.
    expect(of(once, "podLost")).toHaveLength(1);
    expect(failHolds(once.world)).toBe(true);
    const twice = run([pod({ heavy: true })], at + TPB * 4, [
      aim(2, 5),
      fire(TPB),
      intake(at - 4),
      intake(at + TPB),
    ]);
    expect(of(twice, "podTaken").map((x) => x.tick)).toEqual([at + TPB]);
    expect(failHolds(twice.world)).toBe(false);
    expect(twice.world.pods).toHaveLength(0);
  });
});

describe("a swinging pod", () => {
  it("crosses a column either side while it hangs", () => {
    const r = run([pod({ swing: true })], TPB * 10, []);
    const p = r.world.pods[0]!;
    expect(p.colMilli).toBeGreaterThanOrEqual(4 * MILLI);
    expect(p.colMilli).toBeLessThanOrEqual(6 * MILLI);
    // Four beats out to the end and back to the middle: at ten it is past a turn.
    const cols = new Set<number>();
    const w = createWorld({ ...CFG }, 0, [], [pod({ swing: true })]);
    for (let t = 0; t < TPB * 10; t++) {
      step(w, []);
      if (w.pods[0]) cols.add(Math.round(w.pods[0].colMilli / MILLI));
    }
    expect([...cols].sort()).toEqual([4, 5, 6]);
  });

  it("is let go the way it was swinging", () => {
    const w = createWorld({ ...CFG }, 0, [], [pod({ swing: true })]);
    // Run until it comes over column six on its way right: the shot climbs
    // for under a beat, and it turns at six three quarters of a beat later.
    let t = 0;
    for (; t < TPB * 20; t++) {
      step(w, []);
      const p = w.pods[0];
      if (p && p.crossMilli > 0 && Math.round(p.colMilli / MILLI) === 6) break;
    }
    const r = run([pod({ swing: true })], t + TPB * 2, [aim(1, 6), fire(t)]);
    const loose = r.world.pods.find((p) => p.loose) ?? null;
    expect(of(r, "podLoose")).toHaveLength(1);
    expect(Math.sign(loose!.driftMilli)).toBe(1);
  });
});

describe("the options replay", () => {
  it("runs the same twice", () => {
    const replay = record({
      name: "a coloured pod, a heavy one and a swinging one",
      seed: 5,
      queues: [[]],
      podQueues: [
        [pod({ tint: "cyan", col: 2 }), pod({ heavy: true }), pod({ swing: true, col: 8 })],
      ],
      ticks: TPB * 10,
      inputs: [
        aim(2, 2),
        fire(TPB, "red"),
        fire(TPB + 60, "cyan"),
        aim(TPB * 3, 5),
        fire(TPB * 3 + 10),
        ...held(TPB * 4, TPB * 10),
      ],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(hashWorld(runReplay(replay))).toBe(hashWorld(runReplay(replay)));
  });
});
