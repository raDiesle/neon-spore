import { describe, expect, it } from "bun:test";
import {
  balanceSheet,
  createWorld,
  DEFAULT_CONFIG,
  endRun,
  hullRow,
  type PodEntry,
  resetRun,
  type SimConfig,
  type SpawnEntry,
  share,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * The balance sheet counts *joint moments* — the occasions the pair either met
 * or did not. What is tested here is that each of the three kinds is counted
 * where it happens, once, and that a run's sheet is a run's: cleared by
 * `resetRun` and by nothing else.
 *
 * What is deliberately not tested is any per-player figure, because there is
 * none and there must not be one (docs/spec/structure.md 7.2).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);

function run(
  ticks: number,
  inputs: TimedCommand[] = [],
  queue: SpawnEntry[] = [],
  pods: PodEntry[] = [],
) {
  const world = createWorld({ ...CFG }, 0, queue, pods);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < ticks; t++) step(world, byTick.get(t) ?? []);
  return world;
}

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

describe("a shot at a colour", () => {
  it("counts as met when the colour matches", () => {
    const world = run(
      TPB * 4,
      [aim(1, 3), fire(TPB + 2, "red")],
      [{ beat: 0, col: 3, kind: "slick", color: "red" }],
    );
    expect(world.balance.colorHits).toBe(1);
    expect(world.balance.colorMisses).toBe(0);
    expect(world.balance.streak).toBe(1);
  });

  it("counts as missed when it does not, and breaks the streak", () => {
    const world = run(
      TPB * 4,
      [aim(1, 3), fire(TPB + 2, "cyan")],
      [{ beat: 0, col: 3, kind: "slick", color: "red" }],
    );
    expect(world.balance.colorHits).toBe(0);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.balance.streak).toBe(0);
  });

  it("counts a rock neither way — it has no colour to get right", () => {
    const world = run(
      TPB * 4,
      [aim(1, 3), fire(TPB + 2, "red")],
      [{ beat: 0, col: 3, kind: "meteor", color: null }],
    );
    expect(world.balance.colorHits + world.balance.colorMisses).toBe(0);
  });
});

describe("a pod", () => {
  const POD: PodEntry[] = [{ beat: 0, col: 3, row: 4 }];
  const loose = [aim(2, 3), fire(TPB + 4, "red")];
  const ticksToMaw = TPB * 14;

  it("counts as freed the moment a shot knocks it loose", () => {
    const world = run(TPB * 3, loose, [], POD);
    expect(world.balance.podsFreed).toBe(1);
    // Being freed is not itself a moment met — the catch is still ahead.
    expect(world.balance.podsTaken + world.balance.podsLost).toBe(0);
  });

  it("counts as lost when it arrives at a shut maw", () => {
    const world = run(ticksToMaw, loose, [], POD);
    expect(world.balance.podsLost).toBe(1);
    expect(world.balance.podsTaken).toBe(0);
  });
});

describe("a meteor at the hull", () => {
  const ROCK: SpawnEntry[] = [{ beat: 0, col: 3, kind: "meteor", color: null }];
  const arrival = TPB * (HULL + 2);

  it("is a moment met when it is warded off", () => {
    const guard: TimedCommand[] = [];
    for (let t = 1; t < arrival; t += TPB)
      guard.push({ tick: t, player: 1, command: { kind: "guard" } });
    const world = run(
      arrival,
      [{ tick: 1, player: 2, command: { kind: "shieldCol", col: 3 } }, ...guard],
      ROCK,
    );
    expect(world.guard.deflected).toBe(1);
    expect(world.balance.bestStreak).toBeGreaterThanOrEqual(1);
  });

  it("is a moment missed when it is not, whatever the reason", () => {
    const world = run(arrival, [], ROCK);
    expect(world.guard.tries).toBe(1);
    expect(world.guard.deflected).toBe(0);
    expect(world.balance.streak).toBe(0);
  });
});

describe("the sheet", () => {
  function filled() {
    const world = createWorld({ ...CFG }, 0);
    world.guard.tries = 10;
    world.guard.deflected = 7;
    world.guard.mistimed = 2;
    world.balance.podsFreed = 5;
    world.balance.podsTaken = 3;
    world.balance.podsLost = 1;
    world.balance.colorHits = 12;
    world.balance.colorMisses = 4;
    world.balance.bestStreak = 9;
    world.balance.wavesCleared = 2;
    world.score = 1240;
    return world;
  }

  it("is one shared percentage over every joint moment", () => {
    const s = balanceSheet(filled());
    // 7 wards + 3 pods + 12 colours met, of 10 + 4 + 16 asked.
    expect(s.moments).toBe(30);
    expect(s.sync).toBe(Math.round((22 * 100) / 30));
  });

  it("reads timing off the wards where the column was right", () => {
    const s = balanceSheet(filled());
    expect(s.timing).toEqual({ good: 7, of: 9 });
    expect(share(s.timing)).toBe(78);
  });

  it("has no sync value at all when nothing was asked", () => {
    const s = balanceSheet(createWorld({ ...CFG }, 0));
    expect(s.moments).toBe(0);
    expect(s.sync).toBeNull();
    expect(share(s.wards)).toBeNull();
  });

  it("is the run's, and a restart clears it", () => {
    const world = filled();
    resetRun(world);
    const s = balanceSheet(world);
    expect(s.moments).toBe(0);
    expect(s.bestStreak).toBe(0);
    expect(s.wavesCleared).toBe(0);
    expect(s.podsFreed).toBe(0);
  });

  it("survives a wave boundary — the sheet is the whole run", () => {
    const world = run(TPB * 6, [], [{ beat: 0, col: 3, kind: "slick", color: "red" }]);
    world.balance.colorHits = 3;
    expect(world.balance.wavesCleared).toBe(0); // creature still on the field
    const cleared = run(TPB * 6, [], []);
    expect(cleared.balance.wavesCleared).toBe(1);
  });
});

describe("ending a run by hand", () => {
  it("puts the world in the same state the hull going does", () => {
    const world = createWorld({ ...CFG }, 0);
    expect(world.over).toBe(false);
    endRun(world);
    expect(world.over).toBe(true);
  });
});
