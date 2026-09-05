import type { GuideScene } from "../scene-types.js";

/**
 * CYAN's rehearsal: the second button, and the cost of the first one.
 *
 * FIRST STEP is played on STANDARD 1, where player 2 has red and nothing else,
 * and this is the wave that hands them the other one — so the film is the first
 * film again with one thing changed, which is the whole of what a rung of the
 * ladder is for (`control-sets-table.ts`). The cannon still goes under the
 * column, the other seat still fires; what is new is that there is a choice
 * about *what* leaves it, and the body says which.
 *
 * **So the wrong colour is shown, and it is shown here rather than later.** A
 * second button only means anything if pressing the first one costs something,
 * and the wave that hands it over is the wave where that is true for the first
 * time. Nothing about it is staged: a shot of the wrong colour really is spent,
 * and the rehearsal is the game's own `fire` and `resolve` (`sim/scene.ts`).
 *
 * **The kill comes first and the mistake second, which is a correction.** It
 * used to be the other way round, on the argument that a page about a mistake
 * is more legible before the pair has seen anything work. It is not: a film
 * whose first shot fails has taught the pair nothing to fail *against*. The
 * owner's instruction was to move it — *change "red is spent on it" to come
 * after the cyan shot; let another cyan enemy approach, then explain on the
 * second cyan that it has no effect*. So page three is cyan working and page
 * four is red on the identical body, which is the comparison the wave is made
 * of and cannot be drawn any other way.
 *
 * **Two bodies rather than one, in the same column.** The second is what makes
 * the fourth page playable at all — the first is already gone — and the lane is
 * shared on purpose: the cannon does not move again, so nothing between the two
 * shots is different except the colour that left the muzzle. It is also what
 * the wave itself is, two cyan arrivals and nothing else.
 *
 * **The caption says CYAN ENEMY and not the creature's name**, which is the
 * owner's correction and the same rule wave 1 read once already: a name for a
 * kind of enemy teaches nothing until there is a second kind to tell it from,
 * and the thing this page is about is the colour. A pair holding "bulb" as well
 * is holding a word the wave never asks them to say.
 *
 * Five pages. Four belong to a seat and the last is the one page a film may
 * spend on what both screens share — the bar dropping when the body red was
 * wasted on arrives (`test/scenes.test.ts`).
 */
export const CYAN: GuideScene = {
  ticks: 1380,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 5, color: "cyan" },
    { beat: 5, col: 5, color: "cyan" },
  ],
  // Every press sits a beat and a half after the page that asks for it opens:
  // *before the slider starts moving it should briefly stay with the text.*
  acts: [
    { tick: 330, control: "cannon", col: 3 },
    { tick: 360, control: "cannon", col: 4 },
    { tick: 390, control: "cannon", col: 5 },
    { tick: 570, control: "fireCyan" },
    { tick: 810, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "CYAN ENEMY", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 MOVES CANNON",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 480,
      seat: 2,
      text: "PLAYER 2 FIRES CYAN",
      anchor: { at: "control", control: "fireCyan" },
    },
    // The page that is the wave. It points at RED, which is the button *not*
    // to press — the one page in any of these films whose subject is a mistake,
    // and the reason it can be a page at all is that the mistake is playable:
    // the bolt goes up, meets a bulb that is exactly the one the pair just
    // killed, and is gone.
    {
      tick: 720,
      seat: 2,
      text: "RED IS SPENT ON IT",
      anchor: { at: "control", control: "fireRed" },
    },
    // And what that costs, which is the half a page about a wasted shot can
    // never say on its own: the body is still coming, and it arrives. It stays
    // on player 2's screen because the colour was player 2's to choose.
    { tick: 1020, seat: 2, text: "AND IT REACHES THE HULL", anchor: { at: "health" } },
  ],
};
