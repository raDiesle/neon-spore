import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SpliceState,
  spliceWanted,
  startWave,
} from "@neon-spore/sim";
import { spliceEaterTarget } from "../src/splice-eater.js";

/**
 * THE SPLICE's eater snaps at the number **nearest to it**, never at the one
 * the pair owes next (the owner, 25 September 2026): a tongue that pointed at
 * the answer would be the picture saying it. It lives in the right-hand wall,
 * so the nearest is the top end furthest right still to be had.
 */

function splice(seed: number, straws: number): SpliceState {
  const world = createWorld(DEFAULT_CONFIG, seed);
  const rounds = Array.from({ length: straws - 1 }, () => ({ beats: 40 }));
  startWave(world, 3, [], [], { kind: "splice", rounds });
  const s = world.boss;
  if (s === null || s.kind !== "splice") throw new Error("no splice installed");
  return s;
}

function rightmost(s: SpliceState, skip: (e: number) => boolean): number {
  let best = -1;
  for (let e = 0; e < s.entranceCols.length; e++) {
    if (skip(e)) continue;
    if (best === -1 || (s.topCols[s.topOf[e] ?? 0] ?? 0) > (s.topCols[s.topOf[best] ?? 0] ?? 0)) {
      best = e;
    }
  }
  return best;
}

describe("THE SPLICE's eater", () => {
  it("goes for the top end nearest its wall, whatever the order says", () => {
    let differed = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const s = splice(seed, 2);
      expect(spliceEaterTarget(s)).toBe(rightmost(s, () => false));
      if (spliceEaterTarget(s) !== spliceWanted(s)) differed++;
    }
    expect(differed, "the eater always pointed at the answer").toBeGreaterThan(0);
  });

  it("leaves alone a number already fed or on its way down", () => {
    const s = splice(3, 2);
    const first = spliceEaterTarget(s);
    s.flights = [{ straw: first, beat: 0 }];
    expect(spliceEaterTarget(s)).not.toBe(first);
    s.flights = [];
    s.fed = s.topOf.length;
    expect(spliceEaterTarget(s), "nothing is left to eat").toBe(-1);
  });
});
