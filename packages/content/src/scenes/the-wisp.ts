import type { GuideScene } from "../scene-types.js";

/**
 * THE WISP's rehearsal: you call the square it is still falling toward.
 *
 * A wisp is drawn on player 2's screen and on nobody else's, it never comes
 * down at anybody, and the square it will jump to next is marked from the
 * moment it lands. So the whole of the wave is one sentence said early: the
 * square she names is where it is *going*, and he has the entire dwell to be
 * standing there before it exists.
 *
 * The film puts the cannon on the square two beats before the hop and then
 * lets the hop happen. That is the order the wave asks for and the opposite of
 * every reflex the pair has built up to here — *the box hunting the grid is
 * not it* — and it is why the third page is on her screen rather than his: he
 * cannot watch it arrive, which is the point of him having gone there.
 */
export const THE_WISP: GuideScene = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "wisp", color: null }],
  acts: [
    { tick: 270, control: "cannon", col: 4 },
    { tick: 300, control: "cannon", col: 5 },
    { tick: 330, control: "cannon", col: 6 },
    { tick: 650, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "PLAYER 2 CALLS THE SQUARE", anchor: { at: "body" } },
    {
      tick: 180,
      seat: 1,
      text: "BE THERE BEFORE IT IS",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 360, seat: 2, text: "AND IT ARRIVES THERE", anchor: { at: "body" } },
    {
      tick: 560,
      seat: 2,
      text: "EITHER COLOUR KILLS IT",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
