import { describe, expect, test } from "bun:test";
import type { Wave } from "@neon-spore/content";
import { faultKindOf } from "../src/brushes.js";
import { paint } from "../src/paint.js";
import { marksMatch } from "../src/rail-symbols.js";

/**
 * **A fault is a pencil laid across a beat row**, and this is what a click with
 * one does to a wave.
 *
 * The owner asked for it on 14 September 2026. What is worth a test rather
 * than an eye is the two things a fault does *not* do that every other brush
 * does: it ignores the column, because a malfunction has none, and a second
 * click on the same row takes it off, because a row is the only thing on the
 * map there is to point at it with.
 */

const wave = (): Wave => ({
  id: "t",
  name: "TEST",
  entries: [],
});

describe("a fault brush", () => {
  test("names the kind it places, and a creature brush names none", () => {
    expect(faultKindOf("fault:codex")).toBe("codex");
    expect(faultKindOf("slick")).toBeNull();
    expect(faultKindOf("erase")).toBeNull();
  });

  test("places it on the beat, whatever column was clicked", () => {
    const w = wave();
    paint(w, 6, 0, "fault:steer");
    expect(w.faults).toEqual([{ kind: "steer", at: 6 }]);
    // The same row, the far side of the field: the row already has it.
    paint(w, 6, 6, "fault:steer");
    expect(w.faults).toBeUndefined();
  });

  test("keeps two kinds on one row, and one kind on two rows", () => {
    const w = wave();
    paint(w, 4, 2, "fault:steer");
    paint(w, 4, 2, "fault:codex");
    expect(w.faults).toHaveLength(2);
    paint(w, 10, 2, "fault:steer");
    expect(w.faults).toEqual([
      { kind: "steer", at: 4 },
      { kind: "codex", at: 4 },
      { kind: "steer", at: 10 },
    ]);
  });

  test("leaves the list sorted by the row each enters on", () => {
    const w = wave();
    paint(w, 12, 0, "fault:codex");
    paint(w, 2, 0, "fault:steer");
    expect(w.faults?.map((f) => f.at)).toEqual([2, 12]);
  });
});

/**
 * The row of pressable marks over the filter, in the half that is a function of
 * a wave. **ORed with each other** is the owner's *either or is enough*, and it
 * is the only reading that makes a second press useful: two marks ANDed is
 * almost always the empty list.
 */
describe("filtering by the rail's own symbols", () => {
  const bossWave: Wave = { ...wave(), boss: { kind: "queen", col: 3, petals: 4 } };
  const faultWave: Wave = { ...wave(), faults: [{ kind: "codex", at: 0 }] };
  const list = [bossWave, faultWave, wave()];

  test("passes everything while nothing is pressed", () => {
    for (let i = 0; i < list.length; i++) {
      expect(marksMatch(list, i, new Set())).toBe(true);
    }
  });

  test("narrows to the waves carrying a pressed mark", () => {
    expect([0, 1, 2].map((i) => marksMatch(list, i, new Set(["boss"])))).toEqual([
      true,
      false,
      false,
    ]);
    expect([0, 1, 2].map((i) => marksMatch(list, i, new Set(["fault"])))).toEqual([
      false,
      true,
      false,
    ]);
  });

  test("takes either of two pressed marks, never both at once", () => {
    expect([0, 1, 2].map((i) => marksMatch(list, i, new Set(["boss", "fault"])))).toEqual([
      true,
      true,
      false,
    ]);
  });
});
