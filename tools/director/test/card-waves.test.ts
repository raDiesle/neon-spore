import { describe, expect, test } from "bun:test";
import { AUTHORED_WAVE_COUNT, waveBriefingOrder, waveBriefingWorld } from "../src/card-waves.js";

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
