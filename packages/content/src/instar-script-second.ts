import type { BossSequenceStep } from "@neon-spore/sim";

/**
 * **THE INSTAR's second act**: five poses the first thirteen steps never
 * showed, laid in between them (docs/spec/bosses.md §11.32, *The second
 * act*). The owner, 26 September 2026: *many more visibly distinct states*,
 * *standard controls for some steps*, and *more graphic poses*. So these are
 * the steps where the ship's own panel answers the body — SHIELD, SHOOT and
 * SUCK under a mark (`sim/scene-panel.ts`) — between the thumb steps, so the
 * pair goes from hands on the body to hands on the panel and back.
 *
 * Every mark is `both`: the cannon is player 1's and the trigger player 2's,
 * the shield is moved by one seat and raised by the other, so no panel verb
 * is one seat's alone. Every place is where the pose draws its part
 * (`render/instar-poses-second.ts`); the glare's two eyes were read off
 * `frontEyeAt` for that pose.
 */

/** Reared back high to spit: two globs of fire coming down at the hull, one
 * over each half. Put the shield under each and raise it. */
export const INSTAR_REAR: BossSequenceStep = {
  pose: "rear",
  arrive: "stay",
  morphBeats: 4,
  windowBeats: 5,
  landBeats: 3,
  marks: [
    { seat: "both", part: "glob", gesture: "shield", xMilli: 227, yMilli: 760, need: 1 },
    { seat: "both", part: "glob", gesture: "shield", xMilli: 772, yMilli: 760, need: 1 },
  ],
};

/** Close and face on, the eyes wide on the ship. Shoot each eye three times. */
export const INSTAR_GLARE: BossSequenceStep = {
  pose: "glare",
  arrive: "stay",
  morphBeats: 5,
  windowBeats: 5,
  landBeats: 3,
  marks: [
    { seat: "both", part: "eye", gesture: "shoot", xMilli: 380, yMilli: 238, need: 3 },
    { seat: "both", part: "eye", gesture: "shoot", xMilli: 620, yMilli: 238, need: 3 },
  ],
};

/** Diving head first at the hull. Raise the shield under the brow twice. */
export const INSTAR_DIVE: BossSequenceStep = {
  pose: "dive",
  arrive: "approach",
  morphBeats: 8,
  windowBeats: 5,
  landBeats: 3,
  marks: [{ seat: "both", part: "head", gesture: "shield", xMilli: 500, yMilli: 360, need: 2 }],
};

/** The wings raised wide, shaking embers down over both halves. Open the maw
 * under each. */
export const INSTAR_SPREAD: BossSequenceStep = {
  pose: "spread",
  arrive: "cross",
  morphBeats: 7,
  windowBeats: 5,
  landBeats: 3,
  marks: [
    { seat: "both", part: "ember", gesture: "suck", xMilli: 227, yMilli: 740, need: 1 },
    { seat: "both", part: "ember", gesture: "suck", xMilli: 772, yMilli: 740, need: 1 },
  ],
};

/** The hide off, the new body bare and its heart lit in the split. Shoot the
 * heart four times: the finish. */
export const INSTAR_BARE: BossSequenceStep = {
  pose: "bare",
  arrive: "stay",
  morphBeats: 6,
  windowBeats: 5,
  landBeats: 4,
  marks: [{ seat: "both", part: "heart", gesture: "shoot", xMilli: 500, yMilli: 395, need: 4 }],
};
