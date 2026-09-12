import type { GuideScene } from "../scene-types.js";

/**
 * THE STRAND's rehearsal: two beads, and neither seat can name one alone.
 *
 * Every split before this one gives one seat something to say and the other
 * something to do. A thread gives each of them half of the same sentence: the
 * navigator is shown which bead is lit and no colour at all, the pilot is shown
 * the colours and no mark (`sim/strand.ts`), and the shot wants both halves.
 * So the film opens on the navigator's screen with the mark, turns to the
 * pilot's with the colours, and only then puts a hand on anything.
 *
 * **Two beads rather than three**, which is the shortest thread the simulation
 * will build. The lesson is the exchange, not the endurance: a pair who have
 * made the call once have met the creature, and a film long enough to make it
 * five times is a film nobody watches to the end.
 *
 * The cannon is carried to the lit bead on the pilot's page and the colour
 * pressed on the navigator's, in that order, because that is the order the two
 * halves of the sentence have to arrive in — the column is useless until
 * somebody has said which bead, and the colour is useless until the cannon is
 * under it.
 */
export const THE_STRAND: GuideScene = {
  ticks: 1440,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 1, col: 3, kind: "strand", color: "red", beads: 2 }],
  acts: [
    { tick: 1110, control: "cannon", col: 4 },
    { tick: 1290, control: "fireCyan" },
  ],
  steps: [
    // Fourteen beats: a strand falls a row every two, so the top bead is on
    // row six — the middle of the screen — only now.
    { tick: 0, seat: 2, text: "ONE BEAD IS LIT · SAY WHICH", anchor: { at: "body" } },
    { tick: 840, seat: 1, text: "PLAYER 1 SEES THE COLOURS", anchor: { at: "body" } },
    {
      tick: 1020,
      seat: 1,
      text: "CANNON UNDER THAT BEAD",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1200,
      seat: 2,
      text: "FIRE THE COLOUR YOU HEARD",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
