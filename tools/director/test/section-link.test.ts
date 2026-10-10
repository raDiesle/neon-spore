import { describe, expect, test } from "bun:test";
import { findSection, sectionSlug, sectionUrl } from "../src/section-link.js";

/**
 * A link to one section of a sheet page (`section-link.ts`). What would go
 * wrong silently is the round trip: a link copied off a heading that does not
 * find the same heading again when it is opened.
 */

describe("a section link", () => {
  test("names the section in its own words", () => {
    expect(sectionSlug("THE QUEEN")).toBe("the-queen");
    expect(sectionSlug("  Colour — every hue, by family ")).toBe("colour-every-hue-by-family");
  });

  test("keeps the sheet and its tab, drops the wave, and carries the slug", () => {
    const link = sectionUrl(
      "http://localhost:4174/?wave=7&sheet=backlog&inner=bosses#old",
      sectionSlug("THE QUEEN"),
    );
    expect(link).toBe("http://localhost:4174/?sheet=backlog&inner=bosses#the-queen");
  });

  test("finds the heading it was copied from, and the first of two with the same words", () => {
    const list = [{ text: "Line" }, { text: "THE QUEEN" }, { text: "the queen" }];
    expect(findSection(list, sectionSlug("THE QUEEN"))).toBe(list[1]!);
    expect(findSection(list, "nothing-by-this-name")).toBeNull();
  });
});
