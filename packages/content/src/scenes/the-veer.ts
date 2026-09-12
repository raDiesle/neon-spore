import type { GuideScene } from "../scene-types.js";

/**
 * THE VEER's rehearsal: the column stops being true while you are saying it.
 *
 * Every rock before this one is a number said once. The pilot reads it off the
 * strip, the navigator carries the dome there, and the call is still true when
 * the rock lands — which is why a pair who have learned the ward park the
 * shield and stop looking. This one steps one to four lanes to one side every
 * three rows, all the way down (`sim/veer.ts`), and the arrow saying which way
 * is drawn on the pilot's screen alone.
 *
 * So the film is the same rock on both phones, twice, and the difference
 * between the two pictures is the whole creature: page one is the pilot's, with
 * the arrow standing over the rider; page two is the navigator's, with the rock
 * and no arrow at all. Neither page asks for a hand — there is nothing to do
 * about a rock four rows up but read it and say it.
 *
 * The dome then moves **twice**, and that is the lesson rather than the
 * choreography. The first carry is the navigator's page and has a hand on it;
 * the second is one beat before the rock lands, after its last change of lane,
 * and happens while the pilot's page is up. That is the honest picture: the
 * navigator goes on moving after the page about moving has been read, because
 * the rock goes on stepping. Both carries are `atBody` — the film cannot know
 * where a rolled step lands, and neither can the pair.
 */
export const THE_VEER: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  // Column 3 of the seven a wave is authored in — the middle of the field, so
  // the rock has room to step either way and the arrow is worth reading. One
  // beat in, so the page's words are on the screen before anything falls.
  entries: [{ beat: 1, col: 3, kind: "veer", color: null }],
  acts: [
    { tick: 750, control: "shield", col: 3, atBody: true },
    // Fifty ticks after its page opens, less than the beat and a half the
    // other films give, because the rock lands on tick 899 whatever the
    // pages do and the three before this one are at the shortest a page
    // may be.
    { tick: 855, control: "shield", col: 3, atBody: true },
    { tick: 890, control: "guard" },
  ],
  steps: [
    // Eight beats: the rock has stepped three times and holds on row six, in
    // the middle of the screen.
    { tick: 0, seat: 1, text: "THE ARROW IS ITS NEXT STEP", anchor: { at: "body" } },
    { tick: 480, seat: 2, text: "PLAYER 2 SEES NO ARROW", anchor: { at: "body" } },
    {
      tick: 660,
      seat: 2,
      text: "CARRY THE DOME · NEVER PARK",
      anchor: { at: "control", control: "shield" },
    },
    {
      tick: 840,
      seat: 1,
      text: "FIRE IT AS IT LANDS",
      anchor: { at: "control", control: "guard" },
    },
  ],
};
