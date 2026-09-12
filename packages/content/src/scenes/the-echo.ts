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
 *
 * The first page is one long look, fourteen beats, because a body page holds
 * with its body in the middle of the screen (`scene-pages.test.ts`) and an
 * echo is on row six only after it has divided twice: the pair watches it
 * come down slowly and come apart, sideways and then up and down, and the
 * page holds on the four pieces. The second echo enters at beat sixteen, so
 * the cannon is on its column before it exists, and the third division of
 * the first one — eight bodies — falls inside the last page, next to the
 * second one taken as one. That is the wave's whole argument in one frame.
 */
export const THE_ECHO: GuideScene = {
  ticks: 1260,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 1, kind: "echo", color: "cyan" },
    { beat: 16, col: 5, kind: "echo", color: "cyan" },
  ],
  acts: [
    { tick: 930, control: "cannon", col: 4 },
    { tick: 960, control: "cannon", col: 5 },
    // Fired at the tick whose bolt arrives *before* the second one's first
    // division, not merely before the division itself: a bolt takes about
    // three ticks a row and this one has thirteen rows to cross, so a shot
    // that looks early by the clock is a shot that arrives through the gap.
    { tick: 1110, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "ECHO · HALF SPEED, DIVIDING", anchor: { at: "body" } },
    {
      tick: 840,
      seat: 1,
      text: "BE ON THE NEXT ONE EARLY",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1020,
      seat: 2,
      text: "WHILE IT IS STILL ONE",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
