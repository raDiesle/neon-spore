import { describe, expect, it } from "bun:test";
import { CATALOGUE, MOTIONS } from "@neon-spore/shape-sheet";
import { page } from "../shapes-page.js";

/**
 * The page a cloud session hands to a phone.
 *
 * What can go wrong with it is not the geometry — `shape-sheet`'s own tests
 * cover that — but the handover: a shape silently missing from the page, or an
 * asset the page expects to fetch. A published page that reaches for a file
 * that is not there does not fail loudly; it renders half of itself, and
 * whoever opened it reads the gap as the catalogue being smaller than it is.
 */
describe("the shapes page", () => {
  /**
   * Case-insensitively, because the page is a *bundle*: a name a subject
   * computes with `kind.toUpperCase()` is in it as the lower-case kind the
   * catalogue holds, and never as the label a reader will see. Matching case
   * here looked stricter and was not — every living kind's name was passing on
   * an unrelated string that happened to contain it, and the day that string
   * went, "SHELL" turned out never to have been checked at all.
   */
  it("carries every shape and every spare motion", () => {
    const carried = page.toLowerCase();
    for (const entry of CATALOGUE) {
      expect(carried, entry.subject.name).toContain(entry.subject.name.toLowerCase());
    }
    for (const motion of MOTIONS) expect(carried, motion.name).toContain(motion.name.toLowerCase());
  });

  it("says which idea each draft is offered to", () => {
    for (const entry of CATALOGUE) {
      if (entry.suggests) expect(page).toContain(entry.suggests);
    }
  });

  it("is one file: nothing fetched but the two faces", () => {
    expect(page).not.toContain("<script src=");
    const hosts = [...page.matchAll(/https?:\/\/([^/"' ]+)/g)].map((m) => m[1]);
    for (const host of hosts) {
      expect([
        "fonts.googleapis.com",
        "fonts.gstatic.com",
        "www.w3.org",
        "creativecommons.org",
      ]).toContain(host ?? "");
    }
  });

  it("names itself, so a tab and a gallery card have something to show", () => {
    expect(page).toContain("<title>");
  });
});
