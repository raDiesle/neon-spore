import { describe, expect, test } from "bun:test";
import { AUTHORED_COLS, queueFromWave, type Wave } from "../src/index.js";

/**
 * What `queueFromWave` carries across, and what it leaves behind. The
 * translation from a wave to a spawn queue is the one place an authored field
 * can be silently dropped: everything downstream type-checks perfectly against
 * a queue entry that never got told about it.
 */

const wave = (entries: Wave["entries"]): Wave => ({ name: "T", sentence: "t", entries });

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
