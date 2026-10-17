import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { composeBlock } from "../src/compose.js";
import { hasWaves, lessonsAfterBlocks, nextLesson } from "../src/compose-lesson.js";
import { isLesson } from "../src/compose-starts.js";
import { BLOCK_STEPS, TUTORIAL_LAST_ID } from "../src/compose-steps.js";

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

  test("a lesson's waves are not capped by the written ones after them", () => {
    // THE CAGE (3.2) stands after THE LANCE's five; read as the ramp's next
    // wave it held R8 under 3.2 and `waves:order` stopped (16 October 2026).
    const lance = WAVES.findIndex((w) => w.id === "theLance");
    const own = (w: { id: string; variant?: boolean }) =>
      w.variant === true && w.id.startsWith("theLance") && w.id !== "theLance";
    const bare = WAVES.filter((w) => !own(w));
    expect(WAVES[lance + 1 + BLOCK_STEPS.length]?.id).toBe("theCage");
    const next = nextLesson(bare);
    if (typeof next === "string") throw new Error(next);
    expect(next.prefix).toBe("theLance");
    expect(next.block.lesson).toBe(true);
    const composed = composeBlock(bare, next.block, next.prefix);
    expect(composed.flatMap((c) => c.faults)).toEqual([]);
    expect(composed.length).toBe(BLOCK_STEPS.length);
  });
});
