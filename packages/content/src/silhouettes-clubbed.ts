import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * The one body whose contour is **walked**.
 *
 * Every other creature in `silhouettes.ts` is a radius sampled at an angle —
 * `1 + depth · cos(lobes · a + seed)` and nothing else — and `livingPath` draws
 * them all through one loop. A `clubs` rim is a different construction: stalks
 * and caps placed round a core, walked in order, with its own branch in
 * `body-path.ts`. That is the seam, and it is the code's own rather than a
 * convenient cut: the file next door is a table of five numbers per body, and
 * this is a body that needs a sixth kind of answer.
 *
 * `silhouettes.ts` re-exports `THROB`, so nothing that already reached for it
 * through that file had to move.
 */
/**
 * Throb: a small round core wearing six balls on stalks, turning clockwise
 * with each half in one of the two ammunition colours (`throbTurnMilli` in
 * sim, `living-draw.ts` in render).
 *
 * **The clubs are the turn.** It was six soft lobes on a ball, and a ball is
 * the one shape whose rotation cannot be seen: the whole creature is *which
 * half is pointing at the cannon*, and a body that turns invisibly is a rule
 * with no picture. Six knobs on stalks read their own bearing at forty pixels
 * — and they read a count as well, so the pair can say *three cyan ones left*
 * rather than reaching for a clock angle neither of them can see.
 *
 * The core is nearly smooth on purpose — lobes under the clubs would be a
 * second rim arguing with the first — and `sizeMul` is here for the reason it
 * is on the Runt and for the opposite result. `drawLiving` scales
 * `max(rx, ry)` onto the fixed body radius every living kind draws at, and a
 * club reaches most of another radius past that, so a throb left at 1 would
 * arrive on the field a third wider than a bulb. 0.67 is the widest club this
 * rim can throw — `reach` and `cap` both at the top of their `vary`, on the
 * crest of a breath — brought back inside the bulb's own footprint, which
 * `packages/content/test/body-path.test.ts` is what holds it to.
 *
 * Walked out of `tools/shape-sheet/src/forms/clubbed.ts`, which drew THE
 * POMMEL with it — `docs/asset-catalogue.md` on what claiming a shape means.
 */
export const THROB: CreatureSilhouette = {
  lobes: 3,
  depth: 0.06,
  wobble: 0.05,
  rx: 44,
  ry: 44,
  seed: 7.0,
  sizeMul: 0.67,
  clubs: { clubs: 6, reach: 0.26, cap: 0.36, neck: 0.46, vary: 0.16 },
};
