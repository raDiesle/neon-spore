import { controlSet, isRegularWave, type Wave } from "@neon-spore/content";
import { type Block, placeable, readBlock } from "./compose-block.js";
import {
  blocksBefore,
  gentlestBefore,
  isLesson,
  isReviewHead,
  startsBlock,
} from "./compose-starts.js";
import { TUTORIAL_LAST_ID } from "./compose-steps.js";

/**
 * **A lesson's block**: eight regular waves after a wave that teaches a panel
 * or a fault — THE LANCE, THE JAM, THE CHOKE, THE CLAW, THE DARK. The owner,
 * 15 October 2026: *there are a lot of waves introducing new concepts or
 * enemies, which then should have waves.* An intro that brings a body has its
 * eight; a lesson had none, and sat between a block's waves and its boss or
 * in front of the next block's.
 *
 * Two things, in order. **The lessons move** (`lessonsAfterBlocks`): each,
 * with the guided waves that follow it (THE PURGE after THE LANCE), goes
 * after the regular waves of the block it stood in, so a block reads intro,
 * its eight, then the lessons — and each lesson opens a block of its own.
 * Then **each lesson gets its eight** (`nextLesson`): composed from the
 * bodies of the block it follows, as a review block is, on the lesson's
 * panel, every wave carrying the lesson's faults that fall inside it.
 */

/** A lesson's step names, from its one word: at most 20 letters for every
 * lesson the game has (`compose-lesson.test.ts`). */
export const LESSON_NAMES: readonly ((word: string) => string)[] = [
  (w) => `${w} AGAIN`,
  (w) => `${w} WIDE`,
  (w) => `${w} AT THE EDGE`,
  (w) => `${w} IN PAIRS`,
  (w) => `${w} AT EASE`,
  (w) => `${w} RECALLED`,
  (w) => `${w} TWICE`,
  (w) => `${w} PEAK`,
];

/** A lesson's one word: THE JAM is JAM. */
export const lessonWord = (wave: Wave): string => wave.name.replace(/^THE /, "");

/** Where a lesson's own waves would start: past it and the guided waves
 * after it (THE PURGE after THE LANCE). */
function pastGuides(waves: readonly Wave[], at: number): number {
  let i = at + 1;
  while (i < waves.length && !waves[i]?.boss && !isRegularWave(waves, i) && !startsBlock(waves, i))
    i++;
  return i;
}

/** Whether a lesson has its waves: the regular wave after it is one composed
 * for it, its id the lesson's and a step's. A written block's waves that
 * follow a lesson (THE COIL's after THE LEECH) are not the lesson's. */
export function hasWaves(waves: readonly Wave[], at: number): boolean {
  const next = pastGuides(waves, at);
  const id = waves[at]?.id ?? "";
  return isRegularWave(waves, next) && (waves[next]?.id.startsWith(id) ?? false);
}

/** What a group of waves is, for the reorder. */
type Part = "head" | "regular" | "boss" | "lesson";

/**
 * The list with every lesson after the arc moved behind its block's regular
 * waves. A block here runs to the next that opens one — an intro, a review
 * head, or a lesson that has its waves already (`hasWaves`), so a second run
 * moves nothing; its
 * waves keep their order within each part: the intro with the guided waves
 * straight after it, the regular waves, the bosses, then each lesson with
 * the guided waves after it. Bosses are placed again afterwards
 * (`bossOrder`); nothing in the arc moves.
 */
const opens = (waves: readonly Wave[], i: number): boolean =>
  placeable(waves, i) !== undefined ||
  isReviewHead(waves, i) ||
  (isLesson(waves, i) && hasWaves(waves, i));

export function lessonsAfterBlocks(waves: readonly Wave[]): Wave[] {
  const finale = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  const out = waves.slice(0, finale + 1);
  let i = finale + 1;
  while (i < waves.length) {
    let end = i + 1;
    while (end < waves.length && !opens(waves, end)) end++;
    const parts: Record<Part, Wave[]> = { head: [], regular: [], boss: [], lesson: [] };
    let into: Part = "head";
    for (let j = i; j < end; j++) {
      const w = waves[j] as Wave;
      if (w.boss) parts.boss.push(w);
      else if (isRegularWave(waves, j)) parts.regular.push(w);
      else {
        // The wave that opens the block is its head, a settled lesson too.
        if (j > i && isLesson(waves, j)) into = "lesson";
        parts[into === "lesson" ? "lesson" : "head"].push(w);
      }
    }
    out.push(...parts.head, ...parts.regular, ...parts.boss, ...parts.lesson);
    i = end;
  }
  return out;
}

/**
 * The panel a lesson's waves are played on: the lesson's, unless it cannot
 * play the block's bodies — THE CLAW's has no shield and no colour shot, and
 * clears a rock only through a pod its arm takes, which the steps do not
 * place — and then the block's own.
 */
function panelOf(lesson: Wave, read: Block): Wave["controls"] {
  const has = new Set(controlSet(lesson.controls).controls);
  const plays = controlSet(read.controls).controls.every((c) => has.has(c));
  return plays ? lesson.controls : read.controls;
}

export interface Lesson {
  block: Block;
  /** The lesson's id, which every composed id starts with, and its word. */
  prefix: string;
  word: string;
}

/**
 * The first lesson after the arc with no regular waves of its own, and the
 * block that gives it them, or why there is none. Its waves go after the
 * lesson and the guided waves that follow it.
 */
export function nextLesson(waves: readonly Wave[]): Lesson | string {
  const finale = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  for (let at = finale + 1; at < waves.length; at++) {
    if (!isLesson(waves, at)) continue;
    if (hasWaves(waves, at)) continue;
    const insertAt = pastGuides(waves, at);
    const lesson = waves[at] as Wave;
    let theme = at - 1;
    while (theme > 0 && placeable(waves, theme) === undefined) theme--;
    const read = readBlock(waves, waves[theme]?.id ?? "");
    if (typeof read === "string") return read;
    const { leads: _l, after: _a, floor: _f, ...rest } = read;
    const floor = gentlestBefore(waves, at);
    const block: Block = {
      ...rest,
      tutorial: false,
      existing: 0,
      sinceTutorial: blocksBefore(waves, at),
      ...(floor === undefined ? {} : { floor }),
      insertAt,
      controls: panelOf(lesson, read),
      ...(lesson.faults ? { faults: lesson.faults } : {}),
    };
    return { block, prefix: lesson.id, word: lessonWord(lesson) };
  }
  return "every lesson has its waves";
}
