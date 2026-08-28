import { describe, expect, it } from "bun:test";
import type { QueenState } from "@neon-spore/sim";
import { hullShake, QUEEN_SHUDDER_HZ, TORCH_TREMOR_HZ, torchTremor } from "../src/queen.js";

/**
 * The owner's complaint was that the torches read as spinning rather than
 * shaking — `TORCH_TREMOR_HZ` was fast enough (47 and 61 radians a second,
 * 7.5 Hz and 9.7 Hz) to blur into a disc. These cases pin the slower pair
 * down so a future tuning pass cannot drift it back toward a buzz without
 * failing here first, and pin the two things the brief calls out as easy to
 * lose while slowing it down: the pair stays mismatched, and the queen's own
 * hit-shudder keeps its own separate pair rather than converging on the
 * torch's.
 */
describe("the torch tremor's rate", () => {
  it("is well under the old buzz — under 20 rad/s, not 47 and 61", () => {
    for (const hz of TORCH_TREMOR_HZ) {
      expect(Math.abs(hz)).toBeLessThan(20);
    }
  });

  it("keeps its two frequencies mismatched and unequal", () => {
    const [a, b] = TORCH_TREMOR_HZ;
    expect(a).not.toBe(b);
    // A ratio near a small integer (1:2, 2:3, ...) is the slow-orbit failure
    // the mismatch exists to avoid — neither is within a tenth of one.
    expect(Math.abs(a / b - Math.round(a / b))).toBeGreaterThan(0.1);
  });

  it("stays its own pair, separate from the queen's own shudder", () => {
    expect(TORCH_TREMOR_HZ[0]).not.toBe(QUEEN_SHUDDER_HZ[0]);
    expect(TORCH_TREMOR_HZ[1]).not.toBe(QUEEN_SHUDDER_HZ[1]);
  });
});

describe("the queen's own hit-shudder rate", () => {
  it("is also slowed — under 20 rad/s, not 40 and 53", () => {
    for (const hz of QUEEN_SHUDDER_HZ) {
      expect(Math.abs(hz)).toBeLessThan(20);
    }
  });

  it("keeps its two frequencies mismatched and unequal", () => {
    const [a, b] = QUEEN_SHUDDER_HZ;
    expect(a).not.toBe(b);
    expect(Math.abs(a / b - Math.round(a / b))).toBeGreaterThan(0.1);
  });
});

function bossAt(releaseBeat: number): QueenState {
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
    dropSide: 1,
    releaseBeat,
    releaseSide: 0,
    scratch: [1, 1],
  };
}

/**
 * `hullShake` is the signal the owner asked for by name: the ship shaking
 * "related to the shaking of the meteors" rather than a screen shake wired up
 * on its own account. These cases pin it to what the brief requires that
 * relationship to mean — a fixed fraction of `torchTremor`'s own amplitude,
 * silent on exactly the beat `torchTremor` is, and never a source of motion
 * `torchTremor` did not already have.
 */
describe("the hull's shake, echoing the torch tremor", () => {
  it("is silent when the tremor it echoes is", () => {
    const boss = bossAt(12);
    const tremor = torchTremor(40, boss, 12, 3.7);
    expect(hullShake(tremor)).toEqual({ x: 0, y: 0 });
  });

  it("is a fixed fraction of the torch tremor's own amplitude", () => {
    const boss = bossAt(-1);
    const tremor = torchTremor(40, boss, 6, 2.1);
    const shake = hullShake(tremor);
    const shareX = shake.x / tremor.x;
    const shareY = shake.y / tremor.y;
    expect(shareX).toBeCloseTo(shareY, 10);
    // Strictly smaller: the ship echoes the torches, it does not match them.
    expect(Math.abs(shareX)).toBeLessThan(1);
    expect(Math.abs(shareX)).toBeGreaterThan(0);
  });

  it("never reads which side is going to fall, because the tremor it echoes never does", () => {
    const left = hullShake(torchTremor(40, { ...bossAt(4), dropSide: -1 }, 9, 2.2));
    const right = hullShake(torchTremor(40, { ...bossAt(4), dropSide: 1 }, 9, 2.2));
    expect(left).toEqual(right);
  });
});
