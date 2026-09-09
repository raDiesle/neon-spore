import * as interior from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";
import { bloom } from "./paint.js";

/**
 * `creature:slick` / `bloom` — a body that is doing something.
 *
 * **What this argues.** The other four answers in this slot are structure: what
 * the slick is made of and how it is put together. This one is state. A core in
 * each sac with nine veins running out of it, and a bright travelling out along
 * them, over and over, each vein on its own offset so the body flickers rather
 * than beating as one lamp.
 *
 * **It is the only one of the five that must be judged at tempo**, and that is
 * the argument for it: `docs/versus.md` says a candidate animates when motion
 * is the thing in question, and here it is the whole question.
 *
 * **How it can lose.** *A creature that pulses is a creature that looks
 * shootable at a particular moment.* Everything else that flashes in this game
 * is a cue — a charge landing, a guard lapsing, a tap counting — and a body
 * that flickers for no reason at all is a pair waiting for a window that does
 * not exist. That is a rule question rather than a taste one, and it is the
 * reason to look at this on a wave rather than on a card.
 */
export const SLICK_BLOOM: Variant = {
  slot: "creature:slick",
  name: "bloom",
  sentence: "a core in each sac with nine veins — a bright runs out along them, over and over",
  dir: "tools/versus/candidates/creature-slick/bloom",
  patches: [
    patch({
      target: interior.SLICK_LOOK,
      reached: () => interior.interiorFor("slick"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "SLICK_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: bloom },
    }),
  ],
};
