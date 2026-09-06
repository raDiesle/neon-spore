import * as magnet from "../../../../../packages/render/src/magnet.js";
import { patch, type Variant } from "../../../variant.js";
import { hooked } from "./paint.js";

/**
 * `creature:magnet` / `hooked` — the body THE BARB wore, against the horseshoe
 * that took its place on the roster.
 *
 * The slot asks what a creature the cannon must **come at from the side** looks
 * like. The shipped answer is a horseshoe on two coloured poles with an
 * armoured plate slung under it: an opening at the bottom that says there is a
 * way in, a plate that says the way in is not from underneath, and two colours
 * that say the way in has a colour. Every clause of the rule is in the picture.
 *
 * HOOKED is the shape the field drew until this creature replaced its
 * occupant — seven lobes swept back into hooks, tuned on the shape sheet and
 * cleared by `nameability.test.ts` against every other body on the roster. Its
 * case is that it is a *body* and the horseshoe is a *machine*: everything else
 * on this field is a closed contour with lobes, and a shape with a right angle
 * in it may read as scenery at twenty-six pixels rather than as something
 * alive that has arrived.
 *
 * How it can lose. It has one colour and this creature has two, so the pole a
 * shot has to match is not on the card at all — and there is nothing on it that
 * says a bolt from underneath will bounce, which is the whole creature. A
 * silhouette that reads beautifully and explains nothing is a silhouette the
 * pair has to be taught in words.
 */
export const MAGNET_HOOKED: Variant = {
  slot: "creature:magnet",
  name: "hooked",
  sentence:
    "seven lobes swept back into hooks, in one colour — a body rather than a machine, and the shape the roster drew before this creature took the slot",
  dir: "tools/versus/candidates/creature-magnet/hooked",
  patches: [
    patch({
      target: magnet.MAGNET_LOOK,
      // No accessor: `creature-body.ts` reads the export itself on every frame,
      // which is why it is a record at all. The module namespace is the whole
      // route there is.
      reached: () => magnet.MAGNET_LOOK,
      where: {
        file: "packages/render/src/magnet.ts",
        symbol: "MAGNET_LOOK",
      },
      fields: { body: hooked },
    }),
  ],
};
