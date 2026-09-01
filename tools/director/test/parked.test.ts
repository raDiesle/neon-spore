/**
 * `docs/parked.md` is a page somebody reads to decide whether an idea is worth
 * doing, and the sentences under each heading are the whole content of that
 * decision. The director showed the headings and dropped the sentences, which
 * is a list of seventy-five titles nobody can decide anything from.
 *
 * These tests are about the file as much as the parser: a heading with no
 * argument under it, a duplicate, or an entry spliced into the middle of the
 * file's own introduction are all things that have happened here and none of
 * them fail a type check.
 */

import { describe, expect, test } from "bun:test";
import { parseParked } from "../src/parked.js";

const ROOT = new URL("../../../", import.meta.url);
const parkedMd = await Bun.file(Bun.fileURLToPath(new URL("docs/parked.md", ROOT))).text();

describe("parseParked", () => {
  test("an entry keeps the argument under its heading", () => {
    const entries = parseParked(parkedMd);
    expect(entries.length).toBeGreaterThan(20);
    for (const e of entries) {
      expect({ title: e.title, has: e.body.length > 80 }).toEqual({ title: e.title, has: true });
    }
  });

  test("every entry says when it was parked, what kind it is and how far along", () => {
    for (const e of parseParked(parkedMd)) {
      expect({ title: e.title, origin: e.origin !== "", label: e.label !== "" }).toEqual({
        title: e.title,
        origin: true,
        label: true,
      });
    }
  });

  // A `###` heading carries a paragraph saying why its entries are held back.
  // That paragraph is the section's, and it used to be swept into whichever
  // entry happened to sit above the heading.
  test("a section's own prose is not glued to the entry before it", () => {
    const entries = parseParked(
      [
        "## One",
        "",
        "2026-01-01 · a",
        "",
        "Tool · Idea",
        "",
        "First.",
        "",
        "### Held back",
        "",
        "Because.",
        "",
        "## Two",
        "",
        "2026-01-02 · b",
        "",
        "Tool · Idea",
        "",
        "Second.",
      ].join("\n"),
    );
    expect(entries.map((e) => [e.title, e.section, e.body])).toEqual([
      ["One", "", "First."],
      ["Two", "Held back", "Second."],
    ]);
  });

  // Two sessions appending near the same place is how four entries came to be
  // in the file twice, each copy invisible from the other end of 1700 lines.
  test("no entry is in the file twice", () => {
    const titles = parseParked(parkedMd).map((e) => e.title);
    expect([...new Set(titles)].length).toBe(titles.length);
  });

  // The introduction is prose, not entries, and an append that lands inside it
  // splits a sentence in half — which is exactly what happened, and left a
  // heading reading "### Postponed: creatures and bosses`, which says why."
  test("nothing is parsed out of the introduction", () => {
    const first = parseParked(parkedMd)[0];
    expect(parkedMd.indexOf(`## ${first?.title}`)).toBeGreaterThan(parkedMd.indexOf("**Stage**"));
  });
});
