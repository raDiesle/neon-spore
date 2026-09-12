import type { GuideScene } from "../scene-types.js";

/**
 * THE CRYSTAL's rehearsal: a lane, a light, and four thumbs at once.
 *
 * What the pair has to learn is that the shield has to be under the craft
 * when the cannon fires at its middle, and that the shot only counts while
 * the shield is armed there. Neither reads off a line of text: the first is
 * the green column coming on when the shield slides under it, and the second
 * is the field opening and the canopy breaking on the beat GUARD and the
 * shot land together.
 *
 * **One crystal and nothing else**, for THE CAROM's reason: the wave sends
 * four and a plain body between them, and the film is about the join.
 *
 * **The film ends on the two halves falling apart**, before either reaches
 * the ship. What the last page has to say is that the hard shot bought two
 * easy ones, and two ordinary bodies falling their own lanes say that in a
 * few beats; shooting them would be teaching a slick again.
 */
export const THE_CRYSTAL: GuideScene = {
  ticks: 1200,
  bpm: 80,
  seed: 1,
  entries: [{ beat: 0, col: 0, kind: "crystal", color: "red" }],
  acts: [
    { tick: 720, control: "shield", col: 1, atBody: true },
    { tick: 740, control: "cannon", col: 1, atBody: true },
    { tick: 850, control: "guard" },
    { tick: 850, control: "fireRed" },
  ],
  steps: [
    // Seven beats at eighty: the crystal comes down its diagonal and holds on
    // row six, in the middle of the screen.
    { tick: 0, seat: 1, text: "ONLY THE MIDDLE BREAKS", anchor: { at: "body" } },
    {
      tick: 630,
      seat: 2,
      text: "SHIELD UNDER THE CRAFT",
      anchor: { at: "control", control: "shield" },
    },
    {
      tick: 810,
      seat: 1,
      text: "GUARD AND SHOT, ONE BEAT",
      anchor: { at: "control", control: "guard" },
    },
    { tick: 1010, seat: 2, text: "TWO PLAIN BODIES NOW", anchor: { at: "body" } },
  ],
};
