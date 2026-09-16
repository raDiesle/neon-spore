import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
  hullRow,
  moultBeatsToTurn,
  moultIsPod,
  moultNextIsPod,
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
 * THE MOULT: one body wearing both ends of the game by turns.
 *
 * Every other creature's test asks *did the pair answer it*. This one has to
 * ask something before that — **what was it when it landed** — because the
 * answer that is right on the beat it was agreed is wrong five beats later.
 * So the file is in two halves: the turn itself, which is arithmetic off the
 * wave's own beat and nothing else, and then the same fall answered four ways.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: false };
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);

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

const moult = (beat: number, col: number, cargo: "purge" | "ward" = "ward"): SpawnEntry => ({
  beat,
  col,
  kind: "moult",
  color: null,
  cargo,
});

const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const intake = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "intake" },
});
const guard = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "guard" },
});
const shieldAt = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});

/** Every tick of the fall, so an arrival can be answered on the beat it lands
 * rather than on a beat guessed at from the entry. */
function landingTick(queue: SpawnEntry[], ticks: number): number {
  const world = createWorld({ ...CFG }, 0, queue);
  let arrived = false;
  for (let t = 0; t < ticks; t++) {
    step(world, []);
    if (world.creatures.length > 0) arrived = true;
    else if (arrived) return t;
  }
  throw new Error("nothing landed");
}

describe("the turn", () => {
  it("wears the rock first and then the cargo, for moultBeats each, all the way down", () => {
    const worn = Array.from({ length: 16 }, (_, beat) => (moultIsPod(CFG, beat) ? "pod" : "rock"));
    expect(worn).toEqual([
      // Beats 0–4: the half a pair coming off any other wave already knows.
      "rock",
      "rock",
      "rock",
      "rock",
      "rock",
      "pod",
      "pod",
      "pod",
      "pod",
      "pod",
      "rock",
      "rock",
      "rock",
      "rock",
      "rock",
      "pod",
    ]);
  });

  it("counts the beats to the turn and never counts zero", () => {
    const left = Array.from({ length: 11 }, (_, beat) => moultBeatsToTurn(CFG, beat));
    // On the beat it turns, a whole period is left: what is standing there has
    // just arrived and has the full cycle to run.
    expect(left).toEqual([5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5]);
    expect(left.every((n) => n > 0)).toBe(true);
  });

  it("says what is coming, which is always the other one", () => {
    for (let beat = 0; beat < 12; beat++) {
      expect(moultNextIsPod(CFG, beat)).toBe(!moultIsPod(CFG, beat));
    }
  });

  it("reads the wave's own clock, so an entry beat is an answer", () => {
    // The wave author's whole lever: two entries a beat apart in the same
    // column land as different things, and nothing about where in the run the
    // wave started can change that.
    // A body takes sixteen beats from its entry beat to the ship, so an entry
    // on beat 3 is resolved on beat 19 — inside a cargo stretch — and one on
    // beat 4 is resolved on beat 20, which is the stone again.
    const early = run([moult(3, 3)], TPB * 24);
    const late = run([moult(4, 3)], TPB * 24);
    expect(early.events.some((e) => e.type === "podLost")).toBe(true);
    expect(late.events.some((e) => e.type === "breach")).toBe(true);
  });
});

describe("a shot", () => {
  it("craters the rock half and kills nothing", () => {
    const fall = [moult(0, 3)];
    const fire: TimedCommand[] = [
      aim(2, 3),
      { tick: TPB * 2, player: 2, command: { kind: "fire", color: "red" } },
      { tick: TPB * 3, player: 2, command: { kind: "fire", color: "cyan" } },
    ];
    const { world, events } = run(fall, TPB * 6, fire);
    expect(events.some((e) => e.type === "hole")).toBe(true);
    expect(world.creatures.filter((c) => c.kind === "moult")).toHaveLength(1);
    expect(world.creatures.find((c) => c.kind === "moult")?.holes).toBeGreaterThan(0);
  });

  it("is spent on the cargo half and kills nothing", () => {
    // Entering on beat 1 puts the body in its cargo stretch by beat 6.
    const fire: TimedCommand[] = [
      aim(2, 3),
      { tick: TPB * 7, player: 2, command: { kind: "fire", color: "red" } },
    ];
    const { world, events } = run([moult(1, 3)], TPB * 9, fire);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(events.some((e) => e.type === "hole")).toBe(false);
    expect(world.creatures.filter((c) => c.kind === "moult")).toHaveLength(1);
  });
});

describe("what it landed as", () => {
  it("is turned by the dome when it lands a rock", () => {
    const fall = [moult(4, 3)];
    const at = landingTick(fall, TPB * 28);
    // The cannon is parked in the body's own column as well as the dome: the
    // steer at the bottom is toward the cannon whatever the body is wearing,
    // so a shield left somewhere the cannon is not is a shield the rock half
    // walks out from under.
    const { world, events } = run(fall, at + 2, [aim(2, 3), shieldAt(2, 3), guard(at - 2)]);
    expect(events.some((e) => e.type === "breach")).toBe(false);
    expect(failHolds(world)).toBe(false);
  });

  it("breaks the hull when it lands a rock and nobody triggered the dome", () => {
    const { world, events } = run([moult(4, 3)], TPB * 24, [aim(2, 3), shieldAt(2, 3)]);
    expect(events.some((e) => e.type === "breach")).toBe(true);
    expect(failHolds(world)).toBe(true);
  });

  it("is swallowed when it lands a cargo over an open maw", () => {
    const fall = [moult(0, 3)];
    const at = landingTick(fall, TPB * 24);
    const { world, events } = run(fall, at + 2, [aim(2, 3), intake(at - 4)]);
    expect(events.some((e) => e.type === "podTaken")).toBe(true);
    expect(failHolds(world)).toBe(false);
  });

  it("loses the wave when it lands a cargo and the mouth is shut", () => {
    const { world, events } = run([moult(0, 3)], TPB * 24, [aim(2, 3)]);
    expect(events.some((e) => e.type === "podLost")).toBe(true);
    expect(failHolds(world)).toBe(true);
  });
});

describe("the last two rows", () => {
  it("steer it into whatever column the cannon is holding", () => {
    // Painted two columns off the cannon, so the steer has to do real work and
    // the catch is the pilot standing still rather than tracking.
    const fall = [moult(0, 3)];
    const at = landingTick(fall, TPB * 24);
    const { world, events } = run(fall, at + 2, [aim(2, 5), intake(at - 4)]);
    expect(events.some((e) => e.type === "podTaken")).toBe(true);
    expect(failHolds(world)).toBe(false);
    // And it really was the body that moved: the cannon never left column 5.
    expect(world.cannonCol).toBe(5);
  });

  it("leaves it where it was painted until then", () => {
    const world = createWorld({ ...CFG }, 0, [moult(1, 3)]);
    for (let t = 0; t < TPB * 6; t++)
      step(world, [{ tick: t, player: 1, command: { kind: "cannonCol", col: 8 } }]);
    const body = world.creatures.find((c) => c.kind === "moult");
    expect(body).toBeDefined();
    expect(HULL - (body?.row ?? 0)).toBeGreaterThan(CFG.podHomeTiles);
    expect(body?.col).toBe(3);
  });
});

describe("a moult wave replays", () => {
  it("runs the same twice: two runs of one script agree tick for tick", () => {
    const replay = record({
      name: "one landing a rock into the dome, one landing a cargo into the mouth",
      seed: 5,
      queue: [moult(0, 3), moult(1, 5, "purge")],
      ticks: TPB * 20,
      inputs: [shieldAt(2, 3), aim(4, 5), guard(TPB * 14 - 2), intake(TPB * 15 + 4)],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(hashWorld(runReplay(replay))).toBe(hashWorld(runReplay(replay)));
  });
});
