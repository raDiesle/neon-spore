import type { CreatureKind } from "@neon-spore/sim";

/**
 * **The bodies drawn by a path of their own**, and every row here is `null`
 * for the same reason: `blobRadiusMul` samples one radius all the way round,
 * and none of these is a thing one radius can describe — a dome over a
 * hanging hem, a rim with spokes, an eye, a worm's rings, a wall the width of
 * the field, a horseshoe with a hole through it, a rock under a membrane, two
 * balls in one film, a slick and a bulb under one shell. Each has a geometry
 * file or a draw path of its own in `render/`, and `drawCreatures` routes it
 * there before the living pass ever sees one.
 *
 * Cut out of `living-look.ts` on 14 September 2026 when that table stood at
 * its limit for the second time — it grows a row per creature, and these nine
 * were saying one sentence about themselves nine times. Spread back into the
 * table where the ghost's row stood; since none of them is a body of its own,
 * `livingBodyKinds()` reads the same order it always did.
 *
 * The rows keep their own comments, because what each one says is *why this
 * shape in particular* is not a contour, and that is the sentence the next
 * session reaches for when it wants to give one a blob.
 */
export const STROKED_LOOK = {
  // A body of its own, and not a blob — so `livingSilhouette` has nothing to
  // return for it and `drawLiving` never sees one. THE GHOST's outline is a
  // dome over a hanging hem (`ghost-shape.ts`), which no radial contour can
  // describe, so it is drawn by `render/ghost.ts` the way a rock is drawn by
  // `meteor.ts` — routed away in `drawCreatures` before the living pass. Its
  // own-motion is there too: a `Pose` is applied to a body `drawLiving` draws.
  ghost: null,
  // The wheel itself has a body of its own and it is not a blob: a rim, six
  // spokes and a hub, which no radial contour can describe. So it is drawn by
  // `render/gyre.ts` the way THE GHOST is drawn by `ghost.ts` — routed away in
  // `drawCreatures` before the living pass ever sees it.
  gyre: null,
  // THE LID is the second body drawn by a path of its own rather than by a
  // radial contour, and THE GHOST's case exactly: an eye is two arcs meeting
  // at a point either end, and `blobRadiusMul` samples one radius all the way
  // round, so every corner it grew at the sides it would grow at the top and
  // the bottom as well — a lens drawn that way is a lumpy oval. `lid-shape.ts`
  // is the geometry and `render/lid.ts` strokes it, routed away in
  // `drawCreatures` before the living pass ever sees one.
  lid: null,
  // THE CRAWLER's links are the third body drawn by a path of its own rather
  // than by a radial contour, and THE LID's case exactly: a segment of a worm
  // is a ring that is wider across the body than along it, with a seam where
  // it meets the next one, and `blobRadiusMul` samples one radius all the way
  // round — so every millimetre it gained at the sides it would gain fore and
  // aft as well, and a chain drawn that way is a row of lumpy balls with no
  // joints in it. `render/crawler.ts` strokes it, routed away in
  // `drawCreatures` before the living pass ever sees one.
  crawler: null,
  // THE FENCE, and the only `null` here that is not a body at all. It is a
  // line the width of the field with gaps in it — `render/fence.ts` strokes
  // it, routed away in `drawCreatures` before the living pass ever sees one —
  // so there is no contour to give it and nothing for an own-motion to move.
  // A silhouette here would put a blob on a tile the wall merely passes over.
  fence: null,
  // THE MAGNET, and another `null` here that is a contour rather than a
  // costume. A horseshoe has a hole through the middle and two arms hanging
  // off the bottom, and `blobRadiusMul` samples one radius all the way round —
  // so every millimetre of opening it gained at the bottom it would gain at
  // the top as well, and the body would come out as a ring. Its numbers are
  // `magnet-shape.ts` and `render/magnet.ts` strokes them, routed away in
  // `drawCreatures` before the living pass ever sees one.
  magnet: null,
  // THE COIL, and the plainest `null` in this family: what stands in the
  // middle of one is a rock — `drawMeteor` draws it, routed there by
  // `creature-body.ts` the way every other rock is — and the dome over it is a
  // membrane laid on top rather than a contour of its own (`render/coil.ts`),
  // exactly as THE CLASP's is. A silhouette here would be a second answer to a
  // question a rock has already answered.
  coil: null,
  // THE CHOIR, and a `null` of a shape none of the others is: it is
  // not one body drawn small, large, or under something — it is *two*, leaning
  // on each other inside one film, and a silhouette here would be a single
  // contour for a thing whose whole picture is that it is not single yet.
  // `render/choir.ts` draws the pair and the film; the moment the pilot's
  // gesture lands the kind changes and the ordinary slick or bulb takes over.
  choir: null,
  // THE CRYSTAL is two bodies in one shell, drawn by `render/crystal.ts` as a
  // slick and a bulb under one contour — neither half is a row of its own.
  crystal: null,
} as const satisfies Partial<Record<CreatureKind, null>>;
