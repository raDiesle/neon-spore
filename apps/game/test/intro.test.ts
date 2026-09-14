import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { INTRO_BEATS, INTRO_LINE, INTRO_SCENE_SECONDS, INTRO_TITLE } from "@neon-spore/content";
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

  it("opens again when the intro is given a new version", () => {
    // The stored value is a version rather than a flag, so the day the intro
    // is rewritten enough to be worth showing again, saying so is one
    // character — and on 14 September 2026 it was. A device holding the old
    // number is a device that saw the six pages and has not seen the scene.
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
    expect(readFileSync(new URL("../src/canvas-sheets.ts", import.meta.url), "utf8")).toMatch(
      /hold: \(on\) => p\.run\.hold\("menu", on\)/,
    );
  });

  it("writes the version down when it closes, not when it opens", () => {
    // Closed early is still read: somebody who presses through it ten seconds
    // in has seen the front door and must not meet it again next visit.
    const closing = source.slice(source.indexOf("function close()"));
    expect(closing).toContain("localStorage.setItem(INTRO_KEY, INTRO_VERSION)");
    expect(source.slice(0, source.indexOf("function close()"))).not.toContain("setItem");
  });

  it("survives a browser that refuses to remember", () => {
    expect(source).toMatch(/localStorage\.setItem\(INTRO_KEY, INTRO_VERSION\);\s*\}\s*catch/);
  });

  it("paints the scene where the frame under it was painted", () => {
    // The renderer clips to the stage and translates to its corner, then hands
    // the canvas back at the window's origin. Painting straight onto that put
    // the intro against the left edge of a desktop window, with the field
    // showing to its right. The offset belongs to `viewport.ts`, which is the
    // same file `inStage` reads it from, so the two cannot disagree.
    expect(source).toContain("b.onStage(ctx,");
    const painting = source.slice(source.indexOf("over: (ctx, dt)"));
    expect(painting).not.toMatch(/drawIntroScene\(ctx,/);
  });

  it("is handed that offset by the one place that owns it", () => {
    expect(readFileSync(new URL("../src/main.ts", import.meta.url), "utf8")).toMatch(
      /const \{ layout, inStage, onStage, toClient \} = bindViewport\(/,
    );
  });

  it("is the front door before the menu, and hands the menu back afterwards", () => {
    expect(shell).toMatch(/opensIntro\(readIntroSeen\(\), true\)\)\s*p\.intro\.open\(toMenu\)/);
  });
});

describe("what the scene says", () => {
  it("is one scene with no stepper in it", () => {
    // The owner had the six pages and their BACK, NEXT and page count taken
    // out on 14 September 2026: a front door somebody has to operate is a
    // manual. Nothing is left here that turns a page, and nothing calls for
    // one — the host closes on a press anywhere and on the scene running out.
    // Read off the code rather than the prose: the comments above it say what
    // the six pages were, which is the one place those words still belong.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/\b(page|pages|next|back|skip)\b/i);
    expect(code).toContain("introOver(age)");
  });

  it("makes its argument twice, so it reads as a pattern", () => {
    // One beat is an instruction. Two is *this keeps happening*, which is the
    // thing the pair have to believe before they will get on a call.
    expect(INTRO_BEATS.length).toBe(2);
    expect(new Set(INTRO_BEATS.map((b) => b.id)).size).toBe(INTRO_BEATS.length);
    expect(new Set(INTRO_BEATS.map((b) => b.answer)).size).toBe(INTRO_BEATS.length);
  });

  it("shouts sentences somebody could actually shout", () => {
    // These are not captions about talking. They are the words one of them
    // will be saying out loud an hour from now, and the pair should recognise
    // themselves saying them.
    for (const beat of INTRO_BEATS) {
      expect(beat.shout.length, beat.id).toBeGreaterThan(0);
      expect(beat.shout.length, `${beat.id}: ${beat.shout}`).toBeLessThanOrEqual(18);
      expect(beat.shout, beat.id).toBe(beat.shout.toUpperCase());
    }
  });

  it("says each of them in order, with room to answer the last", () => {
    let last = 0;
    for (const beat of INTRO_BEATS) {
      expect(beat.at, beat.id).toBeGreaterThan(last);
      last = beat.at;
    }
    expect(last, "the last shout").toBeLessThan(INTRO_SCENE_SECONDS);
  });

  it("keeps the banner and the caption short enough for a phone", () => {
    // The owner's correction, in two numbers: *use much shorter text, could be
    // like advertisement.* Nobody reads a paragraph on a screen they have not
    // chosen yet, and a line that wraps three times on a phone is a paragraph
    // however it was written.
    expect(INTRO_TITLE.length).toBeLessThanOrEqual(30);
    expect(INTRO_LINE.length).toBeLessThanOrEqual(48);
  });

  it("says the thing the whole game rests on, in the game's own words", () => {
    const all = [INTRO_TITLE, INTRO_LINE, ...INTRO_BEATS.map((b) => b.shout)]
      .join(" ")
      .toLowerCase();
    // Two of them, two screens, and something said between them. A pitch that
    // left any of it out would be a pitch for a different game.
    for (const word of ["two", "phones", "talk", "shield"]) {
      expect(all, word).toContain(word);
    }
  });
});
