import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { bindRail } from "../src/rail.js";
import { moveWave } from "../src/rail-drag.js";
import type { Store } from "../src/state.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * A wave dragged to a new place in the list (`rail-drag.ts`): where it lands,
 * which wave stays open, and that a drag which is not one of ours is left
 * alone.
 */

function store(index: number): Store {
  return { waves: WAVES.map((w) => ({ ...w })), index, dirty: false };
}

const names = (s: Store): string[] => s.waves.map((w) => w.name);

/** What a browser hands a drag listener, as far as this file reads it. */
function dragEvent(): { preventDefault: () => void; prevented: () => boolean } {
  let prevented = false;
  return {
    preventDefault: () => {
      prevented = true;
    },
    prevented: () => prevented,
  };
}

describe("moveWave", () => {
  test("dragged down, the wave lands after the row it was let go on", () => {
    const s = store(0);
    const [a, b, c] = names(s) as [string, string, string];
    moveWave(s, 0, 2);
    expect(names(s).slice(0, 3)).toEqual([b, c, a]);
  });

  test("dragged up, it lands before it", () => {
    const s = store(0);
    const [a, b, c] = names(s) as [string, string, string];
    moveWave(s, 2, 0);
    expect(names(s).slice(0, 3)).toEqual([c, a, b]);
  });

  test("the open wave follows itself when it is the one dragged", () => {
    const s = store(1);
    const open = s.waves[1];
    moveWave(s, 1, 4);
    expect(s.index).toBe(4);
    expect(s.waves[s.index]).toBe(open);
  });

  test("another wave dragged across the open one leaves the same wave open", () => {
    const s = store(3);
    const open = s.waves[3];
    moveWave(s, 0, 5);
    expect(s.waves[s.index]).toBe(open);
    expect(s.index).toBe(2);
  });

  test("a place outside the list moves nothing", () => {
    const s = store(0);
    const before = names(s);
    moveWave(s, 0, s.waves.length);
    moveWave(s, -1, 2);
    expect(names(s)).toEqual(before);
  });
});

describe("the list's rows", () => {
  function page(): { list: FakeEl; restore: () => void } {
    const list = new FakeEl();
    const dom = installDom({ ids: { waveList: list } });
    return { list, restore: dom.restore };
  }

  test("a row dropped on another carries its wave there and marks the list unsaved", () => {
    const { list, restore } = page();
    try {
      const s = store(0);
      const [a, b, c] = names(s) as [string, string, string];
      let selected = 0;
      bindRail(
        s,
        () => selected++,
        () => {},
      );
      const rows = list.children;
      rows[0]!.fire("dragstart", dragEvent());
      const over = dragEvent();
      rows[2]!.fire("dragover", over);
      expect(over.prevented()).toBe(true);
      expect(rows[2]!.classList.contains("drop-after")).toBe(true);
      rows[2]!.fire("drop", dragEvent());
      expect(names(s).slice(0, 3)).toEqual([b, c, a]);
      expect(s.dirty).toBe(true);
      expect(selected).toBe(1);
    } finally {
      restore();
    }
  });

  test("a drag that did not start on a row is not a drop target", () => {
    const { list, restore } = page();
    try {
      const s = store(0);
      const before = names(s);
      bindRail(
        s,
        () => {},
        () => {},
      );
      const over = dragEvent();
      list.children[2]!.fire("dragover", over);
      expect(over.prevented()).toBe(false);
      list.children[2]!.fire("drop", dragEvent());
      expect(names(s)).toEqual(before);
      expect(s.dirty).toBe(false);
    } finally {
      restore();
    }
  });
});
