import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
  hullRow,
  morselIsLimp,
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
 * THE MORSEL: shoot it once, then swallow it.
 *
 * Two halves and each is tested on its own, because failing either has to
 * feel different: the shot that turns it rather than kills it, and the maw
 * that finishes it — or a limp one nobody swallowed, which loses the wave
 * exactly as a pod does (`sim/morsel.ts`).
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

const morsel = (col: number): SpawnEntry => ({ beat: 0, col, kind: "morsel", color: "red" });
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
const SHOT: TimedCommand[] = [aim(2, 3), fire(TPB * 2 + 4)];

/** The maw held open the whole way down, so timing is not what is measured. */
function mawHeld(): TimedCommand[] {
  const out: TimedCommand[] = [];
  for (let t = TPB * 3; t < FALL; t += 20) out.push(intake(t));
  return out;
}

const body = (r: Run) => r.world.creatures.find((c) => c.kind === "morsel");

describe("the shot", () => {
  it("in its colour turns it limp rather than killing it", () => {
    const r = run([morsel(3)], TPB * 4, SHOT);
    expect(r.events.some((e) => e.type === "morselLimp")).toBe(true);
    expect(r.events.some((e) => e.type === "destroy")).toBe(false);
    const m = body(r);
    expect(m).toBeDefined();
    expect(morselIsLimp(m!)).toBe(true);
  });

  it("in the other colour is a miss and leaves it whole", () => {
    const r = run([morsel(3)], TPB * 4, [aim(2, 3), fire(TPB * 2 + 4, "cyan")]);
    expect(r.events.some((e) => e.type === "morselLimp")).toBe(false);
    expect(morselIsLimp(body(r)!)).toBe(false);
  });

  it("a second shot is spent on a limp one, and changes nothing", () => {
    const r = run([morsel(3)], TPB * 6, [...SHOT, fire(TPB * 4 + 4)]);
    expect(r.events.filter((e) => e.type === "morselLimp")).toHaveLength(1);
    expect(r.events.some((e) => e.type === "reject")).toBe(true);
    expect(morselIsLimp(body(r)!)).toBe(true);
  });
});

describe("the maw", () => {
  it("takes a limp one in, and the wave is not lost", () => {
    const r = run([morsel(3)], FALL, [...SHOT, ...mawHeld()]);
    expect(r.events.some((e) => e.type === "podTaken")).toBe(true);
    expect(body(r)).toBeUndefined();
    expect(failHolds(r.world)).toBe(false);
  });

  it("takes one that lands two columns from the cannon", () => {
    // Shot from column 3, then the cannon steps two over before the steer
    // could reach: the maw's own reach either side does it (`podCatchCols`).
    const r = run([morsel(3)], FALL, [...SHOT, aim(TPB * 3, 5), ...mawHeld()]);
    expect(r.events.some((e) => e.type === "podTaken")).toBe(true);
  });

  it("loses the wave on a limp one nobody swallows, with no scar", () => {
    const r = run([morsel(3)], FALL, SHOT);
    expect(r.events.some((e) => e.type === "podLost")).toBe(true);
    expect(failHolds(r.world)).toBe(true);
    expect(r.world.scars).toHaveLength(0);
  });

  it("does not take one nobody shot: whole, it breaks the hull like a slick", () => {
    const r = run([morsel(3)], FALL, [aim(2, 3), ...mawHeld()]);
    expect(r.events.some((e) => e.type === "podTaken")).toBe(false);
    expect(r.events.some((e) => e.type === "breach")).toBe(true);
  });
});

describe("a morsel wave replays", () => {
  it("runs the same twice", () => {
    const replay = record({
      name: "one shot limp and swallowed, one left whole",
      seed: 3,
      queue: [morsel(3), { beat: 2, col: 6, kind: "morsel", color: "cyan" }],
      ticks: FALL,
      inputs: [...SHOT, ...mawHeld()],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(hashWorld(runReplay(replay))).toBe(hashWorld(runReplay(replay)));
  });
});
