import { describe, expect, test } from "bun:test";
import { BRIEFING_SUBJECTS } from "@neon-spore/sim";
import {
  AUTHORED_WAVE_COUNT,
  cardFirstWave,
  subjectsWithNoWave,
  waveBriefingOrder,
  waveBriefingWorld,
  wavesWithCards,
} from "../src/card-waves.js";

/**
 * The derivation the ORDER section draws, tested the way `poses.test.ts`
 * tests a pose: the simulation part is testable and belongs to a headless
 * run, the canvas it is drawn to belongs to a browser.
 */

describe("waveBriefingOrder", () => {
  test("wave 1 opens on the opening card and the one creature it sends — the check's own premise", () => {
    // FIRST STEP is one red entry, which is a slick. A fresh pair meets that
    // and THE OPENING at once, which is the exact "two cards" the outstanding
    // check is about — this pins the count down so a change to wave 1 that
    // quietly grows or shrinks it is caught here rather than only on a phone.
    expect(waveBriefingOrder(0)).toEqual(["opening", "slick"]);
  });

  test("never owes the same subject twice in one list", () => {
    for (let i = 0; i < AUTHORED_WAVE_COUNT; i++) {
      const due = waveBriefingOrder(i);
      expect(new Set(due).size, `wave ${i + 1}`).toBe(due.length);
    }
  });

  test("is sorted in catalogue order, so two devices deal the same cards in the same order", () => {
    for (let i = 0; i < AUTHORED_WAVE_COUNT; i++) {
      const due = waveBriefingWorld(i).brief.due;
      const sorted = [...due].sort((a, b) => a - b);
      expect(due, `wave ${i + 1}`).toEqual(sorted);
    }
  });

  test("a fresh world reaches this without ending its own run", () => {
    const world = waveBriefingWorld(0);
    expect(world.over).toBe(false);
  });
});

describe("cardFirstWave", () => {
  test("wave 1 is where THE OPENING and THE SLICK are first raised — same premise as waveBriefingOrder's own", () => {
    const first = cardFirstWave();
    expect(first.get("opening")).toBe(0);
    expect(first.get("slick")).toBe(0);
  });

  test("every assigned subject's wave is a real, authored wave", () => {
    const first = cardFirstWave();
    for (const [id, waveIndex] of first) {
      expect(waveIndex, id).toBeGreaterThanOrEqual(0);
      expect(waveIndex, id).toBeLessThan(AUTHORED_WAVE_COUNT);
    }
  });

  test("every subject it names is a real briefing subject, and none is named twice", () => {
    const first = cardFirstWave();
    expect(new Set(first.keys()).size).toBe(first.size);
    for (const id of first.keys()) {
      expect(BRIEFING_SUBJECTS.includes(id), id).toBe(true);
    }
  });

  test("wavesWithCards is exactly the set of waves cardFirstWave assigns something to", () => {
    const expected = new Set(cardFirstWave().values());
    expect(wavesWithCards()).toEqual(expected);
  });

  test("a subject in cardFirstWave is never also in subjectsWithNoWave, and the two cover every subject", () => {
    const assigned = new Set(cardFirstWave().keys());
    const orphans = subjectsWithNoWave();
    for (const id of orphans) expect(assigned.has(id), id).toBe(false);
    expect(assigned.size + orphans.length).toBe(BRIEFING_SUBJECTS.length);
  });
});
