import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { GuideScene } from "../scene-types.js";

/**
 * THE MAZE's rehearsal: he turns the wheel and she fires, and neither can do
 * the other half.
 *
 * A real maze of rings above the ship with one gap cut in its rim. Player 1
 * pulls the string and cannot fire; player 2 fires and cannot turn anything.
 * The caption says ONE WAY THROUGH rather than ONE WAY IN, because that is the
 * rule that outlives this first drum: every later sheet has more gaps in its
 * rim and still exactly one of them reaches the middle.
 * The film is one long turn that brings the gap from the top of the drum right
 * down to the ship, one lock and one shot, and then the shot crawling the
 * corridors it was let into, a crossing at a time, on the beat.
 *
 * **The hand stops on the click and does not carry past it.** The gap catches
 * a column and the wheel locks there — and the very next thing a hand does,
 * anywhere, unlocks it: `breakDetent` is what "pull again" means, and it fires
 * on movement rather than on a release. So the pull is authored to *end* where
 * the click is, which is the same thing a pair does with a real thumb, and it
 * is the one number in this film that had to be measured rather than reasoned
 * about. It is a long pull now — the drum opens with its gap as far from the
 * ship as it goes, which is the round — and 3900 is the displacement that ends
 * with the gap at the very bottom, on the middle column.
 *
 * **And the hand stays down through the shot.** Letting go breaks the detent
 * too, so a film that released before she fired would be a film about a column
 * that had already gone out.
 */
export const THE_MAZE: GuideScene = {
  ticks: 1500,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "maze", rounds: MAZE_ROUNDS },
  acts: [
    { tick: 400, drag: "mazeString", toMilli: 3900, by: 560, until: 900 },
    { tick: 620, control: "cannon", col: 2 },
    { tick: 660, control: "cannon", col: 3 },
    { tick: 700, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "ONE WAY THROUGH THE MAZE", anchor: { at: "hull" } },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 TURNS THE WHEEL",
      anchor: { at: "handle", target: "mazeString" },
    },
    {
      tick: 600,
      seat: 2,
      text: "PLAYER 2 FIRES UP THE COLUMN",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
