import type { GuideScene } from "../scene-types.js";

/**
 * THE CRYSTAL's rehearsal: a lane, a light, and four thumbs at once.
 *
 * What the pair has to learn is that the shield's lane and the cannon's lane
 * are the *same* lane for once, and that the shot only counts while the
 * shield is armed there. Neither reads off a line of text: the first is the
 * light under the join coming on when the shield slides under it, and the
 * second is the join breaking on the beat GUARD and the shot land together.
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
    { tick: 450, control: "shield", col: 1, atBody: true },
    { tick: 470, control: "cannon", col: 1, atBody: true },
    { tick: 520, control: "guard" },
    { tick: 520, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "ONLY THE MIDDLE BREAKS", anchor: { at: "body" } },
    {
      tick: 270,
      seat: 2,
      text: "SHIELD UNDER THE MIDDLE",
      anchor: { at: "control", control: "shield" },
    },
    {
      tick: 480,
      seat: 1,
      text: "GUARD AND SHOT, ONE BEAT",
      anchor: { at: "control", control: "guard" },
    },
    { tick: 680, seat: 2, text: "TWO PLAIN BODIES NOW", anchor: { at: "body" } },
  ],
};
