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

/** The five poses, each written as what differs from the body as it entered. */
export const POSES: Record<InstarPose, Figure> = {
  // The jaws: the head down over the field, the mouth part open, the two
  // jaw marks on the lips at 240 and 440.
  gape: { ...ENTER, headY: 340, headR: 200, jawUp: 0.3, jawDown: 0.3, eye: 1 },
  // A club in the left hand, held out over the hull at 280/400; the clutch on
  // the right flank at 720/460.
  armed: {
    ...ENTER,
    headY: 250,
    headR: 170,
    jawUp: 0.1,
    jawDown: 0.15,
    eye: 1,
    lHandX: 280,
    lHandY: 400,
    lWeapon: 1,
    rHandX: 700,
    rHandY: 300,
    eggs: 1,
  },
  // Shed: the husk hangs off, the second club is in the right hand at 720/380
  // and the tongue is out to 380/320.
  moulted: {
    ...ENTER,
    headY: 260,
    headR: 180,
    jawUp: 0.35,
    jawDown: 0.45,
    eye: 1,
    lHandX: 270,
    lHandY: 340,
    rHandX: 720,
    rHandY: 380,
    rWeapon: 1,
    tongue: 1,
    slough: 1,
  },
  // Its back to the ship: no eyes, the hands tucked, the tail over the hull at
  // 500/500.
  turned: {
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
  },
  // The head thrust at the ship, huge, the mouth wide, both hands reaching.
  lunge: {
    ...ENTER,
    headY: 320,
    headR: 260,
    jawUp: 0.6,
    jawDown: 0.7,
    eye: 1,
    lHandX: 250,
    lHandY: 340,
    rHandX: 750,
    rHandY: 340,
    reach: 1,
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
