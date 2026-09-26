import type { BossSequenceStep } from "@neon-spore/sim";

/**
 * **THE INSTAR's opening scene, the breath's three bites** — the first four
 * steps of its script (`instar-script.ts`), cut off it when the lash's sweep
 * took that file past its line limit, at the one seam it had: a scene of
 * four steps that is one item in its list.
 *
 * It comes in from far off, small, and flies at the ship until it fills the
 * field, jaws already open on a fire turning in its mouth.
 * Player 2 pushes the upper jaw down and player 1 the lower jaw up, four
 * tiles each, so the jaws meet; both must be at depth at once, and a jaw
 * let go of opens again. Left open, it breathes the fire over the field.
 * **Three times** (the owner, 25 September 2026: *you repeat 3 times so
 * dragon tries to keep mouth open and it tries to push back*): the jaws
 * meet, it forces them open again where it is (`stay`), and the second
 * bite pushes back against both thumbs every beat, the third twice as
 * hard (`pushMilli`) — a jaw shut early and held there waiting for the
 * other opens again under the thumb, so the pull has to be *stronger*,
 * further, and the two jaws have to meet at once. **Between the first
 * and second bites** the jaws are forced open on the fire and player 2
 * taps it out, eight taps; **the third bite** is three marks — player 2
 * pulls the upper jaw against the push while player 1 taps the fire out,
 * six, and then pulls the lower jaw up to meet it (the owner, the same
 * day: *combine with some other movement action in between or during*).
 */
export const INSTAR_BREATH: readonly BossSequenceStep[] = [
  {
    pose: "breath",
    arrive: "approach",
    morphBeats: 8,
    windowBeats: 4,
    landBeats: 3,
    marks: [
      { seat: "p2", part: "jaw", gesture: "pullDown", xMilli: 560, yMilli: 220, need: 4000 },
      { seat: "p1", part: "jaw", gesture: "pullUp", xMilli: 440, yMilli: 500, need: 4000 },
    ],
  },
  {
    pose: "breath",
    arrive: "stay",
    morphBeats: 3,
    windowBeats: 4,
    landBeats: 2,
    marks: [{ seat: "p2", part: "fire", gesture: "tap", xMilli: 540, yMilli: 360, need: 8 }],
  },
  {
    pose: "breath",
    arrive: "stay",
    morphBeats: 3,
    windowBeats: 4,
    landBeats: 2,
    pushMilli: 250,
    marks: [
      { seat: "p2", part: "jaw", gesture: "pullDown", xMilli: 560, yMilli: 220, need: 4000 },
      { seat: "p1", part: "jaw", gesture: "pullUp", xMilli: 440, yMilli: 500, need: 4000 },
    ],
  },
  {
    pose: "breath",
    arrive: "stay",
    morphBeats: 3,
    windowBeats: 4,
    landBeats: 3,
    pushMilli: 500,
    marks: [
      { seat: "p2", part: "jaw", gesture: "pullDown", xMilli: 560, yMilli: 220, need: 4000 },
      { seat: "p1", part: "fire", gesture: "tap", xMilli: 460, yMilli: 360, need: 6 },
      { seat: "p1", part: "jaw", gesture: "pullUp", xMilli: 440, yMilli: 500, need: 4000 },
    ],
  },
];
