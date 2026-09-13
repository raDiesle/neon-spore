import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  DIFFICULTY_BPM,
  difficultyOf,
  isDifficulty,
} from "../src/difficulty.js";

/**
 * **EASY, MEDIUM and HARD, and the one thing they move.**
 *
 * The owner asked for three difficulties that change *the falling speed of
 * everything*, and put today's game at Medium. Everything on this field falls a
 * tile a beat, so the falling speed is the beat and a level is one `bpm`.
 *
 * The rule worth a test is the one a person would not notice breaking: the
 * simulation counts in whole ticks, so a tempo that leaves a fraction of a tick
 * in a beat is a wave whose arrivals drift off the metronome — slowly, on both
 * devices, and differently.
 */

describe("the three levels", () => {
  it("leave Medium exactly where the game has always been", () => {
    expect(DEFAULT_DIFFICULTY).toBe("medium");
    expect(DIFFICULTY_BPM.medium).toBe(DEFAULT_CONFIG.bpm);
  });

  it("get harder in the order they are listed", () => {
    expect(DIFFICULTIES).toEqual(["easy", "medium", "hard"]);
    expect(DIFFICULTY_BPM.easy).toBeLessThan(DIFFICULTY_BPM.medium);
    expect(DIFFICULTY_BPM.hard).toBeGreaterThan(DIFFICULTY_BPM.medium);
  });

  it("are each a whole number of ticks to the beat", () => {
    for (const level of DIFFICULTIES) {
      const tpb = ticksPerBeat({ ...DEFAULT_CONFIG, bpm: DIFFICULTY_BPM[level] });
      expect(tpb, `${level} leaves a fraction of a tick in the beat`).toBe(Math.round(tpb));
      expect(tpb).toBeGreaterThan(0);
    }
  });

  it("are far enough apart to be felt", () => {
    // A setting nobody can tell from the one beside it is a setting that costs
    // a page and buys nothing.
    expect(DIFFICULTY_BPM.medium / DIFFICULTY_BPM.easy).toBeGreaterThan(1.1);
    expect(DIFFICULTY_BPM.hard / DIFFICULTY_BPM.medium).toBeGreaterThan(1.1);
  });
});

describe("reading one back", () => {
  it("knows the three and nothing else", () => {
    for (const level of DIFFICULTIES) expect(isDifficulty(level)).toBe(true);
    for (const other of ["", "MEDIUM", "brutal", 3, null, undefined]) {
      expect(isDifficulty(other)).toBe(false);
    }
  });

  it("names the level a tempo is, and nothing for a tempo that is none", () => {
    expect(difficultyOf(DIFFICULTY_BPM.hard)).toBe("hard");
    expect(difficultyOf(DEFAULT_CONFIG.bpm)).toBe("medium");
    // The director moves `bpm` on a slider and is allowed to be at none.
    expect(difficultyOf(97)).toBeNull();
  });
});
