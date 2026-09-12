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
 * Four pages: what player 1 sees, what player 2 sees, the turn, and the shot.
 * The third page is the one the film exists for, and it is not staged: a morph
 * lands on its own clock (`veilOnMorph`) on the tick before the page opens, so
 * player 1, who read the inside on the first page, opens the third to a body
 * that is the other colour now — the word went stale between two looks, which
 * is the wave. It used to open before the morph and close after it; since 12
 * September 2026 every page about a body holds with that body in the middle
 * of the screen (the owner: *when tutorials stop, the explained enemy should
 * be around the middle of the screen, not the top*), and three such pages on
 * one falling cloud leave no room for a page that both opens and closes
 * around the second morph.
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
  ticks: 1020,
  bpm: 120,
  seed: 1,
  // Column 3 is the middle, where the cannon already stands. There is no
  // sliding in this film at all: the wave is about a word rather than a place,
  // and a cannon crossing the screen would be the one thing moving while the
  // pages are about something that is not.
  entries: [{ beat: 0, col: 3, kind: "veil", color: null }],
  // A beat and ten ticks after the last page opens rather than the beat and a
  // half every other press waits: the cloud is on row thirteen by then, and
  // the shot has to land before it does.
  acts: [{ tick: 850, control: "fireCyan" }],
  // The three pages about the body hold with it on rows six, nine and twelve.
  // The first morph (beat five) lands inside the first page — player 1, who
  // can see inside, watches it — and the second (beat ten) on the tick before
  // the third page opens.
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 SEES INSIDE", anchor: { at: "body" } },
    { tick: 420, seat: 2, text: "PLAYER 2 SEES A CLOUD", anchor: { at: "body" } },
    { tick: 600, seat: 1, text: "IT TURNED WHILE IT FELL", anchor: { at: "body" } },
    {
      tick: 780,
      seat: 2,
      text: "ASK AGAIN, THEN FIRE",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
