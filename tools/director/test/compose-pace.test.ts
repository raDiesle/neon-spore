import { describe, expect, test } from "bun:test";
import {
  PACE_REST_BEATS,
  regularWaves,
  WAVES,
  type Wave,
  waveFastSlides,
} from "@neon-spore/content";
import { TUTORIAL_LAST_ID } from "../src/compose-steps.js";
import { isComposed } from "../src/curriculum-order.js";
import { stretchPace } from "../src/pace-stretch.js";

/**
 * **A composed wave crosses the field fast once at most, and rests after**
 * (`wave-pace.ts`; the owner, 17 October 2026: *better rare, like a special
 * difficulty situation, then slow down pace*). None in the tutorial arc.
 * The composer places by it (`compose-place.ts`) and drops a draw that
 * breaks it (`compose-check.ts`); this holds the list on disk to it.
 */

const ids = new Set(WAVES.map((w) => w.id));
const regular = regularWaves(WAVES);
const finale = WAVES.findIndex((w) => w.id === TUTORIAL_LAST_ID);
const made = (w: Wave) => isComposed(w.id, ids) || /^(filler|review)[A-Z]/.test(w.id);

describe("the shipped list", () => {
  test("no composed wave makes more than its one fast slide, or skips the rest after it", () => {
    const bad: string[] = [];
    WAVES.forEach((w, i) => {
      if (!regular[i] || !made(w)) return;
      const slides = waveFastSlides(w);
      const allowed = i <= finale ? 0 : 1;
      const tired = slides.some((s) => s.rest !== undefined && s.rest < PACE_REST_BEATS);
      if (slides.length > allowed || tired) bad.push(`${i + 1} ${w.name}: ${slides.length}`);
    });
    expect(bad).toEqual([]);
  });
});

describe("stretchPace", () => {
  const wave = (cols: number[], gap: number): Wave => ({
    id: "w",
    name: "W",
    entries: cols.map((col, k) => ({ beat: k * gap, col, color: "red" as const })),
  });

  test("moves what comes too soon later, and keeps every column", () => {
    const out = stretchPace(wave([0, 10, 0, 10], 4), 0);
    expect(waveFastSlides(out)).toEqual([]);
    expect(out.entries.map((e) => e.col)).toEqual([0, 10, 0, 10]);
  });

  test("keeps the one it may, and rests after it", () => {
    const out = stretchPace(wave([0, 10, 0, 10], 4), 1);
    const slides = waveFastSlides(out);
    expect(slides).toHaveLength(1);
    expect(slides[0]?.rest).toBeGreaterThanOrEqual(PACE_REST_BEATS);
  });

  test("leaves a wave with nothing to stretch as it is", () => {
    const calm = wave([4, 6, 4], 6);
    expect(stretchPace(calm, 0)).toBe(calm);
  });
});
