import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { INTRO_PAGES } from "@neon-spore/content";
import { INTRO_KEY, INTRO_VERSION, opensIntro } from "../src/intro.js";

/**
 * When the intro opens on its own, and what it says.
 *
 * The deciding is pure, so it can be tested in a runner with no DOM — the
 * same shape `progress.ts` takes, and the reason both files keep their four
 * lines of storage at the edge. The wiring below it is read out of the source
 * for `input-pc.test.ts`'s reason: there is no DOM here to drive.
 */

const source = readFileSync(new URL("../src/intro.ts", import.meta.url), "utf8");
const shell = readFileSync(new URL("../src/shell.ts", import.meta.url), "utf8");

describe("whether the intro is the front door", () => {
  it("opens on a device that has never seen it", () => {
    expect(opensIntro(null, true)).toBe(true);
  });

  it("does not open again once it has been read through", () => {
    expect(opensIntro(INTRO_VERSION, true)).toBe(false);
  });

  it("opens again when the pages are given a new version", () => {
    // The stored value is a version rather than a flag, so the day these six
    // pages are rewritten enough to be worth showing again, saying so is one
    // character. A device holding the old number is a device that has not
    // seen the new pages.
    expect(opensIntro("0", true)).toBe(true);
  });

  it("never opens where the menu itself would not", () => {
    // `?play=1` is the tester's door and what `tools/frames` photographs
    // through. A title screen in front of either is exactly the tap the menu
    // was careful not to add (`menu.ts`).
    expect(opensIntro(null, false)).toBe(false);
    expect(opensIntro(INTRO_VERSION, false)).toBe(false);
  });

  it("is remembered under a namespaced key, like everything else here", () => {
    expect(INTRO_KEY.startsWith("neon-spore.")).toBe(true);
  });
});

describe("the way it is wired", () => {
  it("takes the same hold the menu takes, so nothing is played behind it", () => {
    expect(readFileSync(new URL("../src/main.ts", import.meta.url), "utf8")).toMatch(
      /hold: \(on\) => run\.hold\("menu", on\)/,
    );
  });

  it("writes the version down when it closes, not when it opens", () => {
    // Closed early is still read: somebody who skips on page two has seen the
    // front door and must not meet it again on their next visit.
    const closing = source.slice(source.indexOf("function close()"));
    expect(closing).toContain("localStorage.setItem(INTRO_KEY, INTRO_VERSION)");
    expect(source.slice(0, source.indexOf("function close()"))).not.toContain("setItem");
  });

  it("survives a browser that refuses to remember", () => {
    expect(source).toMatch(/localStorage\.setItem\(INTRO_KEY, INTRO_VERSION\);\s*\}\s*catch/);
  });

  it("paints the pages where the frame under them was painted", () => {
    // The renderer clips to the stage and translates to its corner, then hands
    // the canvas back at the window's origin. Painting straight onto that put
    // the six pages against the left edge of a desktop window, with the field
    // showing to their right, while SKIP and NEXT went on answering a press one
    // stage offset away — so the only presses that reached a button were the
    // ones over the game. The offset belongs to `viewport.ts`, which is the
    // same file `inStage` reads it from, so the two cannot disagree.
    expect(source).toContain("b.onStage(ctx,");
    const painting = source.slice(source.indexOf("over: (ctx, dt)"));
    expect(painting).not.toMatch(/drawIntroPage\(ctx,/);
  });

  it("is handed that offset by the one place that owns it", () => {
    expect(readFileSync(new URL("../src/main.ts", import.meta.url), "utf8")).toMatch(
      /const \{ layout, inStage, onStage \} = bindViewport\(/,
    );
  });

  it("is the front door before the menu, and hands the menu back afterwards", () => {
    expect(shell).toMatch(/opensIntro\(readIntroSeen\(\), true\)\)\s*p\.intro\.open\(toMenu\)/);
  });
});

describe("what the pages say", () => {
  it("gives every page a title, a picture and one line", () => {
    expect(INTRO_PAGES.length).toBeGreaterThan(3);
    for (const page of INTRO_PAGES) {
      expect(page.title.length, page.id).toBeGreaterThan(0);
      expect(page.line.length, page.id).toBeGreaterThan(0);
    }
  });

  it("keeps every line short enough to be an advertisement", () => {
    // The owner's correction, in one number: *use much shorter text*. Nobody
    // reads a paragraph on a screen they have not chosen yet, and a line that
    // wraps three times on a phone is a paragraph however it was written.
    for (const page of INTRO_PAGES) {
      expect(page.line.length, `${page.id}: ${page.line}`).toBeLessThanOrEqual(48);
    }
  });

  it("prints a shout on every page's tag, short enough to fit across one", () => {
    // The owner's second correction, and his own comparison: *highlights in
    // banners like the advertising of price offers in a supermarket.* A tag is
    // sized to its text (`render/intro-flash.ts`), so a long one does not
    // overflow — it shrinks until nobody across the room can read it, which is
    // the only thing a sign is for.
    for (const page of INTRO_PAGES) {
      expect(page.flash.length, page.id).toBeGreaterThan(0);
      expect(page.flash.length, `${page.id}: ${page.flash}`).toBeLessThanOrEqual(12);
      expect(page.flash, page.id).toBe(page.flash.toUpperCase());
    }
  });

  it("names no page twice", () => {
    expect(new Set(INTRO_PAGES.map((p) => p.id)).size).toBe(INTRO_PAGES.length);
  });

  it("keeps a title short enough for a phone", () => {
    for (const page of INTRO_PAGES) {
      expect(page.title.length, page.title).toBeLessThanOrEqual(30);
    }
  });

  it("says the thing the whole game rests on, in the game's own words", () => {
    const all = INTRO_PAGES.flatMap((p) => [p.title, p.line])
      .join(" ")
      .toLowerCase();
    // Two people, and something said between them. A pitch that left either
    // out would be a pitch for a different game.
    for (const word of ["two", "voice"]) {
      expect(all, word).toContain(word);
    }
  });
});
