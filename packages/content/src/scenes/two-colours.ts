import type { GuideScene } from "../scene-types.js";

/**
 * TWO COLOURS' rehearsal: the wrong colour, then the right one.
 *
 * The wave's sentence is *the one where colour starts to matter*, and the only
 * way to show that a colour matters is to spend the other one. So the film
 * fires **red at a cyan bulb** and lets the pair watch nothing happen, then
 * fires cyan and lets them watch it come apart. Nothing about that is staged:
 * a shot of the wrong colour really is spent, and the rehearsal is the game's
 * own `fire` and `resolve` (`sim/scene.ts`).
 *
 * **The bulb is named here and the slick was not named in wave 1**, which is
 * the same rule read twice. A name for a kind of enemy teaches nothing until
 * there is a second kind to tell it from — wave 1 said ENEMY — and this is the
 * wave where the second kind arrives, so this is the wave where both get their
 * names. The colour is on the caption because the colour is the whole of the
 * difference: a bulb is always cyan and a slick is always red.
 *
 * Four pages, two per seat, and the switch sits exactly where the split does:
 * player 1 puts the cannon under it and player 2 chooses what comes out.
 */
export const TWO_COLOURS: GuideScene = {
  ticks: 990,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 5, color: "cyan" }],
  // Every press sits a beat and a half after the page that asks for it opens:
  // *before the slider starts moving it should briefly stay with the text.*
  acts: [
    { tick: 330, control: "cannon", col: 3 },
    { tick: 360, control: "cannon", col: 4 },
    { tick: 390, control: "cannon", col: 5 },
    { tick: 570, control: "fireRed" },
    { tick: 780, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "BULB · ALWAYS CYAN", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 MOVES CANNON",
      anchor: { at: "control", control: "cannon" },
    },
    // The page that is the wave. It points at RED, which is the button *not*
    // to press — the one page in any of these films whose subject is a mistake,
    // and the reason it can be a page at all is that the mistake is playable:
    // the bolt goes up, meets the bulb and is gone.
    {
      tick: 480,
      seat: 2,
      text: "RED IS SPENT ON IT",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 690,
      seat: 2,
      text: "PLAYER 2 FIRES CYAN",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
