import type { GuideScene } from "../scene-types.js";

/**
 * THE CAROM's rehearsal: a shape, then an order.
 *
 * The wave shipped with three lines of prose and nothing moving, and it is the
 * worst of act five to describe in a sentence. What the pair has to learn is a
 * *shape* — a body that crosses three lanes a beat and turns at the side wall
 * rather than reflecting somewhere between two columns — and an *order*: the
 * cannon opens it and the shield finishes what falls out. Neither reads off a
 * line of text, and both are one glance in a picture.
 *
 * **One carom and nothing else.** The wave sends five and a plain body between
 * them; a film that did would be teaching the shape and the traffic at once,
 * and the shape is the whole of it.
 *
 * **The film ends on the ward rather than on the body thrown clear.** A crack
 * makes two problems and the chute is the slower one — it climbs to the top of
 * the field and takes twenty-eight beats to come back down, which is longer
 * than any page anybody would sit through. What the last page has to say is
 * that the seat which just fired is not the seat that finishes it, and the rock
 * says that in four beats.
 */
export const THE_CAROM: GuideScene = {
  ticks: 1140,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 0, kind: "carom", color: "red" }],
  acts: [
    { tick: 470, control: "cannon", col: 2 },
    { tick: 610, control: "fireRed" },
    { tick: 790, control: "shield", col: 2 },
    { tick: 850, control: "guard" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "IT TURNS AT THE WALL", anchor: { at: "body" } },
    {
      tick: 380,
      seat: 2,
      text: "YOUR COLOUR CRACKS IT",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 700,
      seat: 1,
      text: "THE ROCK IS YOURS NOW",
      anchor: { at: "control", control: "guard" },
    },
  ],
};
