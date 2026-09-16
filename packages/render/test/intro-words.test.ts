import { beforeAll, describe, expect, it } from "bun:test";
import { INTRO_LINES, INTRO_TITLE } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { drawIntroScene } from "../src/intro-scene.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

/**
 * **THE WORDS ON THE FIRST SCREEN, MEASURED RATHER THAN JUDGED.**
 *
 * The owner, 16 September 2026, having called the intro bad twice: *the text
 * must be very visible and readable*. That is the whole note, and it is worth
 * a measurement — a session that reads the file and decides the type looks
 * fine is the session that shipped it at 14px in the first place.
 *
 * So: a 360 px phone, which is the narrow end of what anybody is holding, and
 * three things held there. **The headline stands on one line** — it is the
 * pitch, and a pitch broken over two lines is two half-pitches. **Every
 * sentence stands on at most two** — its own file says so
 * (`content/src/intro.ts`), and a third line pushes the picture up into the
 * banner. **And nothing on the screen is set smaller than a sentence can be
 * read at**, which is the number this file exists to pin.
 *
 * Measured off the boxes the canvas recorded rather than off the constants, so
 * a font changed in one of the two places it is named still fails here. The
 * stub's `measureText` is `length × 0.6 × size`, which is exactly right for
 * the monospace the whole game is set in.
 */

const CFG = DEFAULT_CONFIG;
/** The narrow phone. Nothing in the shops is meaningfully thinner. */
const PHONE = { width: 360, height: 780, dpr: 2 };
/** The smallest a sentence of the pitch may be set. */
const READABLE = 16;

beforeAll(installCanvasGlobals);

/** Every word the scene draws at `age`, once everything has landed. */
function wordsAt(age: number): TextBox[] {
  const { ctx } = stubCanvas();
  const l = computeLayout(PHONE, CFG, "p1");
  ctx.texts = [];
  drawIntroScene(ctx as unknown as CanvasRenderingContext2D, l, age);
  const said = ctx.texts;
  ctx.texts = undefined;
  return said;
}

/** How long after a sentence arrives it has stopped moving (`text-drop.ts`). */
const SETTLED = 1.4;

describe("the words on the first screen", () => {
  it("stands the headline on one line of a 360px phone", () => {
    const words = wordsAt(SETTLED);
    const titled = words.filter((t) => INTRO_TITLE.includes(t.text));
    expect(titled.map((t) => t.text)).toEqual([INTRO_TITLE]);
  });

  it("stands every sentence on no more than two lines", () => {
    for (const line of INTRO_LINES) {
      const words = wordsAt(line.at + SETTLED);
      // The sentence is whatever was drawn that the sentence contains — it is
      // wrapped, so the boxes carry pieces of it and not the whole.
      const said = words.filter((t) => t.text.length > 3 && line.text.includes(t.text));
      expect(said.length, `"${line.text}"`).toBeGreaterThan(0);
      expect(said.length, `"${line.text}" is ${said.length} lines`).toBeLessThanOrEqual(2);
    }
  });

  it("sets every sentence large enough to read", () => {
    for (const line of INTRO_LINES) {
      const words = wordsAt(line.at + SETTLED);
      const said = words.filter((t) => t.text.length > 3 && line.text.includes(t.text));
      for (const one of said) {
        // `h` is the font's own size through the transform, in the layout's
        // own units — and the transform is settled by now, so this is the size
        // the sentence is set at rather than the one it was asked for.
        expect(one.h, `"${one.text}"`).toBeGreaterThanOrEqual(READABLE);
      }
    }
  });

  it("puts no word over either edge of the screen, at any moment it stands", () => {
    const l = computeLayout(PHONE, CFG, "p1");
    for (const line of INTRO_LINES) {
      for (const one of wordsAt(line.at + SETTLED)) {
        expect(one.x, `"${one.text}" off the left`).toBeGreaterThanOrEqual(0);
        expect(one.x + one.w, `"${one.text}" off the right`).toBeLessThanOrEqual(l.width);
      }
    }
  });
});
