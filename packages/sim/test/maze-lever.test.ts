import { expect, test } from "bun:test";
import { DEFAULT_CONFIG } from "../src/config.js";
import { MAZE_TURN, mazeDragTurn, mazeLeverRadiusMilli, mazeRadiusMilli } from "../src/maze.js";

/**
 * THE MAZE's lever is geared one turn a lap (the owner, 27 September 2026):
 * a hand that goes once round the ring turns the drum once, so the knob stays
 * on the gap it was put on. The gearing is derived from the ring, so these
 * hold at any field width rather than at the one it was tuned on.
 */

/** The ring's circumference in thousandths of a tile, as a hand travels it. */
function lap(cols: number): number {
  return Math.round(2 * Math.PI * mazeLeverRadiusMilli({ ...DEFAULT_CONFIG, cols }));
}

for (const cols of [DEFAULT_CONFIG.cols, 7, 15]) {
  test(`one lap of the lever's ring is one turn of the drum, ${cols} columns wide`, () => {
    const cfg = { ...DEFAULT_CONFIG, cols };
    // Within a tenth of a degree: `2π` is carried in thousandths.
    expect(Math.abs(mazeDragTurn(cfg, lap(cols)) - MAZE_TURN)).toBeLessThan(100);
    expect(Math.abs(mazeDragTurn(cfg, -lap(cols)) + MAZE_TURN)).toBeLessThan(100);
  });
}

test("the ring stands outside the rim, by the lever's own reach", () => {
  expect(mazeLeverRadiusMilli(DEFAULT_CONFIG)).toBe(
    mazeRadiusMilli(DEFAULT_CONFIG) + DEFAULT_CONFIG.mazeLeverOutMilli,
  );
});

test("the gearing is whole thousandths, and no hand travel is no turn", () => {
  expect(mazeDragTurn(DEFAULT_CONFIG, 0)).toBe(0);
  for (const moved of [1, 37, 100, 999, 12_345]) {
    expect(Number.isInteger(mazeDragTurn(DEFAULT_CONFIG, moved))).toBe(true);
  }
});
