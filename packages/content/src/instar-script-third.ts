import type { BossSequenceStep } from "@neon-spore/sim";

/**
 * **THE INSTAR's third act**: five more poses, laid between the second act's
 * (docs/spec/bosses.md §11.32, *The third act*). The owner, 26 September
 * 2026, again: *many more visibly distinct states*, and SLOW moments where
 * the pair acts. Each is a picture the other thirteen are not — low and wide,
 * high on the wing, thrown up at the sky, flat on the hull, head-down — and
 * the answer alternates between the thumbs on the body and the ship's panel.
 *
 * Every place is where the pose draws its part (`render/instar-poses-third.ts`);
 * the crouch's two eyes were read off `frontEyeAt` for that pose, which
 * `render/test/instar-eye.test.ts` holds them to.
 */

/** Crouched face-on, low and wide, the eyes narrowed on the ship: about to
 * spring. Each seat taps its own eye shut. */
export const INSTAR_CROUCH: BossSequenceStep = {
  pose: "crouch",
  arrive: "stay",
  morphBeats: 5,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "eye", gesture: "tap", xMilli: 349, yMilli: 351, need: 10 },
    { seat: "p2", part: "eye", gesture: "tap", xMilli: 651, yMilli: 351, need: 10 },
  ],
};

/** Perched high side-on, the wings raised, the brood on its back over both
 * halves. Shoot each nest twice before it hatches on the hull. */
export const INSTAR_PERCH: BossSequenceStep = {
  pose: "perch",
  arrive: "cross",
  morphBeats: 8,
  windowBeats: 5,
  landBeats: 3,
  marks: [
    { seat: "both", part: "eggs", gesture: "shoot", xMilli: 380, yMilli: 170, need: 2 },
    { seat: "both", part: "eggs", gesture: "shoot", xMilli: 640, yMilli: 160, need: 2 },
  ],
};

/** The head thrown up small at the top, the jaws wide at the sky, and one
 * great glob of fire lobbed down the middle of the hull. Raise the shield
 * under it twice. */
export const INSTAR_ROAR: BossSequenceStep = {
  pose: "roar",
  arrive: "passes",
  morphBeats: 10,
  windowBeats: 5,
  landBeats: 3,
  marks: [{ seat: "both", part: "glob", gesture: "shield", xMilli: 500, yMilli: 760, need: 2 }],
};

/** Sprawled flat along the hull, the fork of its tail pressed down on it.
 * Each seat pulls its blade up off the ship. */
export const INSTAR_SPRAWL: BossSequenceStep = {
  pose: "sprawl",
  arrive: "cross",
  morphBeats: 7,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "tail", gesture: "pullUp", xMilli: 380, yMilli: 640, need: 3000 },
    { seat: "p2", part: "tail", gesture: "pullUp", xMilli: 620, yMilli: 640, need: 3000 },
  ],
};

/** Twisted head-down side-on, the head low on the left, the tail thrown high
 * on the right. Player 1 lifts the head; player 2 pulls the tail down. */
export const INSTAR_TWIST: BossSequenceStep = {
  pose: "twist",
  arrive: "stay",
  morphBeats: 6,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "head", gesture: "pullUp", xMilli: 240, yMilli: 560, need: 3000 },
    { seat: "p2", part: "tail", gesture: "pullDown", xMilli: 800, yMilli: 200, need: 3000 },
  ],
};
