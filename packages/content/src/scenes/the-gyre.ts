import type { GuideScene } from "../scene-types.js";

/**
 * THE GYRE's rehearsal: the column you were told is the right one for a single
 * beat.
 *
 * Six bodies bolted round a turning wheel, red and cyan alternating. It stops
 * falling in the middle of the field and walks a diamond there, turning faster
 * the longer it is up — so a column said out loud is true for one beat and a
 * colour said out loud is true for two positions round the rim.
 *
 * The wave's answer is the one control nobody has used as a *brake* before:
 * SUCK slows the wheel for four beats and does not care where the cannon is
 * standing. So the film is the wheel turning, the wheel being slowed, and the
 * shot taken inside the four beats that buys — *spend it on the beat you have
 * both agreed to fire on, then be in the column, not the other way round*.
 */
export const THE_GYRE: GuideScene = {
  ticks: 1500,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "gyre", color: null }],
  acts: [
    { tick: 1170, control: "intake" },
    { tick: 1200, control: "cannon", col: 2 },
    { tick: 1240, control: "cannon", col: 2 },
    // Inside the four beats the brake buys, at the tick a cyan mount is
    // standing over the cannon. Both halves are the wave: the slowing is his
    // and the beat is hers, and neither is worth anything on its own.
    { tick: 1350, control: "fireCyan" },
  ],
  steps: [
    // Eleven beats: the wheel falls to the middle of the field and starts its
    // walk, and the page holds with the hub on row eight and the highest
    // mount on row six — the whole wheel in the middle of the screen.
    { tick: 0, seat: 1, text: "GYRE · SIX ON A WHEEL", anchor: { at: "body" } },
    // Seven beats of the walk, to the next moment the top of the wheel is
    // no higher than row six.
    { tick: 660, seat: 2, text: "IT TURNS · CALL THE BEAT", anchor: { at: "body" } },
    {
      tick: 1080,
      seat: 1,
      text: "SUCK SLOWS THE WHEEL",
      anchor: { at: "control", control: "intake" },
    },
    {
      tick: 1260,
      seat: 2,
      text: "FIRE ON THE AGREED BEAT",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
