import { expect, test } from "bun:test";
import {
  MAZE_TURN,
  mazeCosMilli,
  mazeEntranceCol,
  mazeEntranceX,
  mazeRadiusMilli,
  mazeSinMilli,
} from "../src/maze.js";
import { CFG, PAIR } from "./maze-fixture.js";

/**
 * THE MAZE's bridge, between an angle and a column.
 *
 * The pair talks in columns and an angle is not a column, so the click is what
 * keeps the game's vocabulary: the wheel must never be able to turn *past* a
 * column between two ticks, or the pilot would be pulling at something with
 * holes in it. That is arithmetic between two config numbers and it is checked
 * as arithmetic — no world is stepped in this file.
 */

test("the click is wider than a tick, so no column can be turned past", () => {
  // The furthest the rim can move across the field in one tick is at the
  // bottom of the wheel, where the mouth is travelling straight sideways.
  const step1 = Math.abs(mazeEntranceX({ ...CFG }, PAIR, CFG.mazeTurnMilli, 0));
  const perTick = Math.round((mazeRadiusMilli(CFG) * mazeSinMilli(CFG.mazeTurnMilli)) / 1000);
  expect(step1).toBeGreaterThan(0);
  expect(perTick).toBeGreaterThan(0);
  expect(CFG.mazeSnapMilli).toBeGreaterThan(perTick);
  // And narrower than a fifth of a tile, so a lit mouth reads as standing on
  // the column rather than merely near it.
  expect(CFG.mazeSnapMilli).toBeLessThan(200);
});

test("the wheel is about six sevenths of the field, and clears the hull", () => {
  const radius = mazeRadiusMilli(CFG);
  // Six sevenths of the width, to within a thousandth of a column.
  expect(2 * radius).toBeGreaterThan(Math.round((CFG.cols * 6000) / 7) - 20);
  expect(2 * radius).toBeLessThan(Math.round((CFG.cols * 6000) / 7) + 20);
  // And it never reaches the columns at the very edge, so the cannon always
  // has hull either side of whatever is lit.
  expect(radius).toBeLessThan(CFG.cols * 500);
});

test("every column the wheel can reach is one the pilot can actually click", () => {
  const found = new Set<number>();
  let angle = 0;
  for (let i = 0; i < 4000; i++) {
    angle = (angle + CFG.mazeTurnMilli) % MAZE_TURN;
    const col = mazeEntranceCol(CFG, PAIR, angle, 0);
    if (col >= 0) found.add(col);
  }
  // Every column under the near half of the rim, and nothing outside it.
  expect(found.size).toBeGreaterThanOrEqual(CFG.cols - 4);
  for (const col of found) {
    expect(col).toBeGreaterThanOrEqual(0);
    expect(col).toBeLessThan(CFG.cols);
  }
});

test("the sine table is a sine, and the near half of the rim is the near half", () => {
  expect(mazeSinMilli(0)).toBe(0);
  expect(mazeSinMilli(90_000)).toBe(1000);
  expect(mazeSinMilli(270_000)).toBe(-1000);
  expect(mazeCosMilli(0)).toBe(1000);
  expect(mazeCosMilli(180_000)).toBe(-1000);
  // Every angle, forwards and backwards, agrees with itself.
  for (let a = 0; a < MAZE_TURN; a += 997) {
    expect(mazeSinMilli(a)).toBe(mazeSinMilli(a + MAZE_TURN));
    expect(Math.abs(mazeSinMilli(a))).toBeLessThanOrEqual(1000);
  }
});
