import { describe, expect, test } from "bun:test";
import { BRUSH_GROUPS } from "../src/brush-groups.js";
import { makeSelection } from "../src/selection.js";
import { cellIsEmpty, emptyWave, entryAt, eraseAt, paint, podAt } from "../src/state.js";

/**
 * A CLICK NO LONGER TAKES BACK WHAT IT LANDS ON.
 *
 * Painting the brush already in a cell used to remove it, so the brush was its
 * own eraser. That made the commonest gesture in the tool — clicking a cell to
 * see what is in it — destructive, and left no way to *point* at an entry,
 * which is precisely what a per-entry config panel needs (`cell-panel.ts`).
 *
 * These are the two halves of that correction: painting is idempotent, and
 * removal is its own verb reached by `Delete`, by a held press, by the ERASE
 * brush and by the panel's button — all four through `eraseAt`.
 */

describe("paint is idempotent", () => {
  test("painting the same brush twice leaves the entry, and exactly one of it", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "slick");
    paint(wave, 0, 3, "slick");
    expect(entryAt(wave, 0, 3)).toBeDefined();
    expect(wave.entries.filter((e) => e.beat === 0 && e.col === 3)).toHaveLength(1);
  });

  test("painting a different brush over one replaces it rather than stacking", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "slick");
    paint(wave, 0, 3, "bulb");
    expect(wave.entries.filter((e) => e.beat === 0 && e.col === 3)).toHaveLength(1);
    expect(entryAt(wave, 0, 3)?.color).toBe("cyan");
  });

  test("a pod painted twice is still there — the same rule, on the other list", () => {
    const wave = emptyWave();
    paint(wave, 1, 2, "ward");
    paint(wave, 1, 2, "ward");
    expect(podAt(wave, 1, 2)).toBeDefined();
    expect(wave.pods ?? []).toHaveLength(1);
  });
});

describe("eraseAt is the one removal", () => {
  test("it empties a cell holding an entry", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "slick");
    eraseAt(wave, 0, 3);
    expect(cellIsEmpty(wave, 0, 3)).toBe(true);
  });

  test("it empties a cell holding both an entry and a pod", () => {
    const wave = emptyWave();
    paint(wave, 2, 4, "slick");
    paint(wave, 2, 4, "mend");
    expect(cellIsEmpty(wave, 2, 4)).toBe(false);
    eraseAt(wave, 2, 4);
    expect(cellIsEmpty(wave, 2, 4)).toBe(true);
  });

  test("the ERASE brush routes through it, so the mode and the key agree", () => {
    const wave = emptyWave();
    paint(wave, 0, 1, "slick");
    paint(wave, 0, 1, "erase");
    expect(cellIsEmpty(wave, 0, 1)).toBe(true);
  });

  test("a wave with its last pod erased carries no empty pods array", () => {
    const wave = emptyWave();
    paint(wave, 1, 2, "mend");
    eraseAt(wave, 1, 2);
    expect(wave.pods).toBeUndefined();
  });
});

describe("ERASE left the palette for the panel under the map", () => {
  test("no brush group offers it any more", () => {
    const offered = BRUSH_GROUPS.flatMap((g) => g.brushes);
    expect(offered).not.toContain("erase");
  });

  test("but it is still a brush paint answers — only the button moved", () => {
    const wave = emptyWave();
    paint(wave, 0, 0, "slick");
    paint(wave, 0, 0, "erase");
    expect(cellIsEmpty(wave, 0, 0)).toBe(true);
  });
});

describe("the selection", () => {
  test("starts empty, holds a cell, and clears", () => {
    const sel = makeSelection();
    expect(sel.at()).toBeNull();
    sel.set({ beat: 2, col: 5 });
    expect(sel.at()).toEqual({ beat: 2, col: 5 });
    sel.set(null);
    expect(sel.at()).toBeNull();
  });

  test("notifies on a real change and stays quiet on a repeat", () => {
    const sel = makeSelection();
    let changes = 0;
    sel.watch(() => {
      changes++;
    });
    sel.set({ beat: 1, col: 1 });
    expect(changes).toBe(1);
    // Re-selecting the cell already selected is what every paint stroke does;
    // rebuilding the panel each time would blur a field being typed in.
    sel.set({ beat: 1, col: 1 });
    expect(changes).toBe(1);
    sel.set({ beat: 1, col: 2 });
    expect(changes).toBe(2);
  });

  test("hands back a copy, so a caller cannot move the selection by mutating it", () => {
    const sel = makeSelection();
    const cell = { beat: 3, col: 3 };
    sel.set(cell);
    cell.beat = 9;
    expect(sel.at()?.beat).toBe(3);
  });
});
