import type { GuideScene } from "../scene-types.js";

/**
 * THE BALLOON's rehearsal: two hands on one body, or nothing at all.
 *
 * Nothing either seat can fire touches one. What opens it is a handle on its
 * left and a handle on its right, pulled outward at the same instant — the
 * pilot's on the left, the navigator's on the right, and the simulation refuses
 * a side that is not the seat that sent it (`sim/balloon-pull.ts`). So this is
 * the only film in the game with a hand on both phones at once, and the two
 * carries overlap on purpose: a page showing one hand and then the other would
 * be a page showing the mistake.
 *
 * The two middle pages are one each, pointed at the handle that seat holds, so
 * each of them sees their own hand take a grip before they are asked to time it
 * against somebody else's. The last page is the instant itself.
 *
 * **One balloon, and the first split is what it shows.** The skin gives twice:
 * the first pull halves it and the second pops what is left for nothing. A
 * rehearsal that showed both would be a rehearsal about arithmetic; what a pair
 * has never done before is get two thumbs onto one beat.
 */
export const THE_BALLOON: GuideScene = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "balloon", color: null }],
  acts: [
    { tick: 660, drag: "balloonLeft", col: 2, by: 700, until: 715 },
    { tick: 660, drag: "balloonRight", col: 2, by: 700, until: 715 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "NOTHING YOU FIRE TOUCHES IT", anchor: { at: "body" } },
    {
      tick: 180,
      seat: 1,
      text: "THE LEFT HANDLE IS YOURS",
      anchor: { at: "handle", target: "balloonLeft" },
    },
    {
      tick: 360,
      seat: 2,
      text: "THE RIGHT HANDLE IS YOURS",
      anchor: { at: "handle", target: "balloonRight" },
    },
    { tick: 540, seat: 2, text: "BOTH AT THE SAME INSTANT", anchor: { at: "body" } },
  ],
};
