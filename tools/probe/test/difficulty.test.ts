import { describe, expect, it } from "bun:test";
import { step } from "@neon-spore/sim";
import { pace, table } from "../difficulty.js";
import { playedAt, playedBeat, pressGate, waveWorld } from "../world.js";

/**
 * The throttle a boss's difficulty is measured with (`bun run
 * waves:difficulty`). The bug it was written after: a scratch copy throttled
 * on the command's kind rather than the press's seat, so the two seats shared
 * one gap and every seed came out the same.
 */
describe("a press gate", () => {
  it("lets one press per seat through, and each seat has its own gap", () => {
    const world = waveWorld("theStrand");
    const lets = pressGate(world, 1);
    expect(lets(1)).toBe(true);
    expect(lets(1)).toBe(false);
    // Player 1's press started player 1's gap, not player 2's.
    expect(lets(2)).toBe(true);
    expect(lets(2)).toBe(false);
  });

  it("opens again a whole gap later, and not a tick before", () => {
    const world = waveWorld("theStrand");
    const lets = pressGate(world, 1);
    lets(1);
    for (let t = 1; t < world.cfg.tickHz; t++) {
      step(world, []);
      expect(lets(1)).toBe(false);
    }
    step(world, []);
    expect(lets(1)).toBe(true);
  });

  it("is the same gap across beats of one world", () => {
    const world = waveWorld("theStrand");
    pressGate(world, 1)(1);
    expect(pressGate(world, 1)(1)).toBe(false);
  });
});

describe("a wave played at a human's pace", () => {
  it("is the same world AUTO plays at full speed when the gap is nothing", () => {
    const fast = waveWorld("theStrand");
    const paced = waveWorld("theStrand");
    for (let b = 0; b < 12; b++) {
      playedBeat(fast);
      playedAt(paced, 0);
    }
    expect(paced.creatures.map((c) => c.id)).toEqual(fast.creatures.map((c) => c.id));
  });

  it("is a table line per pace, with THE BROOD's own counts", () => {
    const row = pace("theBrood", 1, 1);
    expect(row.cleared + row.lost).toBeLessThanOrEqual(1);
    expect(row.laid).not.toBeNull();
    expect(table("theBrood", [row])).toContain("one press per 1s: cleared");
    expect(pace("theStrand", 1, 1).laid).toBeNull();
  });
});
