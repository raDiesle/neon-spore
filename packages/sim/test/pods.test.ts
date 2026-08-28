import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hullPercent,
  hullRow,
  type PodEntry,
  type SimConfig,
  type SimEvent,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";
import { NO_SHELL } from "../src/shell.js";

/**
 * The pod is the only thing on the field that is *taken* rather than cleared,
 * and the whole mechanic hangs on two separate agreements: player 2 has to
 * shoot it loose from a column player 1 is holding, and then player 1 has to
 * still be under it, with the maw open, when it arrives. Each half is tested
 * on its own, because failing either has to feel different.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: false };
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(
  pods: PodEntry[],
  ticks: number,
  inputs: TimedCommand[] = [],
  cfg: SimConfig = CFG,
): Run {
  const world = createWorld({ ...cfg }, 0, [], pods);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

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

/**
 * Shoot the pod loose and leave the cannon where it was. Not on the first tick:
 * a pod listed at wave-beat 0 enters on the first beat, exactly like a creature,
 * so a shot fired before that goes up an empty column.
 */
const shootLoose = (col: number): TimedCommand[] => [aim(2, col), fire(TPB + 4)];

/**
 * The same field with the sideways drift switched off. Everything about the
 * catch except the drift is tested against this: with a pod sliding across
 * columns, a test that parks the cannon would be testing the rng.
 */
const STILL: SimConfig = { ...CFG, podDriftTilesPerBeat: 0 };

/** The column every pod in this file hangs in. */
const POD_COL = 3;

describe("a moored pod", () => {
  it("hangs exactly where the wave left it and never moves on its own", () => {
    const { world } = run([{ beat: 0, col: 3, row: 4 }], TPB * 8);
    expect(world.pods).toHaveLength(1);
    const pod = world.pods[0]!;
    expect(pod.loose).toBe(false);
    expect(pod.rowMilli).toBe(4000);
    expect(pod.colMilli).toBe(3000);
  });

  it("does not hold up the end of a wave", () => {
    // An empty spawn queue is a cleared wave, pod or no pod.
    const { events } = run([{ beat: 0, col: 3, row: 4 }], TPB * 6);
    expect(events.some((e) => e.type === "needWave")).toBe(true);
  });
});

describe("shooting a pod loose", () => {
  it("sets it falling and sliding, and reports where it came free", () => {
    const { world, events } = run([{ beat: 0, col: 3, row: 4 }], TPB * 3, shootLoose(3));
    const pod = world.pods[0]!;
    expect(pod.loose).toBe(true);
    expect(pod.rowMilli).toBeGreaterThan(4000);
    expect(pod.colMilli).not.toBe(3000);
    expect(events.some((e) => e.type === "podLoose")).toBe(true);
  });

  it("stays put when the shot goes up a different column", () => {
    const { world } = run([{ beat: 0, col: 3, row: 4 }], TPB * 3, [aim(2, 5), fire(4)]);
    expect(world.pods[0]!.loose).toBe(false);
  });

  it("cannot be shot a second time once it is falling", () => {
    const { events } = run([{ beat: 0, col: 3, row: 4 }], TPB * 4, [
      ...shootLoose(3),
      fire(TPB),
      fire(TPB * 2),
    ]);
    expect(events.filter((e) => e.type === "podLoose")).toHaveLength(1);
  });
});

/**
 * Long enough for a pod freed near the top to have reached the hull. The fall
 * is slow on purpose — it is the only thing in the game that gives player 1
 * time to move *and* decide.
 */
const ARRIVAL = Math.ceil((TPB * (HULL - 4)) / CFG.podFallTilesPerBeat) + TPB * 4;

/**
 * Free the pod from the column it hangs in, then hold `col` — and optionally
 * keep the maw open — for the whole fall, so that neither the aim nor the
 * timing is what the test is measuring.
 */
function hold(col: number, withIntake: boolean): TimedCommand[] {
  const inputs: TimedCommand[] = [...shootLoose(POD_COL)];
  for (let t = TPB * 2; t < ARRIVAL; t += 20) {
    inputs.push(aim(t, col));
    if (withIntake) inputs.push(intake(t));
  }
  return inputs;
}

describe("taking a pod in", () => {
  it("repairs the hull and scores when the cannon is under it and the maw is open", () => {
    // Damage first, so a repair is visible: the pod is worth `podRepair` points
    // of hull, and a hull already at 100 would hide that entirely.
    const world = createWorld({ ...STILL }, 0, [], [{ beat: 0, col: 3, row: 4 }]);
    world.hullMilli = 40_000;
    const inputs = hold(3, true);
    const byTick = new Map<number, TimedCommand[]>();
    for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
    const events: SimEvent[] = [];
    for (let t = 0; t < ARRIVAL; t++) {
      step(world, byTick.get(t) ?? []);
      events.push(...world.events);
    }

    expect(events.some((e) => e.type === "podTaken")).toBe(true);
    expect(world.pods).toHaveLength(0);
    expect(world.score).toBeGreaterThanOrEqual(CFG.scorePod);
    // Regeneration runs the whole time, so the repair is a floor, not a figure.
    expect(hullPercent(world)).toBeGreaterThan(40 + CFG.podRepair);
  });

  it("is lost when the maw never opens, however well the cannon follows", () => {
    const inputs = hold(3, false);
    const { world, events } = run([{ beat: 0, col: 3, row: 4 }], ARRIVAL, inputs, STILL);
    expect(events.some((e) => e.type === "podLost")).toBe(true);
    expect(events.some((e) => e.type === "podTaken")).toBe(false);
    expect(world.pods).toHaveLength(0);
  });

  it("is lost when the maw is open in the wrong column", () => {
    const inputs = hold(0, true);
    const { events } = run([{ beat: 0, col: 3, row: 4 }], ARRIVAL, inputs, STILL);
    expect(events.some((e) => e.type === "podLost")).toBe(true);
  });

  it("costs no hull when it is missed — a missed gift is not a punishment", () => {
    const { world } = run([{ beat: 0, col: 3, row: 4 }], ARRIVAL, shootLoose(3), STILL);
    expect(hullPercent(world)).toBe(100);
    expect(world.scars).toHaveLength(0);
  });
});

/**
 * The three things a pod can give. A pod with no `kind` at all — every test
 * above this point authors one that way — defaults to `mend`, which is what
 * every pod authored before this mechanic existed already was; that default
 * is what keeps every one of those tests honest without being told about
 * `kind` at all.
 */
describe("what a pod gives", () => {
  it("mends the hull, capped at 100, when a mend pod is swallowed", () => {
    const { world, events } = run(
      [{ beat: 0, col: 3, row: 4, kind: "mend" }],
      ARRIVAL,
      hold(3, true),
      STILL,
    );
    expect(events.some((e) => e.type === "podTaken")).toBe(true);
    expect(hullPercent(world)).toBe(100);
  });

  it("carries the kind it was authored with on podTaken", () => {
    const { events } = run(
      [{ beat: 0, col: 3, row: 4, kind: "ward" }],
      ARRIVAL,
      hold(3, true),
      STILL,
    );
    const taken = events.find((e) => e.type === "podTaken");
    expect(taken && "kind" in taken ? taken.kind : undefined).toBe("ward");
  });

  it("purge clears every creature on the field and pays for each one", () => {
    const world = createWorld({ ...STILL }, 0, [], [{ beat: 0, col: 3, row: 4, kind: "purge" }]);
    // Row 0, as if freshly spawned: anything further down would reach the
    // hull under its own advance before the pod's slow fall gets it caught,
    // and be gone by then for an unrelated reason.
    world.creatures.push(
      {
        id: world.nextId++,
        kind: "slick",
        col: 5,
        row: 0,
        fromRow: -1,
        color: "red",
        holes: 0,
        petals: 0,
        dragMilli: 0,
        throbOpen: false,
        shell: NO_SHELL,
      },
      {
        id: world.nextId++,
        kind: "meteor",
        col: 7,
        row: 0,
        fromRow: -1,
        color: null,
        holes: 0,
        petals: 0,
        dragMilli: 0,
        throbOpen: false,
        shell: NO_SHELL,
      },
    );
    const inputs = hold(3, true);
    const byTick = new Map<number, TimedCommand[]>();
    for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
    const events: SimEvent[] = [];
    for (let t = 0; t < ARRIVAL; t++) {
      step(world, byTick.get(t) ?? []);
      events.push(...world.events);
    }
    expect(events.some((e) => e.type === "podTaken")).toBe(true);
    expect(world.creatures).toHaveLength(0);
    expect(events.some((e) => e.type === "destroy" && e.col === 5)).toBe(true);
    expect(events.some((e) => e.type === "hole" && e.col === 7)).toBe(true);
  });

  it("ward holds the shield armed with no guard command, deflecting a meteor after the catch", () => {
    const world = createWorld({ ...STILL }, 0, [], [{ beat: 0, col: 3, row: 4, kind: "ward" }]);
    const inputs = hold(3, true);
    const byTick = new Map<number, TimedCommand[]>();
    for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
    const events: SimEvent[] = [];
    for (let t = 0; t < ARRIVAL; t++) {
      step(world, byTick.get(t) ?? []);
      events.push(...world.events);
    }
    expect(events.some((e) => e.type === "podTaken")).toBe(true);

    // A meteor arriving one beat later, in the column the cannon is already
    // holding, with no guard command anywhere in the run: only the ward can
    // deflect it.
    world.creatures.push({
      id: world.nextId++,
      kind: "meteor",
      col: world.shieldCol,
      row: HULL - 1,
      fromRow: HULL - 2,
      color: null,
      holes: 0,
      petals: 0,
      dragMilli: 0,
      throbOpen: false,
      shell: NO_SHELL,
    });
    const events2: SimEvent[] = [];
    for (let t = 0; t < TPB; t++) {
      step(world, []);
      events2.push(...world.events);
    }
    expect(events2.some((e) => e.type === "deflect")).toBe(true);
    expect(hullPercent(world)).toBe(100);
  });

  it("without a ward, the same arriving meteor breaches the hull instead", () => {
    const world = createWorld({ ...STILL }, 0, [], [{ beat: 0, col: 3, row: 4, kind: "mend" }]);
    const inputs = hold(3, true);
    const byTick = new Map<number, TimedCommand[]>();
    for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
    for (let t = 0; t < ARRIVAL; t++) step(world, byTick.get(t) ?? []);

    world.creatures.push({
      id: world.nextId++,
      kind: "meteor",
      col: world.shieldCol,
      row: HULL - 1,
      fromRow: HULL - 2,
      color: null,
      holes: 0,
      petals: 0,
      dragMilli: 0,
      throbOpen: false,
      shell: NO_SHELL,
    });
    const events2: SimEvent[] = [];
    for (let t = 0; t < TPB; t++) {
      step(world, []);
      events2.push(...world.events);
    }
    expect(events2.some((e) => e.type === "deflect")).toBe(false);
    expect(events2.some((e) => e.type === "breach")).toBe(true);
    expect(hullPercent(world)).toBeLessThan(100);
  });
});

describe("the last stretch of the fall", () => {
  it("steers into the cannon's column so an off-column catch still lands", () => {
    const { events } = run([{ beat: 0, col: POD_COL, row: 4 }], ARRIVAL, hold(2, true), STILL);
    expect(events.some((e) => e.type === "podTaken")).toBe(true);
  });

  it("without the assist, the same off-column hold misses", () => {
    const NO_HOME: SimConfig = { ...STILL, podHomeTiles: 0 };
    const { events } = run([{ beat: 0, col: POD_COL, row: 4 }], ARRIVAL, hold(2, true), NO_HOME);
    expect(events.some((e) => e.type === "podLost")).toBe(true);
    expect(events.some((e) => e.type === "podTaken")).toBe(false);
  });
});
