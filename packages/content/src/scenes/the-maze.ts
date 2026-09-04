import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { GuideScene } from "../scene-types.js";

/**
 * THE MAZE's rehearsal: he turns the wheel and she fires, and neither can do
 * the other half.
 *
 * A wheel of rings above the ship with ways in cut round its rim, only one of
 * which reaches the middle — and neither of them is told which. Player 1 pulls
 * the string and cannot fire; player 2 fires and cannot turn anything. The film
 * is one turn, one lock and one shot, and then the shot walking the route it
 * was let into, a ring at a time, on the beat.
 *
 * **The hand stops on the click and does not carry past it.** A way in catches
 * a column and the wheel locks there — and the very next thing a hand does,
 * anywhere, unlocks it: `breakDetent` is what "pull again" means, and it fires
 * on movement rather than on a release. So the pull is authored to *end* where
 * the click is, which is the same thing a pair does with a real thumb, and it
 * is the one number in this film that had to be measured rather than reasoned
 * about.
 *
 * **And the hand stays down through the shot.** Letting go breaks the detent
 * too, so a film that released before she fired would be a film about a column
 * that had already gone out.
 */
export const THE_MAZE: GuideScene = {
  ticks: 1320,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "maze", rounds: MAZE_ROUNDS },
  acts: [
    { tick: 400, drag: "mazeString", toMilli: 225, by: 520, until: 900 },
    { tick: 600, control: "cannon", col: 3 },
    { tick: 640, control: "cannon", col: 4 },
    { tick: 820, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "A WHEEL OF RINGS", anchor: { at: "hull" } },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 TURNS THE WHEEL",
      anchor: { at: "handle", target: "mazeString" },
    },
    {
      tick: 680,
      seat: 2,
      text: "PLAYER 2 FIRES THE LIT ONE",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
