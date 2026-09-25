import { describe, expect, test } from "bun:test";
import { AUTHORED_COLS, mapCol, queueFromWave, type Wave } from "../src/index.js";
import { mapColMilli } from "../src/queue.js";

/**
 * What `queueFromWave` carries across, and what it leaves behind. The
 * translation from a wave to a spawn queue is the one place an authored field
 * can be silently dropped: everything downstream type-checks perfectly against
 * a queue entry that never got told about it.
 */

const wave = (entries: Wave["entries"]): Wave => ({
  id: "test4",
  name: "T",
  entries,
});

describe("a rock's authored width", () => {
  test("arrives as the queue entry's span", () => {
    const q = queueFromWave(
      wave([{ beat: 0, col: 3, kind: "meteorFast", color: null, size: 2 }]),
      AUTHORED_COLS,
    );
    expect(q[0]?.span).toBe(2);
    expect(q[0]?.kind).toBe("meteorFast");
  });

  test("is absent when the wave did not ask for one, so `spanOf` answers for the kind", () => {
    const q = queueFromWave(
      wave([{ beat: 0, col: 3, kind: "meteor", color: null }]),
      AUTHORED_COLS,
    );
    expect(q[0]?.span).toBeUndefined();
  });
});

/**
 * THE SCOUT's arenas are the one thing authored *between* the columns, and
 * they had no test at all — which is how `mapColMilli` came to scale a length
 * by a column index's ratio. What that cost is in the function's own comment:
 * the scout was put down beside its mother ship rather than on it.
 *
 * Three places pin it, and they are the three an arena is written against: the
 * two walls, because the arena is as wide as the field, and the middle,
 * because `scoutHome` is there and every arena starts above it.
 */
describe("a place between the columns", () => {
  const cols = 11;

  test("sends the authored walls to the field's walls", () => {
    expect(mapColMilli(0, cols)).toBe(0);
    expect(mapColMilli(AUTHORED_COLS * 1000, cols)).toBe(cols * 1000);
  });

  test("sends the authored middle to the middle, which is where home is", () => {
    // `scoutHome`'s column, which `packages/sim/src/scout.ts` reads off the
    // field the same way: the middle of the span, not of the last column.
    expect(mapColMilli((AUTHORED_COLS * 1000) / 2, cols)).toBe(cols * 500);
  });

  /**
   * It is not `mapCol`'s ratio and must not become it again: the two agree
   * only at the middle, because one stretches a span and the other stretches
   * the *indices* 0..6 onto 0..`cols - 1`. A mote authored on the left-hand
   * wall is on the left-hand wall; column 0 is half a tile in from it.
   */
  test("keeps a pair of authored places symmetric about the middle", () => {
    const middle = (AUTHORED_COLS * 1000) / 2;
    for (const offset of [500, 1_500, 2_000, 3_500]) {
      const left = mapColMilli(middle - offset, cols);
      const right = mapColMilli(middle + offset, cols);
      expect(cols * 500 - left).toBe(right - cols * 500);
    }
    expect(mapColMilli(500, cols)).not.toBe(mapCol(0, cols) * 1000 + 500);
  });
});
