/**
 * WHAT THIS GAME IS, IN SIX PAGES.
 *
 * The first thing a pair sees, once, before they have chosen anything — and
 * again from the menu or the room screen whenever one of them wants it. It is
 * not a tutorial: a wave's own guide teaches a wave (`scenes.ts`), and
 * `HOW TO PLAY` in the menu is the reference. This is the pitch, and the
 * question it answers is the one somebody sent a link has: *what is this, and
 * why does it need two of us?*
 *
 * Data rather than markup for the reason every other authored thing here is:
 * it is drawn on the game's own canvas, in the game's own language, so the
 * screen a pair meets first looks like the screen they will be playing on.
 * `packages/render/src/intro-page.ts` draws one of these; nothing in this file
 * knows a pixel.
 *
 * The vocabulary is the game's and stays that way — column, panel, wave, boss
 * — because the pair has to be able to say these words to each other over a
 * voice channel an hour from now. It is an advertisement rather than a
 * manual: one line a page, and the pictures carry the rest.
 */

/**
 * The picture on a page. Each is a small drawing in the game's own parts, and
 * the drawing is the argument: two screens that differ, a word crossing
 * between them, a column with something coming down it.
 */
export type IntroFigure = "twoScreens" | "voice" | "columns" | "panel" | "boss" | "run";

export interface IntroPage {
  /** Stable, so a test can name a page without counting. */
  id: string;
  title: string;
  /**
   * One line, and a short one.
   *
   * The owner's correction, after the first version ran to two paragraphs a
   * page: *use much shorter text, could be like advertisement.* Nobody reads a
   * paragraph on a screen they have not chosen yet — what a first screen can
   * do is land one idea and get out of the way. The picture beside it is doing
   * most of the work anyway.
   */
  line: string;
  /**
   * The shout on the page's tag, in the voice a shop window uses.
   *
   * The owner's correction, and his own comparison: *highlights in banners
   * like the advertising of price offers in a supermarket.* A page of even
   * type reads as a manual however short the sentences are — what a shop does
   * instead is take the one number worth stopping for and print it enormous on
   * a starburst, and that is what this is. Two or three words, an exclamation
   * mark, and nothing that has to be read twice.
   *
   * Never a figure this file cannot stand behind. A tag is the loudest thing
   * on the screen, and a loud claim that is not true is the only kind anybody
   * remembers.
   */
  flash: string;
  figure: IntroFigure;
}

export const INTRO_PAGES: readonly IntroPage[] = [
  {
    id: "two",
    title: "TWO OF YOU",
    line: "Two players. Two screens. One voice.",
    flash: "2 PLAYERS!",
    figure: "twoScreens",
  },
  {
    id: "voice",
    title: "SAY IT OUT LOUD",
    line: "You see it. They shoot it. Talk fast.",
    flash: "OUT LOUD!",
    figure: "voice",
  },
  {
    id: "field",
    title: "IT KEEPS COMING",
    line: "Slimes, liars and rocks. All at once.",
    flash: "NON-STOP!",
    figure: "columns",
  },
  {
    id: "panel",
    title: "THE BUTTONS MOVE",
    line: "New wave, new controls. Good luck.",
    flash: "ALL NEW!",
    figure: "panel",
  },
  {
    id: "boss",
    title: "BOSSES ARE LITTLE GAMES",
    line: "Nine of them, and each one is its own.",
    flash: "MINI GAMES!",
    figure: "boss",
  },
  {
    id: "run",
    title: "IT NEVER ENDS",
    line: "Endless waves. Come back whenever.",
    flash: "NO END!",
    figure: "run",
  },
];

/** How many pages the intro has. The nav bar and the host both ask. */
export const INTRO_PAGE_COUNT = INTRO_PAGES.length;
