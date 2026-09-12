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
 * The film lets the first hop happen under the first page, puts the cannon
 * on the next square two and a half beats before the second hop and then
 * lets that one happen. That is the order the wave asks for and the opposite of
 * every reflex the pair has built up to here — *the box hunting the grid is
 * not it* — and it is why the third page is on her screen rather than his: he
 * cannot watch it arrive, which is the point of him having gone there.
 */
export const THE_WISP: GuideScene = {
  ticks: 1200,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "wisp", color: null }],
  acts: [
    { tick: 510, control: "cannon", col: 4 },
    { tick: 540, control: "cannon", col: 5 },
    { tick: 570, control: "cannon", col: 6 },
    { tick: 1010, control: "fireRed" },
  ],
  steps: [
    // Seven beats: the wisp arrives on the top row and the first page lets
    // its first hop happen, so it holds on row eight — in the middle of the
    // screen, with the next square already marked — rather than at the top.
    { tick: 0, seat: 2, text: "PLAYER 2 CALLS THE SQUARE", anchor: { at: "body" } },
    {
      tick: 420,
      seat: 1,
      text: "BE THERE BEFORE IT IS",
      anchor: { at: "control", control: "cannon" },
    },
    // The second hop lands on the beat this page opens.
    { tick: 720, seat: 2, text: "AND IT ARRIVES THERE", anchor: { at: "body" } },
    {
      tick: 920,
      seat: 2,
      text: "EITHER COLOUR KILLS IT",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
