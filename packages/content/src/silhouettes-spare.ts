import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * **The two contours next door that are not a body on the roster**: one
 * retired, one a capsule.
 *
 * Cut out of `silhouettes.ts` when THE BARB took that file over its 250-line
 * limit, along the seam `living-look.ts` already draws. Everything left there
 * is a shape some `CreatureKind` is *drawn as* — a slick, a bulb, a throb, a
 * barb, a dart, a wisp — and these two are neither: `SHELL` is a contour
 * nothing in the game reads any more, and `POD` is a capsule, which is a thing
 * the ship eats rather than a thing that falls at it.
 *
 * Both are re-exported from `silhouettes.ts`, so nothing that already reaches
 * for one through that file had to move. The type comes back the other way,
 * which is a type-only cycle and the arrangement `creature-roster.ts` already
 * stands in.
 */

/**
 * Shell: **retired as a contour, kept as a shape.**
 *
 * THE SHELL used to be a body of its own — the widest living thing there was,
 * five broad hard-edged lobes, almost no wobble. It is not one any more. A
 * shelled arrival is a slick or a bulb wearing plating over the top
 * (`shellBecomes` in sim, `shell-draw.ts` in render), so the two of them are
 * Shell-Slick and Shell-Bulb and neither has a silhouette that is not already
 * in this file. What the armour adds is a margin outside the body's own
 * contour and the splits in it, which is a picture rather than a shape.
 *
 * The parameters stay because they are the only hard-edged *living* contour
 * anyone has tuned — the starting point for a future creature that really is
 * plated flesh, the way `TORCH` outlived the torch it was drawn for.
 * `livingSilhouette` no longer names it, and nothing in the game reads it.
 */
export const SHELL: CreatureSilhouette = {
  lobes: 5,
  depth: 0.3,
  wobble: 0.012,
  rx: 84,
  ry: 50,
  seed: 4.0,
};

/**
 * Pod: a capsule with a core, upright and softly ribbed. Three shallow lobes,
 * so it reads as a made object that has been *grown* — the ship eats it, and a
 * ship does not eat machinery. It must not be mistaken for either creature at a
 * glance, which is why it stands taller than it is wide and carries neither of
 * the two ammunition colours.
 */
export const POD: CreatureSilhouette = {
  lobes: 3,
  depth: 0.16,
  wobble: 0.03,
  rx: 36,
  ry: 48,
  seed: 3.0,
};
