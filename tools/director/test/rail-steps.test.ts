import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { bindRail } from "../src/rail.js";
import { waveNowText } from "../src/rail-steps.js";
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
  now: FakeEl;
  store: Store;
  selects: () => number;
  dom: FakeDom;
} {
  const prev = new FakeEl();
  const next = new FakeEl();
  const now = new FakeEl();
  const dom = installDom({
    ids: { waveList: new FakeEl(), wavePrev: prev, waveNext: next, waveNow: now },
  });
  const store: Store = { waves: WAVES.map((w) => ({ ...w })), index, dirty: false };
  let count = 0;
  // `onSelect` is `refreshAll` in the real page, and `rail.render()` is one of
  // the things it calls (`main.ts`) — the arrows step the store and everything
  // beside them is repainted by that one callback, never by the step itself.
  const rail = bindRail(
    store,
    () => {
      count++;
      rail.render();
    },
    () => {},
  );
  return { prev, next, now, store, selects: () => count, dom };
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

/**
 * **What stands between the arrows**, which is where a button marked WAVE was
 * until the owner had it replaced on 15 September 2026. It was the last tab of
 * a bar that had four, and with one tab left a press could only put back the
 * page it was already on — so the place a press had nothing to do is the place
 * that says which wave this is.
 */
describe("the wave between the arrows", () => {
  test("is the number a person counts to, out of how many there are", () => {
    const { store } = page(0);
    expect(waveNowText(store)).toBe(`01 / ${WAVES.length}`);
    store.index = 6;
    expect(waveNowText(store)).toBe(`07 / ${WAVES.length}`);
    store.index = LAST;
    expect(waveNowText(store)).toBe(`${LAST + 1} / ${WAVES.length}`);
  });

  test("follows the arrows without anything else being pressed", () => {
    // The owner's own report: stepping to the next wave left the editor blank
    // until WAVE was pressed again, because `bindTabs` was wired to every
    // button in the bar and an arrow carries no `data-tab` (`tabs.ts`). The
    // number is drawn by the same `render` the arrows' own titles are, so it
    // is the cheapest proof that a step repaints the panel it belongs to.
    const { next, now, store } = page(0);
    expect(now.textContent).toBe(`01 / ${WAVES.length}`);
    next.click();
    expect(store.index).toBe(1);
    expect(now.textContent).toBe(`02 / ${WAVES.length}`);
  });
});
