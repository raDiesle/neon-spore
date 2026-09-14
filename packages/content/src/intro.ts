/**
 * WHAT THIS GAME IS, IN ONE SCENE.
 *
 * The first thing a pair sees, once, before they have chosen anything — and
 * again from the menu or the room screen whenever one of them wants it. It is
 * not a tutorial: a wave's own guide teaches a wave (`scenes.ts`), and the
 * menu is the reference. This is the pitch, and the question it answers is the
 * one somebody sent a link has: *what is this, and why does it need two of us?*
 *
 * **One scene, and it explains one thing.** Two phones, one game, and the
 * players talk. It used to be six pages with a BACK, a NEXT and a page count —
 * the field, the panel, the bosses and the endless run each argued on a page of
 * their own — and the owner asked for all of it to go on 14 September 2026: a
 * front door with a stepper on it is a manual, and nobody reads a manual for a
 * game they have not chosen yet. What is left is a picture that plays through
 * on its own and one press that ends it early.
 *
 * The argument is made twice, in the game's own words: one player sees
 * something the other cannot, shouts across, and the other one moves the
 * control that answers it. `SHOOT NOW` and a finger on fire; `MOVE THE SHIELD`
 * and a shield sliding. That is the whole game, and nothing else here claims
 * anything the pair will have to be told twice.
 *
 * Data rather than markup for the reason every other authored thing here is:
 * it is drawn on the game's own canvas, in the game's own language, so the
 * screen a pair meets first looks like the screen they will be playing on.
 * `packages/render/src/intro-scene.ts` draws it; nothing in this file knows a
 * pixel.
 *
 * The vocabulary is the game's and stays that way — shield, hull, wave —
 * because the pair has to be able to say these words to each other over a
 * voice channel an hour from now.
 */

/** Which control the one who is listening reaches for. */
export type IntroAnswer = "fire" | "shield";

export interface IntroBeat {
  /** Stable, so a test can name a beat without counting. */
  id: string;
  /**
   * What is shouted across the room, in the words a real pair uses.
   *
   * Short, upper case and sayable at volume: this is not a caption about
   * talking, it is the sentence one of them will actually shout an hour from
   * now, and the pair should recognise it when they hear themselves say it.
   */
  shout: string;
  /** What the other one moves when they hear it. */
  answer: IntroAnswer;
  /** Seconds into the scene the shout leaves the speaker. */
  at: number;
}

/**
 * The two beats, in order. Two rather than one because one is an instruction
 * and two is a pattern — the second is what says *this keeps happening*.
 */
export const INTRO_BEATS: readonly IntroBeat[] = [
  { id: "shoot", shout: "SHOOT NOW", answer: "fire", at: 1.6 },
  { id: "shield", shout: "MOVE THE SHIELD", answer: "shield", at: 5.4 },
];

/** Seconds a shout takes to cross the gap between the two of them. */
export const INTRO_CROSS = 1.2;
/** Seconds the one who hears it takes to find the control and move it. */
export const INTRO_ANSWER = 1.5;

/** The headline over the scene. One line on a phone, and the whole pitch. */
export const INTRO_TITLE = "TWO PHONES, ONE GAME";
/** The sentence under the picture. Shorter than a breath. */
export const INTRO_LINE = "Different screens. Talk, or lose.";
/** The shout on the tag, in the voice a shop window uses. */
export const INTRO_FLASH = "2 PLAYERS!";

/**
 * How long the scene runs before it closes itself, in seconds.
 *
 * Past the last answer with a moment to spare: the second beat lands at
 * `at + INTRO_CROSS + INTRO_ANSWER`, and what is left after that is the pair
 * standing there having just played a round together, which is the picture
 * worth ending on.
 */
export const INTRO_SCENE_SECONDS = 10.5;
