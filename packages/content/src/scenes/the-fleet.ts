import type { GuideScene } from "../scene-types.js";

/**
 * THE FLEET's rehearsal: the only one who can see the ships is the one who
 * cannot move the sights.
 *
 * A chart of squares over the water, lettered across and numbered down. Player
 * 1 has every ship on his and the only trigger; player 2 has the sights, moves
 * them one square a press, and is shown nothing but water. Neither half is
 * worth anything alone, and there is no field at all — the whole round is two
 * pictures of one grid.
 *
 * So the first two pages are the same instant on the two phones, which is the
 * shape every film about a split ends up with, and here it is the entire wave.
 * Then she walks the sights two squares and he fires into where they are
 * standing.
 *
 * **The sights open dead centre, on a ship.** That is the round's own doing
 * and the film walks away from it on purpose: a salvo fired from the opening
 * square would have hit without a word being said, which teaches the opposite
 * of *say the square, out loud, and keep saying it until it is under them*.
 * Two presses to the left is still the same ship, so what the film shows is a
 * pair arriving somewhere together rather than a lucky first shot.
 */
export const THE_FLEET: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: {
    kind: "fleet",
    ships: [
      { col: 1, row: 1, len: 5, dir: "h" },
      { col: 8, row: 0, len: 4, dir: "v" },
      { col: 3, row: 5, len: 3, dir: "h" },
      { col: 0, row: 6, len: 3, dir: "v" },
      { col: 7, row: 8, len: 2, dir: "h" },
    ],
  },
  acts: [
    { tick: 570, control: "aimLeft" },
    { tick: 630, control: "aimLeft" },
    { tick: 810, control: "salvo" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 SEES THE SHIPS", anchor: { at: "hull" } },
    { tick: 240, seat: 2, text: "PLAYER 2 SEES ONLY WATER", anchor: { at: "hull" } },
    {
      tick: 480,
      seat: 2,
      text: "PLAYER 2 WALKS THE SIGHTS",
      anchor: { at: "control", control: "aimLeft" },
    },
    {
      tick: 720,
      seat: 1,
      text: "PLAYER 1 FIRES THE SALVO",
      anchor: { at: "control", control: "salvo" },
    },
  ],
};
