import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { bindRail } from "../src/rail.js";
import type { Store } from "../src/state.js";
import { type FakeDom, FakeEl, installDom } from "./fake-dom.js";

/**
 * **The two arrows over the WAVE column**, and the two keys that are the same
 * step without the mouse.
 *
 * Reading through the waves in order used to be a press per wave with a trip
 * back to the list each time. The arrows open the row before and the row after
 * through the same `onSelect` a row press makes, so everything beside them —
 * the list, the map, the stage — follows exactly as it does for a press.
 *
 * What is worth a test rather than an eye is the two ends: the first wave's ‹
 * and the last wave's › are *disabled* rather than wrapping, because an arrow
 * that came back round would lose the reader's place in a list being read in
 * order.
 */

function page(index: number): {
  prev: FakeEl;
  next: FakeEl;
  store: Store;
  selects: () => number;
  dom: FakeDom;
} {
  const prev = new FakeEl();
  const next = new FakeEl();
  const dom = installDom({
    ids: { waveList: new FakeEl(), wavePrev: prev, waveNext: next },
  });
  const store: Store = { waves: WAVES.map((w) => ({ ...w })), index, dirty: false };
  let count = 0;
  bindRail(
    store,
    () => count++,
    () => {},
  );
  return { prev, next, store, selects: () => count, dom };
}

const LAST = WAVES.length - 1;

describe("the arrows over the WAVE column", () => {
  test("each opens the wave that way, through the same refresh a row press makes", () => {
    const { prev, next, store, selects, dom } = page(3);
    try {
      next.click();
      expect(store.index).toBe(4);
      prev.click();
      prev.click();
      expect(store.index).toBe(2);
      expect(selects()).toBe(3);
    } finally {
      dom.restore();
    }
  });

  test("the first wave's ‹ and the last wave's › are disabled, not wrapping", () => {
    const first = page(0);
    try {
      expect(first.prev.disabled).toBe(true);
      expect(first.next.disabled).toBe(false);
      // And pressing it anyway — a key, where there is no disabled to obey —
      // leaves the wave where it is.
      first.dom.press("[");
      expect(first.store.index).toBe(0);
    } finally {
      first.dom.restore();
    }

    const last = page(LAST);
    try {
      expect(last.next.disabled).toBe(true);
      expect(last.prev.disabled).toBe(false);
      last.dom.press("]");
      expect(last.store.index).toBe(LAST);
    } finally {
      last.dom.restore();
    }
  });

  test("each arrow says which wave it opens, by number and name", () => {
    const { prev, next, dom } = page(3);
    try {
      expect(prev.title).toBe(`03 ${WAVES[2]?.name}`);
      expect(next.title).toBe(`05 ${WAVES[4]?.name}`);
    } finally {
      dom.restore();
    }
  });
});

describe("[ and ]", () => {
  test("step the same way the arrows do", () => {
    const { store, dom } = page(3);
    try {
      dom.press("]");
      expect(store.index).toBe(4);
      dom.press("[");
      dom.press("[");
      expect(store.index).toBe(2);
    } finally {
      dom.restore();
    }
  });

  test("belong to whoever is typing a wave's name", () => {
    const { store, dom } = page(3);
    try {
      const field = new FakeEl();
      field.tagName = "INPUT";
      dom.press("]", field);
      expect(store.index).toBe(3);
    } finally {
      dom.restore();
    }
  });
});
