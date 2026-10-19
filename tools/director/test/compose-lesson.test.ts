import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { composeBlock } from "../src/compose.js";
import { hasWaves, lessonsAfterBlocks, nextLesson } from "../src/compose-lesson.js";
import { isLesson } from "../src/compose-starts.js";
import { BLOCK_STEPS, TUTORIAL_LAST_ID } from "../src/compose-steps.js";

const finale = WAVES.findIndex((w) => w.id === TUTORIAL_LAST_ID);
const lessons = WAVES.flatMap((_w, i) => (i > finale && isLesson(WAVES, i) ? [i] : []));

describe("lesson blocks (wave-curriculum §4)", () => {
  test("every lesson after the arc has its wave", () => {
    expect(lessons.length).toBeGreaterThan(5);
    for (const at of lessons) {
      expect({ lesson: WAVES[at]?.id, has: hasWaves(WAVES, at) }).toEqual({
        lesson: WAVES[at]?.id,
        has: true,
      });
    }
    expect(nextLesson(WAVES)).toBe("every lesson has its waves");
  });

  test("the lessons stand where `waves:lessons` puts them: a second run moves nothing", () => {
    expect(lessonsAfterBlocks(WAVES).map((w) => w.id)).toEqual(WAVES.map((w) => w.id));
  });

  test("a wave written for a lesson is its one, and without it one is composed", () => {
    // THE TWINS, the set piece the owner kept of THE LANCE's five (19 October
    // 2026), stands where the composed wave would.
    const lance = WAVES.findIndex((w) => w.id === "theLance");
    expect(WAVES[lance + 1]?.id).toBe("theTwins");
    expect(hasWaves(WAVES, lance)).toBe(true);
    const bare = WAVES.filter((w) => w.id !== "theTwins");
    expect(hasWaves(bare, lance)).toBe(false);
    const next = nextLesson(bare);
    if (typeof next === "string") throw new Error(next);
    expect(next.prefix).toBe("theLance");
    expect(next.block.lesson).toBe(true);
    const composed = composeBlock(bare, next.block, next.prefix);
    expect(composed.flatMap((c) => c.faults)).toEqual([]);
    expect(composed.length).toBe(BLOCK_STEPS.length);
  });
});
