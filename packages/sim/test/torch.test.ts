import { describe, expect, it } from "bun:test";
import {
  clampSpanCol,
  colSpan,
  createWorld,
  DEFAULT_CONFIG,
  fallTilesPerBeat,
  hashWorld,
  hullPercent,
  hullRow,
  occupiesCol,
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
const RATE = fallTilesPerBeat("torch");
// Same arithmetic as rules.test.ts's IMPACT_TICK, generalised to any rate: the
// creature spawns at beat 1, row 0, then moves `rate` tiles on every later
// beat, so it first reaches the hull on beat ceil(HULL / rate) + 1.
const IMPACT_BEAT = Math.ceil(HULL / RATE) + 1;
const IMPACT_TICK = TPB * IMPACT_BEAT;

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

const torch = (col: number): SpawnEntry => ({ beat: 0, col, kind: "torch", color: null });
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
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

describe("colSpan and occupiesCol", () => {
  it("is 3 wide for a torch, 1 for everything else", () => {
    expect(colSpan("torch")).toBe(3);
    expect(colSpan("meteor")).toBe(1);
    expect(colSpan("slick")).toBe(1);
  });

  it("occupies its centre column and both flanks, nothing further", () => {
    const c = { col: 5 } as Parameters<typeof occupiesCol>[0];
    expect(occupiesCol({ ...c, kind: "torch" }, 4)).toBe(true);
    expect(occupiesCol({ ...c, kind: "torch" }, 5)).toBe(true);
    expect(occupiesCol({ ...c, kind: "torch" }, 6)).toBe(true);
    expect(occupiesCol({ ...c, kind: "torch" }, 3)).toBe(false);
    expect(occupiesCol({ ...c, kind: "torch" }, 7)).toBe(false);
  });
});

describe("clampSpanCol", () => {
  it("keeps a torch's whole span on the field at both edges", () => {
    expect(clampSpanCol(0, CFG.cols, "torch")).toBe(1);
    expect(clampSpanCol(CFG.cols - 1, CFG.cols, "torch")).toBe(CFG.cols - 2);
  });

  it("leaves a one-wide kind free to sit on either edge column", () => {
    expect(clampSpanCol(0, CFG.cols, "meteor")).toBe(0);
    expect(clampSpanCol(CFG.cols - 1, CFG.cols, "meteor")).toBe(CFG.cols - 1);
  });
});

describe("the torch", () => {
  it("spawns clamped so its whole span lands on the field", () => {
    const { world } = run([{ beat: 0, col: 0, kind: "torch", color: null }], TPB);
    expect(world.creatures[0]!.col).toBe(1);
  });

  it("deflects from the centre column", () => {
    const { world, events } = run([torch(5)], IMPACT_TICK + 1, [
      shieldTo(10, 5),
      guard(IMPACT_TICK - 20),
    ]);
    expect(world.guard.deflected).toBe(1);
    expect(hullPercent(world)).toBe(100);
    expect(events.some((e) => e.type === "deflect" && e.span === 3)).toBe(true);
  });

  it("deflects from the left flank", () => {
    const { world } = run([torch(5)], IMPACT_TICK + 1, [shieldTo(10, 4), guard(IMPACT_TICK - 20)]);
    expect(world.guard.deflected).toBe(1);
    expect(hullPercent(world)).toBe(100);
  });

  it("deflects from the right flank", () => {
    const { world } = run([torch(5)], IMPACT_TICK + 1, [shieldTo(10, 6), guard(IMPACT_TICK - 20)]);
    expect(world.guard.deflected).toBe(1);
    expect(hullPercent(world)).toBe(100);
  });

  it("does not deflect one column past either flank", () => {
    const left = run([torch(5)], IMPACT_TICK + 1, [shieldTo(10, 3), guard(IMPACT_TICK - 20)]);
    expect(left.world.guard.deflected).toBe(0);
    const right = run([torch(5)], IMPACT_TICK + 1, [shieldTo(10, 7), guard(IMPACT_TICK - 20)]);
    expect(right.world.guard.deflected).toBe(0);
  });

  it("costs the hull damageMeteor exactly once on a miss, and scars all three columns", () => {
    // No-regen config: a miss should cost exactly one damageMeteor, and the
    // ambient per-tick hull regen over IMPACT_TICK ticks would otherwise mask
    // whether the span paid for itself three times over.
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [torch(5)]);
    const byTick = new Map<number, TimedCommand[]>();
    for (let t = 0; t < IMPACT_TICK + 1; t++) step(world, byTick.get(t) ?? []);
    expect(hullPercent(world)).toBe(100 - CFG.damageMeteor);
    const scarredCols = new Set(world.scars.map((s) => s.col));
    expect(scarredCols).toEqual(new Set([4, 5, 6]));
  });

  it("fires a single breach event on a miss, on the centre column", () => {
    const { events } = run([torch(5)], IMPACT_TICK + 1);
    const breaches = events.filter((e) => e.type === "breach");
    expect(breaches).toHaveLength(1);
    expect(breaches[0]).toMatchObject({ col: 5, damage: CFG.damageMeteor });
  });

  it("craters rather than destroys when shot, like every other rock", () => {
    const inputs = [aim(10, 5)];
    for (let t = 200; t < IMPACT_TICK; t += 60) inputs.push(fire(t, "red"));
    const { world, events } = run([torch(5)], IMPACT_TICK - 1, inputs);
    expect(world.creatures).toHaveLength(1);
    expect(world.creatures[0]!.holes).toBeGreaterThan(0);
    expect(world.creatures[0]!.holes).toBeLessThanOrEqual(CFG.maxHoles);
    expect(events.some((e) => e.type === "hole")).toBe(true);
  });

  it("replays deterministically: the pair deflect it, and the fingerprint pins that", () => {
    const replay = record({
      name: "torch deflected",
      seed: 0,
      queue: [torch(5)],
      ticks: IMPACT_TICK + 1,
      inputs: [shieldTo(10, 5), guard(IMPACT_TICK - 20)],
    });
    const world = runReplay(replay);
    expect(world.guard.deflected).toBe(1);
    expect(hullPercent(world)).toBe(100);
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });
});
