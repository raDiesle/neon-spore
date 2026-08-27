import { describe, expect, test } from "bun:test";
import { BRIEFINGS } from "@neon-spore/content";
import { BRIEFING_SUBJECTS, subjectIndex } from "@neon-spore/sim";
import { categoryOf, subjectWorld } from "../src/card-gallery.js";

/**
 * The two pieces of `card-gallery.ts` that do not need a canvas: the
 * grouping and the posed world. Drawing the frame itself belongs to a
 * browser, the way `poses.test.ts` leaves `poseArt` untested and tests only
 * `pose.build()`.
 */

describe("categoryOf", () => {
  test("groups every subject, and only THE OPENING is its own group", () => {
    const seen = new Map<string, number>();
    for (const id of BRIEFING_SUBJECTS) {
      const cat = categoryOf(id);
      seen.set(cat, (seen.get(cat) ?? 0) + 1);
    }
    expect(seen.get("THE OPENING")).toBe(1);
    expect(seen.get("CREATURES")).toBeGreaterThan(1);
    expect(seen.get("BOSSES")).toBeGreaterThan(1);
    expect(seen.get("PODS")).toBe(3);
  });

  test("every subject in BRIEFING_SUBJECTS is a card BRIEFINGS actually has", () => {
    for (const id of BRIEFING_SUBJECTS) {
      expect(BRIEFINGS[id], id).toBeDefined();
    }
  });
});

describe("subjectWorld", () => {
  test("holds exactly the one card asked for, and nothing else", () => {
    for (const id of BRIEFING_SUBJECTS) {
      const world = subjectWorld(id);
      expect(world.brief.due, id).toEqual([subjectIndex(id)]);
      expect(world.brief.ack, id).toBe(0);
    }
  });

  test("is a legal world — the hull is held, so nothing it poses can end its own run", () => {
    const world = subjectWorld("meteorFastest");
    expect(world.over).toBe(false);
  });
});
