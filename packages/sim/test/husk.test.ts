import { describe, expect, it } from "bun:test";
import { hashWorld } from "../src/hash.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hullRow,
  type PodEntry,
  type SimConfig,
  type SimEvent,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";
import { MILLI } from "../src/world.js";

/**
 * THE HUSK: the one thing that reaches the maw and must be kept out.
 *
 * Every other object on the field is answered by doing something to it. The
 * husk is answered by *not* — it hangs like a pod, falls like a pod, wears a
 * real cargo's face and arrives at the ship exactly as a pod does, and the
 * reflex that has paid off every time until now loses the wave. Only player 2
 * can tell (the look, which is the creature's other half); player 1 is the one
 * holding the maw, so the refusal is two people doing two different things
 * about one object.
 *
 * Which is why almost every assertion here is the *pod* test's assertion with
 * its sign turned over. If a husk ever stopped being indistinguishable from a
 * pod up to the last tick, the pair could practise the two apart, and this
 * file is where that would show.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: false };
/** No sideways drift: a test that parks the cannon under a sliding husk would
 * be testing the rng and not the mouth. */
const STILL: SimConfig = { ...CFG, podDriftTilesPerBeat: 0 };
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
const COL = 3;
const ROW = 4;

/** Long enough for something freed at `ROW` to have reached the hull. */
const ARRIVAL = Math.ceil((TPB * (HULL - ROW)) / CFG.podFallTilesPerBeat) + TPB * 4;

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

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(pods: PodEntry[], ticks: number, inputs: TimedCommand[], cfg = STILL): Run {
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

/** Shoot it loose, then hold `col` for the whole fall — and open the maw all
 * the way down, or never. Neither the aim nor the timing is what is measured. */
function chase(col: number, withIntake: boolean): TimedCommand[] {
  const inputs: TimedCommand[] = [aim(2, COL), fire(TPB + 4)];
  for (let t = TPB * 2; t < ARRIVAL; t += 20) {
    inputs.push(aim(t, col));
    if (withIntake) inputs.push(intake(t));
  }
  return inputs;
}

const husk: PodEntry = { beat: 0, col: COL, row: ROW, kind: "purge", husk: true };
const pod: PodEntry = { beat: 0, col: COL, row: ROW, kind: "purge" };

describe("a husk on the field", () => {
  it("hangs and comes loose exactly the way a pod does", () => {
    // The tell would be here if there were one: up to the maw the two are the
    // same object, and a shot frees this one on the same beat.
    const a = run([husk], TPB * 3, [aim(2, COL), fire(TPB + 4)]);
    const b = run([pod], TPB * 3, [aim(2, COL), fire(TPB + 4)]);
    expect(a.world.pods[0]!.loose).toBe(true);
    expect(a.world.pods[0]!.rowMilli).toBe(b.world.pods[0]!.rowMilli);
    expect(a.events.filter((e) => e.type === "podLoose")).toHaveLength(1);
    expect(a.world.balance.podsFreed).toBe(b.world.balance.podsFreed);
  });

  it("is not held apart from a pod by anything the wave says", () => {
    // The flag is the only difference in the entry, and `kind` goes on saying
    // what the thing claims to give.
    const { world } = run([husk], TPB * 2, []);
    expect(world.pods[0]!.husk).toBe(true);
    expect(world.pods[0]!.kind).toBe("purge");
  });
});

describe("swallowing one", () => {
  it("loses the wave, and gives nothing", () => {
    const { world, events } = run([husk], ARRIVAL, chase(COL, true));
    expect(events.some((e) => e.type === "huskSwallowed")).toBe(true);
    expect(events.some((e) => e.type === "podTaken")).toBe(false);
    expect(failHolds(world)).toBe(true);
    expect(world.balance.husksSwallowed).toBe(1);
    expect(world.balance.podsTaken).toBe(0);
    // Nothing struck the hull: it is a wave lost, not a wound.
    expect(world.scars).toHaveLength(0);
  });

  it("is the same two conditions a pod is taken on, read the other way up", () => {
    // The pod that would have been taken by these exact inputs.
    const { events } = run([pod], ARRIVAL, chase(COL, true));
    expect(events.some((e) => e.type === "podTaken")).toBe(true);
  });
});

describe("refusing one", () => {
  it("costs nothing when the maw never opens", () => {
    const { world, events } = run([husk], ARRIVAL, chase(COL, false));
    expect(events.some((e) => e.type === "huskRefused")).toBe(true);
    expect(events.some((e) => e.type === "podLost")).toBe(false);
    expect(failHolds(world)).toBe(false);
    expect(world.balance.husksRefused).toBe(1);
    expect(world.pods).toHaveLength(0);
  });

  it("costs nothing when the cannon is somewhere else", () => {
    const { world, events } = run([husk], ARRIVAL, chase(0, true));
    expect(events.some((e) => e.type === "huskRefused")).toBe(true);
    expect(failHolds(world)).toBe(false);
  });

  it("counts as a refusal when it crosses the field and leaves", () => {
    // A pod that got away is a wave lost; a husk that got away is the pair
    // letting a lie go past, which is what they were asked to do.
    const crossing: PodEntry = { ...husk, col: 0, cross: 1, speed: 4 };
    const { world, events } = run([crossing], TPB * 12, []);
    expect(events.some((e) => e.type === "huskRefused")).toBe(true);
    expect(events.some((e) => e.type === "podLost")).toBe(false);
    expect(world.pods).toHaveLength(0);
    expect(failHolds(world)).toBe(false);
  });
});

/**
 * Whether a spent wave with this one object left on it asks for the next one.
 * Placed by hand rather than authored, because the three rows below differ by
 * one field each and a wave that could put them on the field in the same order
 * would be three waves.
 */
function clearsWith(over: { loose: boolean; husk: boolean }): boolean {
  const world = createWorld({ ...STILL }, 0, [], []);
  world.pods.push({
    id: world.nextId++,
    colMilli: COL * MILLI,
    // The top of the field: over the beats below, one falling from here is
    // still in the air at the end of them.
    rowMilli: 0,
    driftMilli: 0,
    loose: over.loose,
    kind: "purge",
    husk: over.husk,
    crossMilli: 0,
  });
  const events: SimEvent[] = [];
  for (let t = 0; t < TPB * 4; t++) {
    step(world, []);
    events.push(...world.events);
  }
  return events.some((e) => e.type === "needWave");
}

describe("what a husk does to the end of the wave", () => {
  it("does not hold it open while it hangs, where a pod does", () => {
    // The right answer to a husk is to leave it exactly where it is, so a wave
    // that is otherwise finished is not kept open by one nobody touched.
    expect(clearsWith({ loose: false, husk: true })).toBe(true);
    expect(clearsWith({ loose: false, husk: false })).toBe(false);
  });

  it("holds it open once it is falling, so the clear does not race the maw", () => {
    // In the air it is about to cost the pair a wave or nothing, and a wave
    // cleared over the top of that would decide it with two counters.
    expect(clearsWith({ loose: true, husk: true })).toBe(false);
  });
});

describe("the run itself", () => {
  it("fingerprints the same twice, swallowed and refused alike", () => {
    for (const inputs of [chase(COL, true), chase(COL, false)]) {
      const a = run([husk], ARRIVAL, inputs);
      const b = run([husk], ARRIVAL, inputs);
      expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    }
  });

  it("fingerprints differently from a pod that differs in nothing else", () => {
    // **The flag itself is in the hash**, and this is the one pair of worlds
    // that proves it: nobody has touched either, nothing has been counted, and
    // the only field between them that is not equal is `husk`. A wave played
    // out would have diverged for a dozen other reasons by the end and said
    // nothing about the field (`hash-coverage.test.ts` holds the rule; this
    // holds the reason).
    const both = [true, false].map((flag) => {
      const world = createWorld({ ...STILL }, 0, [], []);
      world.pods.push({
        id: world.nextId++,
        colMilli: COL * MILLI,
        rowMilli: ROW * MILLI,
        driftMilli: 0,
        loose: false,
        kind: "purge",
        husk: flag,
        crossMilli: 0,
      });
      return hashWorld(world);
    });
    expect(both[0]).not.toBe(both[1]);
  });
});
