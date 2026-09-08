import { livingSilhouette } from "../../../../../packages/content/src/index.js";
import { SLICK } from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:slick` / `pinch` — the two lobes are put on the long axis and the
 * waist between them is cut deeper.
 *
 * The slick is the first body the pair ever names and the plainest shape on
 * the roster: two broad lobes on a flat ellipse. What it actually draws is a
 * *bean* — `seed` 2.0 puts the two apexes at about −57° and 123°, so the
 * lobes sit across the body at a slant and the long axis runs through the
 * waist rather than through either of them. Nothing is wrong with it; it is
 * also not saying the sentence the kind is filed under. "Two broad lobes,
 * wide and flat" is a shape whose lobes are the wide part.
 *
 * PINCH is that sentence drawn. `seed` 0 puts an apex at 0° and the other at
 * 180°, so the two lobes are the two ends of the long axis and the waist is
 * squarely in the middle — and `depth` 0.52 cuts that waist deep enough to
 * read as a *join* rather than as a dent, which is what turns one lozenge into
 * two sacs holding on to each other. That is the shape language
 * `docs/style-guide.md` asks for: a closed contour with lobes, and lobes that
 * are lobes at the size the thing is drawn.
 *
 * Two axes are untouched on purpose. The **count stays 2**, which is the whole
 * of what separates this body from a dart at three, and `nameability.ts` calls
 * that pair the narrowest margin in the game. And the **aspect stays 68 × 34**,
 * which is what separates it from every round body on the roster; a deeper
 * waist on a rounder ellipse is a propeller, and one on a flatter one falls
 * under the 20 px drawn-size floor.
 *
 * How it can lose. **A waist at 0.52 may read as two creatures**, which is the
 * one thing a nameable silhouette must not do — the pair would be saying
 * *two red ones, column three* about one body. And the slick's own motion is
 * TILT_RIPPLE: it leans as it falls, and a symmetric body leaning reads its
 * lean off nothing but the pose, where a bean carries a built-in slant that
 * may have been doing half that work. Both are questions for `bun run
 * shapes:report` and an eye at 26 px, in that order.
 */
export const SLICK_PINCH: Variant = {
  slot: "creature:slick",
  name: "pinch",
  sentence:
    "the two lobes put on the long axis and the waist cut deeper — two sacs holding on to each other, not a bean",
  dir: "tools/versus/candidates/creature-slick/pinch",
  patches: [
    patch({
      target: SLICK,
      // The route the drawing code takes: `drawLiving` asks the kind table for
      // a shape, it does not name the export (`living-look.ts`).
      reached: () => livingSilhouette("slick"),
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "SLICK",
        type: "CreatureSilhouette",
      },
      fields: { depth: 0.52, seed: 0 },
    }),
  ],
};
