import { describe, expect, test } from "bun:test";
import { bindContents, listedHeadings, whereOnPage } from "../src/tabs.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * The contents menu on the long sheet pages (`tabs.ts`).
 *
 * The two things worth holding are the two that would go wrong silently: the
 * level of heading a page's sections are written at — a whole document titled
 * in an `h3` and sectioned in `h4`s would otherwise offer a menu of one — and
 * that the list follows the page, since every page under it is drawn on first
 * sight of its own tab and a list made once at binding time would stand empty
 * over the page for good.
 */

function heading(tag: string, text: string): FakeEl {
  const el = new FakeEl();
  el.tagName = tag;
  el.textContent = text;
  return el;
}

/** A page with a `<nav data-contents>` over a container, bound. */
function page(container: FakeEl): {
  nav: FakeEl;
  list: FakeEl;
  drawn(): void;
  restore(): void;
} {
  const nav = new FakeEl();
  nav.tagName = "NAV";
  nav.dataset.contents = "body";
  const dom = installDom({ bars: { "nav[data-contents]": [nav] }, ids: { body: container } });
  bindContents();
  const [, list] = nav.children as [FakeEl, FakeEl];
  return { nav, list: list!, drawn: () => dom.mutated(container), restore: dom.restore };
}

/** The words on one row, the heading's own text and no more. */
function rows(list: FakeEl): string[] {
  return list.children.map((li) => li.children[0]?.textContent ?? "");
}

describe("the level a page's sections are written at", () => {
  test("takes the h4 sections of a document titled in an h3", () => {
    const doc = new FakeEl();
    doc.append(
      heading("H3", "A document with a title over its sections"),
      heading("H4", "The one sentence"),
      heading("H4", "Sources"),
    );
    expect(listedHeadings(doc as unknown as HTMLElement).map((h) => h.textContent)).toEqual([
      "The one sentence",
      "Sources",
    ]);
  });

  test("takes the h2 groups of a page written with nothing above them", () => {
    const backlog = new FakeEl();
    const group = new FakeEl();
    group.append(heading("H2", "MECHANIC IDEAS"));
    const second = new FakeEl();
    second.append(heading("H2", "CONTROL IDEAS"));
    backlog.append(group, second);
    expect(listedHeadings(backlog as unknown as HTMLElement).map((h) => h.textContent)).toEqual([
      "MECHANIC IDEAS",
      "CONTROL IDEAS",
    ]);
  });

  test("lists the one heading a page of one has, rather than nothing", () => {
    const one = new FakeEl();
    one.append(heading("H3", "Party games"));
    expect(listedHeadings(one as unknown as HTMLElement)).toHaveLength(1);
  });
});

describe("the menu", () => {
  test("stands open, and follows the page as it is drawn", () => {
    const body = new FakeEl();
    const { nav, list, drawn, restore } = page(body);
    try {
      // Nothing drawn yet, so nothing shown: not a label over an empty box.
      expect(nav.hidden).toBe(true);
      // Drawn after binding, the way every room here is drawn on first sight
      // of its own tab.
      body.append(heading("H2", "WORDS"), heading("H2", "COLOURS"));
      drawn();
      expect(nav.hidden).toBe(false);
      expect(list.hidden).toBe(false);
      expect(rows(list)).toEqual(["WORDS", "COLOURS"]);
    } finally {
      restore();
    }
  });

  test("lists what the page says now, not what it said at the last draw", () => {
    const body = new FakeEl();
    const { list, drawn, restore } = page(body);
    try {
      body.append(heading("H2", "WORDS"));
      drawn();
      body.append(heading("H2", "COLOURS"));
      drawn();
      expect(rows(list)).toEqual(["WORDS", "COLOURS"]);
    } finally {
      restore();
    }
  });

  test("jumps to the heading and stays where it is", () => {
    const body = new FakeEl();
    const wanted = heading("H2", "COLOURS");
    body.append(heading("H2", "WORDS"), wanted);
    const { nav, list, restore } = page(body);
    try {
      expect(nav.hidden).toBe(false);
      list.children[1]?.children[0]?.click();
      expect(wanted.scrolledIntoView).toBe(true);
      expect(nav.hidden).toBe(false);
      expect(rows(list)).toEqual(["WORDS", "COLOURS"]);
    } finally {
      restore();
    }
  });
});

describe("where on the page an item is", () => {
  test("names the ends and the middle in plain words", () => {
    expect(whereOnPage(0, 5)).toBe("at the top");
    expect(whereOnPage(2, 5)).toBe("halfway down");
    expect(whereOnPage(4, 5)).toBe("at the end");
  });

  test("a page of one heading is the whole page", () => {
    expect(whereOnPage(0, 1)).toBe("the whole page");
  });
});
