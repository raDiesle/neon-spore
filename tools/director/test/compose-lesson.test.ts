import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { hasWaves, lessonsAfterBlocks, nextLesson } from "../src/compose-lesson.js";
import { isLesson } from "../src/compose-starts.js";
import { TUTORIAL_LAST_ID } from "../src/compose-steps.js";

const finale = WAVES.findIndex((w) => w.id === TUTORIAL_LAST_ID);
const lessons = WAVES.flatMap((_w, i) => (i > finale && isLesson(WAVES, i) ? [i] : []));

describe("lesson blocks (wave-curriculum §4)", () => {
  test("every lesson after the arc has its eight waves", () => {
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
});
