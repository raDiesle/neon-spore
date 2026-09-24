/**
 * The sentences a player reads outside a wave: the card a bad line puts up,
 * and the three cards the menu offers for choosing a screen.
 *
 * They are drawn by `apps/game` (`hold.ts`, `menu-seats.ts`) and written here,
 * because `tools/words` holds every sentence a player reads to the same rules
 * and cannot import `apps/game` without pulling in the DOM. Written beside the
 * code that draws them, they were the six strings the check never saw, and all
 * six had drifted from the register the guides are written in.
 */

export interface LinkWords {
  title: string;
  what: string;
}

/** One card per bad line: gone for good, this phone reaching again, the other gone quiet. */
export const LINK_WORDS: Record<"lost" | "away" | "quiet", LinkWords> = {
  lost: {
    title: "THE CONNECTION IS GONE",
    what: "Nothing is reaching the room any more. Open the room screen to type the code again, or leave and carry on alone.",
  },
  away: {
    title: "REACHING THE ROOM AGAIN",
    what: "This phone lost its line, not the game. It is calling the room again. The room keeps your place a few seconds more.",
  },
  quiet: {
    title: "THE OTHER PHONE HAS GONE QUIET",
    what: "Still connected, and the field is holding still until it speaks again. Wait for it, or leave the room and pick this up later.",
  },
};

export interface ScreenWords {
  name: string;
  what: string;
}

/** Whose screen each card is, and the sentence under it. */
export const SCREEN_WORDS: Record<"p1" | "p2" | "test", ScreenWords> = {
  p1: { name: "PLAYER 1", what: "Slides the cannon, opens the maw, triggers the shield." },
  p2: { name: "PLAYER 2", what: "Slides the shield, fires red and cyan." },
  test: { name: "ONE SCREEN", what: "Both bands and the test rig, for one person at a desk." },
};
