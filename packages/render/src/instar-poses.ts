import type { InstarPose } from "@neon-spore/sim";
import type { Figure } from "./instar-shape.js";

/**
 * **THE INSTAR's poses**, one `Figure` each: the body as it enters, the five
 * the script names, and the beaten one it sags into at the end.
 *
 * Cut off `instar-shape.ts` the day it was written, for the reason the
 * scout's arenas are their own file: a pose is a table of places in
 * thousandths of the field, and the file next door is the arithmetic that
 * blends and deforms them. Every place a mark sits in
 * `packages/content/src/instar-script.ts` is a place written here for the
 * part the mark is on — the jaw marks on the lips, the hand marks on the
 * hands, the clutch on the flank, the tongue's tip, the barb of the tail —
 * because a mark that was not on its part would be a ring beside a body.
 */

/** The body as it enters, before the first morph: small, high, shut. */
export const ENTER: Figure = {
  headX: 500,
  headY: 120,
  headR: 130,
  jawUp: 0,
  jawDown: 0,
  eye: 0.2,
  back: 0,
  lHandX: 340,
  lHandY: 200,
  lWeapon: 0,
  rHandX: 660,
  rHandY: 200,
  rWeapon: 0,
  eggs: 0,
  eggsX: 720,
  eggsY: 460,
  tongue: 0,
  tongueX: 380,
  tongueY: 320,
  tail: 0,
  tailX: 500,
  tailY: 500,
  reach: 0,
  slough: 0,
};

/** The three poses, each written as what differs from the body as it entered. */
export const POSES: Record<InstarPose, Figure> = {
  // The jaws wide on the fire, the upper lip at 220 and the lower at 500.
  breath: { ...ENTER, headY: 360, headR: 230, jawUp: 1, jawDown: 1, eye: 1 },
  // The brood: one nest at 320/380 for the thumb that squashes, one at
  // 660/360 for the thumb that swipes.
  brood: {
    ...ENTER,
    headY: 250,
    headR: 170,
    jawUp: 0.1,
    jawDown: 0.15,
    eye: 1,
    lHandX: 300,
    lHandY: 330,
    rHandX: 700,
    rHandY: 300,
    eggs: 1,
    eggsX: 660,
    eggsY: 360,
  },
  // The tail over the hull, its fork at 380 and 620.
  lash: {
    ...ENTER,
    headY: 220,
    headR: 150,
    eye: 0,
    back: 1,
    lHandX: 330,
    lHandY: 300,
    rHandX: 670,
    rHandY: 300,
    tail: 1,
    tailY: 560,
  },
};

/** Beaten: the head hanging, the eyes shut, the hands down. */
export const BEATEN: Figure = {
  ...ENTER,
  headY: 200,
  headR: 150,
  jawDown: 0.25,
  eye: 0,
  lHandX: 360,
  lHandY: 380,
  rHandX: 640,
  rHandY: 380,
};
