import { describe, expect, test } from "bun:test";
import { bindContents, listedHeadings, whereOnPage } from "../src/tabs.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * The contents menu on the long sheet pages (`tabs.ts`).
 *
 * The two things worth holding are the two that would go wrong silently: the
 * level of heading a page's sections are written at — a whole document titled
 * in an `h3` and sectioned in `h4`s would otherwise offer a menu of one — and
 * that the list is read when the menu opens, since every page under it is
 * drawn on first sight of its own tab and a list made at binding time would be
 * empty on the first open.
 */

function heading(tag: string, text: string): FakeEl {
  const el = new FakeEl();
  el.tagName = tag;
  el.textContent = text;
  return el;
}

/** A page with a `<nav data-contents>` over a container, bound and shut. */
function page(container: FakeEl): { nav: FakeEl; opener: FakeEl; list: FakeEl; restore(): void } {
  const nav = new FakeEl();
  nav.tagName = "NAV";
  nav.dataset.contents = "body";
  const dom = installDom({ bars: { "nav[data-contents]": [nav] }, ids: { body: container } });
  bindContents();
  const [opener, list] = nav.children as [FakeEl, FakeEl];
  return { nav, opener: opener!, list: list!, restore: dom.restore };
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
  test("reads the page when it opens, not when it is bound", () => {
    const body = new FakeEl();
    const { opener, list, restore } = page(body);
    try {
      expect(list.hidden).toBe(true);
      // Drawn after binding, the way every room here is drawn on first sight
      // of its own tab.
      body.append(heading("H2", "WORDS"), heading("H2", "COLOURS"));
      opener.click();
      expect(list.hidden).toBe(false);
      expect(opener.classList.contains("on")).toBe(true);
      expect(rows(list)).toEqual(["WORDS", "COLOURS"]);
    } finally {
      restore();
    }
  });

  test("lists what the page says now, not what it said at the last open", () => {
    const body = new FakeEl();
    const { opener, list, restore } = page(body);
    try {
      body.append(heading("H2", "WORDS"));
      opener.click();
      opener.click();
      body.append(heading("H2", "COLOURS"));
      opener.click();
      expect(rows(list)).toEqual(["WORDS", "COLOURS"]);
    } finally {
      restore();
    }
  });

  test("jumps to the heading and shuts behind itself", () => {
    const body = new FakeEl();
    const wanted = heading("H2", "COLOURS");
    body.append(heading("H2", "WORDS"), wanted);
    const { opener, list, restore } = page(body);
    try {
      opener.click();
      list.children[1]?.children[0]?.click();
      expect(wanted.scrolledIntoView).toBe(true);
      expect(list.hidden).toBe(true);
      expect(opener.classList.contains("on")).toBe(false);
    } finally {
      restore();
    }
  });

  test("says so when the page has not been drawn yet", () => {
    const { opener, list, restore } = page(new FakeEl());
    try {
      opener.click();
      expect(list.children).toHaveLength(1);
      expect(list.children[0]?.textContent).toContain("not been drawn");
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
