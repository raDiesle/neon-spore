import type { GuideScene } from "../scene-types.js";

/**
 * THE VEIL's rehearsal: the colour you were given goes stale while you are
 * loading it.
 *
 * A thundercloud with a body inside. Player 1 can see into it and player 2 has
 * a corner frame and nothing else — so the colour is a word one of them has to
 * say — and the twist is that the word expires: the body inside turns every
 * `veilMorphBeats`, on a clock both of them can count but only one of them can
 * read.
 *
 * Four pages: what he sees, what she sees, the turn itself, and the shot. The
 * third page is the one the film exists for, and it is not staged — the page
 * opens before a morph and closes after it, so what the pair watches is
 * `veilOnMorph` happening on its own clock while they are reading the words
 * about it.
 *
 * **Nothing here authors the colour.** What is inside a cloud is rolled when it
 * enters the field, because the only thing this game leaves random is what one
 * player knows and the other does not. The shot at the end is authored at a
 * tick, and which colour is correct at that tick is a measurement of this seed
 * rather than a choice — `test/scenes.test.ts` runs the whole film and fails
 * if the body ever reaches the hull, which is what a shot that stopped landing
 * would look like.
 */
export const THE_VEIL: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 1,
  // Column 3 is the middle, where the cannon already stands. There is no
  // sliding in this film at all: the wave is about a word rather than a place,
  // and a cannon crossing the screen would be the one thing moving while the
  // pages are about something that is not.
  entries: [{ beat: 0, col: 3, kind: "veil", color: null }],
  acts: [{ tick: 750, control: "fireCyan" }],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 SEES INSIDE", anchor: { at: "body" } },
    { tick: 220, seat: 2, text: "PLAYER 2 SEES A CLOUD", anchor: { at: "body" } },
    // The morph lands inside this page, on the cloud's own clock.
    { tick: 440, seat: 1, text: "AND IT TURNS AS IT FALLS", anchor: { at: "body" } },
    {
      tick: 660,
      seat: 2,
      text: "ASK AGAIN, THEN FIRE",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
