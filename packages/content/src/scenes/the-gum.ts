import type { GuideScene } from "../scene-types.js";

/**
 * THE GUM's rehearsal: it sticks, the cannon is parked under it, and a swipe
 * toward the near wall takes it off.
 *
 * What the pair has to learn is that the seats are the wrong way round for
 * once — the one with the cannon cannot swipe, the one who can swipe has no
 * cannon — and that a gum does not budge until the cannon is under it. Both
 * read off the picture: the cannon slides under the gum on one page and the
 * gum comes off on the next, and nothing happened to it in between.
 *
 * **One gum and nothing else**, for THE CRYSTAL's reason: the wave sends
 * three with plain bodies behind them, and the film is about the swipe.
 *
 * 120 to the minute, so the whole fall fits a film: a gum comes down at a
 * slick's pace and the ship's row is fifteen beats away. The wrong swipe is
 * shown before the right one, because the wrong one has a price and a film
 * that only shows the answer leaves the price to be found on the wave. The ghost hand is
 * player 2's, at the gum, for the drag act's seat (`scene-drag.ts`), and the
 * swipe goes **left** because authored column 1 lands nearer the left wall.
 */
export const THE_GUM: GuideScene = {
  ticks: 1900,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 1, kind: "gum", color: null }],
  acts: [
    { tick: 1150, control: "cannon", col: 1, atBody: true },
    // The wrong way first, so the price is on the screen before the answer:
    // the smear gets a lane wider, the hand lifts, and the same hand goes the
    // other way and it comes off.
    { tick: 1340, drag: "gum", col: 1, dir: 1, by: 1400, until: 1480 },
    { tick: 1600, drag: "gum", col: 1, dir: -1, by: 1660, until: 1740 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "NO SHOT TOUCHES IT", anchor: { at: "body" } },
    { tick: 960, seat: 1, text: "IT STICKS TO THE SHIP", anchor: { at: "body" } },
    {
      tick: 1140,
      seat: 1,
      text: "PARK THE CANNON UNDER IT",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 1320, seat: 2, text: "WRONG WAY SPREADS IT", anchor: { at: "body" } },
    { tick: 1560, seat: 2, text: "SWIPE TO THE NEAR WALL", anchor: { at: "body" } },
  ],
};
