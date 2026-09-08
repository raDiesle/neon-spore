import { livingSilhouette } from "../../../../../packages/content/src/index.js";
import { THROB } from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:throb` / `crown` — the six clubs put on longer stalks, made
 * smaller, and made the same as each other.
 *
 * A throb's rim is not decoration, it is an **instrument**. The creature is
 * *which half is pointing at the cannon*, and a ball is the one shape whose
 * rotation cannot be seen — so six knobs were hung round it to give the turn a
 * bearing, and they carry a count as well: three of them wear each ammunition
 * colour, and the sentence the pair says out loud is "three cyan ones left".
 * Both readings are the rim's job and nothing else on the body does either.
 *
 * The shipped rim is tuned the way an *organic* rim is tuned. `reach` 0.26
 * keeps each cap close in, `cap` 0.36 makes it nearly as wide as the gap
 * beside it, and `vary` 0.16 gives every club its own reach and its own size
 * so the ring is uneven. That is a good-looking body and it is paid for out of
 * the two things this rim exists to say: a cap sitting on the body has a
 * shorter stalk to be seen turning by, and six knobs of six different sizes is
 * a shape whose count an eye estimates rather than reads.
 *
 * CROWN spends the same footprint the other way. `reach` 0.44 lifts each club
 * clear of the body on a stalk that is visible at the size a throb is drawn;
 * `cap` 0.27 makes the ball small enough that the gap beside it is wider than
 * it is; `neck` 0.32 keeps the stalk narrow so a club reads as a thing *on* a
 * body rather than as a lobe *of* one; and `vary` 0.05 leaves just enough
 * unevenness to breathe. Six even knobs, six even gaps: a count, and a
 * bearing.
 *
 * **The body arrives exactly as big as it does now.** `sizeMul` goes 0.67 to
 * 0.69 and that is a measured number, not a guess — a longer stalk with a
 * smaller ball on it reaches slightly *less* far than the shipped pair, so the
 * whole body may be drawn a little larger and still land inside the bulb's
 * own footprint, which is what `packages/content/test/body-path.test.ts`
 * holds the shipped rim to. Walked round the clubbed contour at every phase
 * of its breath, the two come out within a third of a per cent of each other.
 *
 * How it can lose. **Six even knobs on an even ring is a machine**, and
 * `docs/alive.md` is clear that regularity belongs to the dead things — this
 * game already has a horseshoe and a cage for machinery, and a throb that
 * reads as a mine is a body the pair will not say "throb" about. And **a
 * narrow neck is the first thing a phone throws away**: at 26 px a stalk a
 * third of a cap wide may simply disappear, leaving six balls floating round a
 * ball, which is a worse picture than the one being replaced. Only an eye at
 * true size settles either.
 */
export const THROB_CROWN: Variant = {
  slot: "creature:throb",
  name: "crown",
  sentence:
    "six clubs lifted clear on visible stalks, smaller and all alike — a rim a count and a bearing can be read off, not a rim that reads as a texture",
  dir: "tools/versus/candidates/creature-throb/crown",
  patches: [
    patch({
      target: THROB,
      // The route the drawing code takes: `drawLiving` asks the kind table for
      // a shape, it does not name the export (`living-look.ts`).
      reached: () => livingSilhouette("throb"),
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "THROB",
        type: "CreatureSilhouette",
      },
      fields: {
        clubs: { clubs: 6, reach: 0.44, cap: 0.27, neck: 0.32, vary: 0.05 },
        sizeMul: 0.69,
      },
    }),
  ],
};
