import { describe, expect, it } from "bun:test";
import { hashWorld, type Replay, runReplay } from "../src/index.js";

/**
 * The most important test in the project. If determinism breaks, lockstep
 * breaks, and every replay test above it becomes meaningless.
 * A hook runs this after every change inside packages/sim.
 */
const replay: Replay = {
  name: "mixed wave, both players busy",
  seed: 7,
  ticks: 1800,
  queue: [
    { beat: 0, col: 2, kind: "slick", color: "red" },
    { beat: 3, col: 4, kind: "bulb", color: "cyan" },
    { beat: 6, col: 5, kind: "meteor", color: null },
    { beat: 9, col: 1, kind: "slick", color: "cyan" },
  ],
  // One pod, shot loose at tick 740 below. Its sideways drift is the only draw
  // from the rng once a wave is running, so the fingerprint has to cover it.
  podQueues: [[{ beat: 1, col: 3, row: 4 }]],
  inputs: [
    { tick: 10, player: 1, command: { kind: "cannonCol", col: 2 } },
    { tick: 40, player: 2, command: { kind: "fire", color: "red" } },
    { tick: 300, player: 1, command: { kind: "cannonCol", col: 4 } },
    { tick: 340, player: 2, command: { kind: "fire", color: "cyan" } },
    { tick: 600, player: 2, command: { kind: "shieldCol", col: 5 } },
    { tick: 700, player: 1, command: { kind: "cannonCol", col: 3 } },
    { tick: 740, player: 2, command: { kind: "fire", color: "red" } },
    { tick: 1120, player: 1, command: { kind: "guard" } },
    { tick: 1400, player: 1, command: { kind: "cannonCol", col: 1 } },
    { tick: 1430, player: 2, command: { kind: "fire", color: "cyan" } },
    { tick: 1500, player: 1, command: { kind: "intake" } },
  ],
};

describe("determinism", () => {
  it("produces the same fingerprint twice", () => {
    expect(hashWorld(runReplay(replay))).toBe(hashWorld(runReplay(replay)));
  });

  it("produces the same fingerprint when ticks are replayed in one go", () => {
    const a = runReplay(replay);
    const b = runReplay({ ...replay, inputs: [...replay.inputs].reverse() });
    // Command order within a tick must not matter for these commands.
    expect(hashWorld(a)).toBe(hashWorld(b));
  });

  it("diverges when the seed changes", () => {
    const a = hashWorld(runReplay(replay));
    const b = hashWorld(runReplay({ ...replay, seed: 8, inputs: [...replay.inputs] }));
    expect(a).not.toBe(b);
  });
});
