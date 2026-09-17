import type { GuideScene } from "../scene-types.js";

/**
 * THE THROAT's rehearsal: what it takes, and the one thing that hurts it.
 *
 * The mouth stands still in the middle lane (`throatHomeCol`) and inhales every
 * six beats from beat 0, so the film runs on that clock. A red creature falls
 * down the mouth's own column and stops at its row, and player 2 shoots it
 * before the inhale at beat 12 — the shot leaves at tick 630 and reaches row
 * five with forty ticks to spare, which is the *clear that column before the
 * count runs out* of the guide. A rock is dropped down the same column and
 * left: it stops at beat 16 and the inhale at 18 takes it, and nothing heals
 * because nothing is slack yet. Then the gum: a hand on it is the fling and
 * not a brake, so it keeps falling under the thumb, and the carry has to be
 * finished on the beat it reaches the mouth's row (`carryGrips` settles a
 * carry on the beat, `gumSwiped` flies it along the row it is on). Arriving
 * at beat 21 it is on row five at beat 26, so the drag runs from tick 1500 to
 * the beat at 1560, with the hand still down.
 *
 * It falls in the leftmost column and not next to the mouth, because the
 * sweep is three columns a beat and one flung from three columns away chokes
 * on the beat it is flung — the flight would never be seen. From column 0 it
 * flies to 3 for one whole beat and chokes crossing the mouth on the next,
 * and the last two pages are the mouth sliding a column a beat with a ring
 * gone slack.
 *
 * Every page but the shot's and the swipe's is anchored at the hull: a body
 * held in the mouth stands on row five, and a page about a body has to hold
 * with it below row six (`scene-pages.test.ts`).
 */
export const THE_THROAT: GuideScene = {
  ticks: 2100,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 1, col: 3, color: "red" },
    { beat: 10, col: 3, kind: "meteor", color: null },
    { beat: 20, col: 0, kind: "gum", color: null },
  ],
  boss: { kind: "throat" },
  acts: [
    { tick: 630, control: "fireRed" },
    { tick: 1470, grip: 1, col: 0, until: 1620 },
    { tick: 1500, drag: "gripBody", dir: 1, by: 1560, until: 1620 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "ONLY PLAYER 2 SEES THE COUNT", anchor: { at: "hull" } },
    { tick: 300, seat: 1, text: "A BODY STOPS IN THE MOUTH", anchor: { at: "hull" } },
    {
      tick: 540,
      seat: 2,
      text: "PLAYER 2 CLEARS IT WITH RED",
      anchor: { at: "control", control: "fireRed" },
    },
    { tick: 900, seat: 1, text: "LEFT ALONE · IT IS SWALLOWED", anchor: { at: "hull" } },
    { tick: 1200, seat: 1, text: "ONLY A GUM HURTS IT", anchor: { at: "hull" } },
    { tick: 1380, seat: 1, text: "SWIPED LEVEL INTO THE MOUTH", anchor: { at: "held" } },
    { tick: 1680, seat: 2, text: "ONE RING SLACK · IT SLIDES", anchor: { at: "hull" } },
    { tick: 1860, seat: 2, text: "PLAYER 2 SAYS THE COLUMN", anchor: { at: "hull" } },
  ],
};
