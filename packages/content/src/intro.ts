/**
 * WHAT THIS GAME IS, IN ONE SCENE.
 *
 * The first thing a pair sees, once, before they have chosen anything — and
 * again from the menu or the room screen whenever one of them wants it. It is
 * not a tutorial: a wave's own guide teaches a wave (`scenes.ts`), and the
 * menu is the reference. This is the pitch, and the question it answers is the
 * one somebody sent a link has: *what is this, and why does it need two of us?*
 *
 * **It is about the two of you, and not about either screen.** The owner, 15
 * September 2026: *the intro focus should be that it is a co-op game, people
 * have shared controls, and it is mandatory to have voice communication —
 * sitting in the same room or on a voice chat. How the game looks or what is
 * shown on the mobile is not relevant.* So the scene that used to hold up two
 * phones and show what was drawn on each of them holds up the two people
 * instead: one ship, its controls split between them, and their voices crossing
 * the gap. Nothing here claims anything about a wave, a creature or a boss.
 *
 * **And it is slow.** Four sentences, each standing long enough to be read by
 * somebody who has not seen it before and is reading it aloud to the person
 * they are about to play with — the owner again, the same day: *the text shown
 * should stay longer, that it is enough time to follow*. A front door is read
 * once and it is read out loud; the whole of it takes about as long as saying
 * it does.
 *
 * It used to be six pages with a BACK, a NEXT and a page count, and the owner
 * had all of it taken out on 14 September 2026: a front door with a stepper on
 * it is a manual, and nobody reads a manual for a game they have not chosen
 * yet. That is unchanged — it plays through on its own, and one press anywhere
 * ends it early.
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

/** Which half of the ship's controls a shout asks for. */
export type IntroAnswer = "fire" | "shield";

/** Which of the two people something belongs to, in the seats' own numbers. */
export type IntroSeat = 1 | 2;

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
  /** Who says it. The other one is the one who can answer it. */
  from: IntroSeat;
  /** Which half of the controls the one who is listening reaches for. */
  answer: IntroAnswer;
  /** Seconds into the scene the shout leaves the speaker. */
  at: number;
}

/**
 * **Who holds which half.** Player one's thumb is on the shield, player two's
 * on the cannon — one ship, one set of controls, and a seam down the middle
 * neither of them can reach across. It is written here rather than implied by
 * the beats because the picture and the words both read it, and a scene where
 * the shout crosses one way and the control lights the other is a pair who are
 * not listening to each other.
 */
export const INTRO_SIDES: Readonly<Record<IntroAnswer, IntroSeat>> = { shield: 1, fire: 2 };

/**
 * The two beats, in order, and they go **both ways**.
 *
 * Two rather than one because one is an instruction and two is a pattern; and
 * opposite ways round because the pattern is the point — each of them can see
 * something the other has to act on, so neither is the one giving the orders.
 */
export const INTRO_BEATS: readonly IntroBeat[] = [
  { id: "shoot", shout: "SHOOT NOW", from: 1, answer: "fire", at: 6.4 },
  { id: "shield", shout: "SHIELD, LEFT", from: 2, answer: "shield", at: 12.6 },
];

/**
 * **Seconds the caller spends reading their own screen before they speak.**
 *
 * The first of the four moments the scene is, and the one it did not have: the
 * owner, 16 September 2026 — *they first look, then they call, then the other
 * ones listen and performs what he was told to do so*. Without it a shout has
 * no cause, and the pair reads as two people reciting rather than as one
 * telling the other something only they can see.
 *
 * Long enough to be a moment and not a flicker. A beat's look runs from
 * `at - INTRO_LOOK` to `at`, so no beat may be shouted before this much of the
 * scene has passed — held by this file's own test.
 */
export const INTRO_LOOK = 1.5;
/** Seconds a shout takes to cross the gap between the two of them. */
export const INTRO_CROSS = 1.3;
/** Seconds the one who hears it takes to find the control and move it. */
export const INTRO_ANSWER = 1.6;

/** One sentence, and how long it is left standing. */
export interface IntroLine {
  /** Stable, so a test can name a line without counting. */
  id: string;
  /** What it says. One sentence, and no more than two lines on a phone. */
  text: string;
  /** Seconds into the scene it arrives. */
  at: number;
}

/**
 * **The four sentences, in the order they are read.**
 *
 * Each stands until the next one arrives, and the gap is not a guess: read one
 * of these out loud at the speed somebody reads a screen they have not seen
 * before, and it takes about two seconds. Four and a half is that, twice, which
 * is what *enough time to follow* means for a person who is also looking at a
 * picture and talking to somebody else.
 *
 * The order is the argument: what the game does to the controls, what that
 * means for each of them, what they therefore have to do about it, and what
 * happens if they do not.
 */
export const INTRO_LINES: readonly IntroLine[] = [
  { id: "one", text: "One ship. Two of you. Nobody is the passenger.", at: 0.9 },
  { id: "split", text: "Its controls are split: you hold half, they hold half.", at: 5.4 },
  { id: "talk", text: "So you talk. One room, or a voice call — out loud.", at: 10.2 },
  { id: "must", text: "Quiet players lose the ship. That is the whole game.", at: 15.0 },
];

/** How long the last sentence is left standing before the scene closes. */
const LAST_LINE_HELD = 4.6;

/**
 * How long the scene runs before it closes itself, in seconds.
 *
 * Derived rather than typed: it is the last sentence plus the time it is held,
 * so a line moved or added carries the end of the scene with it. Past the last
 * answer with room to spare either way — the second beat lands at
 * `at + INTRO_CROSS + INTRO_ANSWER`, and what is left after that is the pair
 * standing there having just flown the thing together, which is the picture
 * worth ending on.
 */
export const INTRO_SCENE_SECONDS =
  Math.max(
    ...INTRO_LINES.map((line) => line.at),
    ...INTRO_BEATS.map((beat) => beat.at + INTRO_CROSS + INTRO_ANSWER - LAST_LINE_HELD),
  ) + LAST_LINE_HELD;

/** The headline over the scene. One line on a phone, and the whole pitch. */
export const INTRO_TITLE = "ONE SHIP, TWO OF YOU";
/** The shout on the tag, in the voice a shop window uses. */
export const INTRO_FLASH = "2 PLAYERS!";
