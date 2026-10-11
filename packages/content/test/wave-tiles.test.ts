import { describe, expect, test } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import {
  bossFromWave,
  canTakeEveryTile,
  mapCol,
  onEveryTile,
  podsFromWave,
  queueFromWave,
  WAVES,
  waveCols,
} from "../src/index.js";

const COLS = DEFAULT_CONFIG.cols;

describe("a wave on every tile", () => {
  test("a wave counted on the field's own columns lands on them unmoved", () => {
    for (let c = 0; c < COLS; c++) expect(mapCol(c, COLS, COLS)).toBe(c);
  });

  test("seven columns reach seven tiles, so four were out of reach", () => {
    const reached = new Set(Array.from({ length: 7 }, (_, c) => mapCol(c, COLS)));
    expect(reached.size).toBe(7);
    expect(COLS - reached.size).toBe(4);
  });

  test("moving a wave onto every tile plays exactly as it did", () => {
    for (const wave of WAVES) {
      if (!canTakeEveryTile(wave)) continue;
      const moved = onEveryTile(wave, COLS);
      expect(waveCols(moved)).toBe(COLS);
      expect(queueFromWave(moved, COLS)).toEqual(queueFromWave(wave, COLS));
      expect(podsFromWave(moved, COLS)).toEqual(podsFromWave(wave, COLS));
      expect(bossFromWave(moved, COLS)).toEqual(bossFromWave(wave, COLS));
    }
  });

  test("a wave already on every tile is left alone", () => {
    const wave = onEveryTile(WAVES[0]!, COLS);
    expect(onEveryTile(wave, COLS)).toBe(wave);
  });
});
