import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WAVES } from "@neon-spore/content";
import { bindRail } from "../src/rail.js";
import type { Store } from "../src/state.js";
import { type FakeDom, FakeEl, installDom } from "./fake-dom.js";

/**
 * The three ways out of a row in the wave list.
 *
 * The owner, 17 September 2026: *"when on mobile, I want to be able from the
 * list of waves for each wave to directly open the wave details or map
 * editor."* It was three presses and two of them were the menu. And on 18
 * September, of the third view: *"on mobile, navigate from list of waves
 * directly to game, should open the game screen."*
 *
 * What is worth holding is not the words but the four decisions: the row's
 * own press still only selects, so reading down the list is still reading down
 * the list; an opener selects **and** goes, in one press, so the view never
 * opens on the wave that was already showing; the views it goes to are the
 * three the header has and in the header's own order; and on a desktop, where
 * all four columns are on screen at once, the buttons are not there at all.
 */

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

function store(index = 0): Store {
  return { waves: WAVES.map((w) => ({ ...w })), index, dirty: false };
}

/** A page with the list on it, on a phone or on a desk. */
function page(phone: boolean): { list: FakeEl; dom: FakeDom; main: FakeEl } {
  const list = new FakeEl();
  const main = new FakeEl();
  main.tagName = "MAIN";
  const dom = installDom({
    ids: { waveList: list },
    bars: { main: [main], "header .menu-item[data-view]": [] },
    phone,
  });
  return { list, dom, main };
}

/** The openers on the row at `at`, in the order they are drawn. */
function openers(list: FakeEl, at: number): FakeEl[] {
  const row = list.children[at];
  expect(row, `no row ${at} in the list`).toBeDefined();
  return (row?.children ?? []).filter((c) => c.classList.contains("row-open"));
}

describe("a row in the wave list", () => {
  it("opens the wave's own fields, the field and its map, and nothing else", () => {
    const { list, dom } = page(true);
    try {
      bindRail(
        store(),
        () => {},
        () => {},
      );
      expect(openers(list, 3).map((b) => b.dataset.open)).toEqual(["wave", "game", "map"]);
    } finally {
      dom.restore();
    }
  });

  it("selects the wave it belongs to before it goes anywhere", () => {
    // Otherwise the press opens the view on whichever wave was already
    // showing, which is the press appearing to do nothing.
    const { list, dom, main } = page(true);
    const picked: number[] = [];
    try {
      const s = store(0);
      bindRail(
        s,
        () => picked.push(s.index),
        () => {},
      );
      openers(list, 5)[2]?.click();
      expect(picked, "the map opened without the wave being selected").toEqual([5]);
      expect(main.getAttribute("data-view")).toBe("map");
    } finally {
      dom.restore();
    }
  });

  it("takes the middle opener to the field, which is the view the tool is for", () => {
    // The 18 September ask, and the one destination that still cost the menu:
    // every other way to the picture was `#menuToggle` and the GAME item.
    const { list, dom, main } = page(true);
    const picked: number[] = [];
    try {
      const s = store(0);
      bindRail(
        s,
        () => picked.push(s.index),
        () => {},
      );
      openers(list, 9)[1]?.click();
      expect(picked, "the field opened without the wave being selected").toEqual([9]);
      expect(main.getAttribute("data-view")).toBe("game");
    } finally {
      dom.restore();
    }
  });

  it("leaves the row's own press as a selection and nothing more", () => {
    const { list, dom, main } = page(true);
    try {
      const s = store(0);
      bindRail(
        s,
        () => {},
        () => {},
      );
      // The list is also how the campaign is read down; a row that navigated
      // would make scanning it a series of departures.
      const row = list.children[7]?.children[0];
      row?.click();
      expect(s.index).toBe(7);
      expect(main.getAttribute("data-view")).toBeNull();
    } finally {
      dom.restore();
    }
  });

  it("goes nowhere on a desk, where every column is already on the screen", () => {
    const { list, dom, main } = page(false);
    try {
      const s = store(0);
      bindRail(
        s,
        () => {},
        () => {},
      );
      openers(list, 2)[2]?.click();
      expect(s.index, "the wave was not selected").toBe(2);
      expect(main.getAttribute("data-view"), "a desk was switched to a phone view").toBeNull();
    } finally {
      dom.restore();
    }
  });

  it("is drawn only under the phone's own breakpoint", async () => {
    // Read out of the sheets rather than out of a browser, the way
    // `phone-map.test.ts` reads its own two rules: the desktop hides them and
    // only the media block turns them on, so both halves have to be there.
    const desk = await Bun.file(join(SRC, "director-columns.css")).text();
    const phone = await Bun.file(join(SRC, "director-phone.css")).text();
    expect(desk).toMatch(/#waveList \.row-open \{\s*display: none;/);
    const block = phone.slice(phone.indexOf("@media (max-width: 700px) {"));
    expect(block).toMatch(/#waveList \.row-open \{[^}]*display: block;/);
    // A thumb's target, which is the whole reason the row grew them.
    expect(block).toMatch(/#waveList \.row-open \{[^}]*min-width: 44px;/);
  });
});
