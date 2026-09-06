import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { bindRail } from "../src/rail.js";
import type { Store } from "../src/state.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * What the wave list actually draws while a filter is typed into the field
 * above it — the half of `rail-filter.ts` that is not a pure function.
 *
 * Two rules are worth a test rather than an eye. The list must **not** hide the
 * wave being edited, however badly it fails the filter: the column beside it is
 * that wave's own fields, and hiding its row leaves the editor pointing at
 * something nobody can see. And the count under the field must be the number of
 * *matches*, not the number of rows — those differ by exactly that one row.
 */

/** Enough of a page for `bindRail`: the list, the field, the count line.
 * Everything else it reaches for is optional and answers null. */
function page(query: string): {
  list: FakeEl;
  note: FakeEl & { hidden?: boolean };
  restore: () => void;
} {
  const list = new FakeEl();
  const field = new FakeEl();
  field.value = query;
  const note = new FakeEl();
  const dom = installDom({ ids: { waveList: list, waveFilter: field, waveFilterNote: note } });
  return { list, note, restore: dom.restore };
}

/** The list's rows, as the text each one ends with — the wave's name. */
function names(list: FakeEl): string[] {
  return list.children.map((row) => row.children.map((c) => c.textContent).join(""));
}

function store(index: number): Store {
  return { waves: WAVES.map((w) => ({ ...w })), index, dirty: false };
}

describe("the wave list under a filter", () => {
  test("unfiltered, it draws every wave", () => {
    const { list, note, restore } = page("");
    try {
      bindRail(
        store(0),
        () => {},
        () => {},
      );
      expect(list.children.length).toBe(WAVES.length);
      expect(note.hidden).toBe(true);
    } finally {
      restore();
    }
  });

  test("a term drops the rows that do not answer it", () => {
    const { list, restore } = page("boss");
    try {
      // Wave 1 is selected and carries no boss, so it is the one extra row.
      bindRail(
        store(0),
        () => {},
        () => {},
      );
      expect(list.children.length).toBeGreaterThan(1);
      expect(list.children.length).toBeLessThan(WAVES.length);
      for (const row of list.children.slice(1)) {
        expect(row.classList.contains("off-filter")).toBe(false);
      }
    } finally {
      restore();
    }
  });

  test("keeps the selected wave, dimmed, even when it does not answer", () => {
    const { list, restore } = page("zzzznothing");
    try {
      bindRail(
        store(3),
        () => {},
        () => {},
      );
      expect(list.children.length).toBe(1);
      const row = list.children[0]!;
      expect(row.classList.contains("on")).toBe(true);
      expect(row.classList.contains("off-filter")).toBe(true);
      expect(names(list)[0]).toContain(WAVES[3]!.name);
    } finally {
      restore();
    }
  });

  test("the selected wave is not dimmed when it does answer", () => {
    const { list, restore } = page(WAVES[3]!.name);
    try {
      bindRail(
        store(3),
        () => {},
        () => {},
      );
      const row = list.children.find((r) => r.classList.contains("on"));
      expect(row).toBeDefined();
      expect(row?.classList.contains("off-filter")).toBe(false);
    } finally {
      restore();
    }
  });

  test("the count is matches out of the whole list, not rows drawn", () => {
    const { note, restore } = page("zzzznothing");
    try {
      bindRail(
        store(3),
        () => {},
        () => {},
      );
      // One row is on screen — the selected wave — and nothing matched.
      expect(note.textContent).toBe("nothing matches");
      expect(note.hidden).toBe(false);
    } finally {
      restore();
    }
  });

  test("a filter that matches says how many of how many", () => {
    const { list, note, restore } = page("boss");
    try {
      bindRail(
        store(0),
        () => {},
        () => {},
      );
      const matched = Number(note.textContent.split(" ")[0]);
      expect(note.textContent).toEndWith(`of ${WAVES.length}`);
      // The selected wave is the extra row, and it is not a match.
      expect(list.children.length).toBe(matched + 1);
    } finally {
      restore();
    }
  });
});
