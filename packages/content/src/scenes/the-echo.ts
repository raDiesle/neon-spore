import type { GuideScene } from "../scene-types.js";

/**
 * THE ECHO's rehearsal: the slowest thing on the field is the one to take
 * first.
 *
 * Half speed down, and it comes apart while it falls — sideways first, then
 * up and down — so a body left alone becomes two, then four, and every wait
 * is another body to visit. The wave's instruction is one line: *have the
 * cannon on it while it is still one*.
 *
 * The only way to teach that is to show both, so the film runs two. The first
 * is left alone on the left of the field and simply divides while the pair
 * reads about it; the second is taken on its first pass, before it has ever
 * split. Neither is staged — the divisions are `echoSplitPhase` on its own
 * clock, and the shot at the end is authored at a tick that falls before the
 * second one's first division rather than at a moment somebody drew.
 */
export const THE_ECHO: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 1, kind: "echo", color: "cyan" },
    { beat: 10, col: 5, kind: "echo", color: "cyan" },
  ],
  acts: [
    { tick: 550, control: "cannon", col: 4 },
    { tick: 610, control: "cannon", col: 5 },
    // Fired at the tick whose bolt arrives *before* the second one's first
    // division, not merely before the division itself: a bolt takes about
    // three ticks a row and this one has thirteen rows to cross, so a shot
    // that looks early by the clock is a shot that arrives through the gap.
    { tick: 780, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "ECHO · HALF SPEED DOWN", anchor: { at: "body" } },
    { tick: 220, seat: 1, text: "AND IT COMES APART", anchor: { at: "body" } },
    {
      tick: 460,
      seat: 1,
      text: "BE ON THE NEXT ONE EARLY",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 690,
      seat: 2,
      text: "WHILE IT IS STILL ONE",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
