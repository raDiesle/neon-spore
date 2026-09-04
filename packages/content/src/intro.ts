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
 * The vocabulary is the game's and stays that way — hull, column, cannon,
 * shield, panel, wave, boss — because the pair has to be able to say these
 * words to each other over a voice channel an hour from now.
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
  /** One idea per line. Two at most: this is read standing up, on a phone. */
  lines: readonly string[];
  figure: IntroFigure;
}

export const INTRO_PAGES: readonly IntroPage[] = [
  {
    id: "two",
    title: "TWO OF YOU",
    lines: [
      "A co-op arcade game in space, for two people on two devices — two phones, two computers, or one of each.",
      "Neither screen shows what the other one shows. Neither of you can play it alone.",
    ],
    figure: "twoScreens",
  },
  {
    id: "voice",
    title: "TALKING IS THE CONTROL",
    lines: [
      "Each of you is given something the other one needs and cannot see. Say it out loud, and say it in time.",
      "The game never listens: the voice channel is yours, and a column is the word you both have.",
    ],
    figure: "voice",
  },
  {
    id: "field",
    title: "WHAT COMES DOWN THE COLUMNS",
    lines: [
      "A hull along the bottom, columns above it, and a queue of creatures with a mechanic each — one hides, one lies about its colour, one has to be swallowed rather than shot.",
      "Nothing you control travels. What moves is what is coming at you.",
    ],
    figure: "columns",
  },
  {
    id: "panel",
    title: "THE PANEL CHANGES UNDER YOU",
    lines: [
      "A wave brings its own controls. What your thumb did last wave may not be there this one.",
      "Some rounds take the whole screen and hand you something else entirely.",
    ],
    figure: "panel",
  },
  {
    id: "boss",
    title: "A BOSS IS A GAME OF ITS OWN",
    lines: [
      "Each one has its own rules, its own picture and its own way of being talked through — a small game inside the game.",
      "They are the waves you will want to tell somebody about.",
    ],
    figure: "boss",
  },
  {
    id: "run",
    title: "FOR AS LONG AS YOU LIKE",
    lines: [
      "Authored waves first, then waves that keep coming. Your furthest is remembered, so you can stop and pick it up again.",
      "Every run keeps its own count — and a perfect one is a thing to come back for.",
    ],
    figure: "run",
  },
];

/** How many pages the intro has. The nav bar and the host both ask. */
export const INTRO_PAGE_COUNT = INTRO_PAGES.length;
