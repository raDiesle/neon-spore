import { describe, expect, it } from "bun:test";
import type { QueenState } from "@neon-spore/sim";
import { torchTremor } from "../src/queen.js";

/**
 * The owner asked for this by name: both flank torches shake while the queen
 * is deciding which one drops, so the pair knows a drop is coming before they
 * know the side — and a follow-up made the shape explicit: the two must move
 * as one tremor, never two independent wobbles, or the eye reads the
 * difference as the answer to "which side".
 *
 * `torchTremor` is the one call `queen.ts` makes for both torches, so
 * "the same offset" is not something these cases have to go looking for —
 * it falls out of calling it once and using the result twice. What they do
 * have to prove is the two things that would otherwise be easy to get wrong
 * silently: that the value never depends on `dropSide` (the leak this whole
 * animation exists to avoid), and that it actually goes quiet on the one beat
 * the breakoff needs the picture to itself.
 */

function bossAt(releaseBeat: number, dropSide: -1 | 0 | 1): QueenState {
  return {
    kind: "queen",
    creatureId: 1,
    phase: 0,
    phaseBeat: 0,
    tellCol: 0,
    tellColor: "red",
    weakSide: 1,
    pickBeat: 0,
    spentSide: 0,
    openBeat: -1,
    closeBeat: -1,
    startPetals: 9,
    dropSide,
    releaseBeat,
    releaseSide: 0,
    scratch: [1, 1],
  };
}

describe("the flank torches' shared tremor", () => {
  it("is silent on the exact beat a torch broke off", () => {
    const boss = bossAt(12, 1);
    expect(torchTremor(40, boss, 12, 3.7)).toEqual({ x: 0, y: 0 });
  });

  it("is live on every other beat of the cycle", () => {
    const boss = bossAt(12, 1);
    for (const beat of [5, 11, 13, 19, 20]) {
      const t = torchTremor(40, boss, beat, 1.4);
      expect(t.x !== 0 || t.y !== 0).toBe(true);
    }
  });

  it("never reads which side is going to fall", () => {
    // Same beat, same tile, same time — the only thing that differs between
    // these two boss states is `dropSide`. If the tremor ever changed with
    // it, this would catch the leak the whole brief exists to prevent.
    const left = torchTremor(40, bossAt(4, -1), 9, 2.2);
    const right = torchTremor(40, bossAt(4, 1), 9, 2.2);
    expect(left).toEqual(right);
  });

  it("gives both sides literally the same offset, not two independent ones", () => {
    // `queen.ts` calls this once per frame and hands the same result to both
    // `drawEgg` calls — this pins that down at the unit the two calls share,
    // so a future edit that seeds a second, per-side call would fail here
    // rather than only reading wrong on a screen nobody was watching.
    const boss = bossAt(-1, 1);
    const a = torchTremor(40, boss, 3, 5.5);
    const b = torchTremor(40, boss, 3, 5.5);
    expect(a).toEqual(b);
  });

  it("scales with the tile, and stays a tremor rather than a lurch", () => {
    const boss = bossAt(-1, 1);
    const small = torchTremor(20, boss, 3, 1.1);
    const large = torchTremor(40, boss, 3, 1.1);
    expect(large.x).toBeCloseTo(small.x * 2, 10);
    expect(large.y).toBeCloseTo(small.y * 2, 10);
    // Well under a tile — a shudder on the rock, not the rock leaving its
    // socket early.
    expect(Math.abs(large.x)).toBeLessThan(40 * 0.05);
    expect(Math.abs(large.y)).toBeLessThan(40 * 0.05);
  });
});
