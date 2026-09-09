import { facet } from "../../../../../packages/render/src/break-piece.js";
import { type Crater, centreY } from "../../../../../packages/render/src/crater-geom.js";
import { hole, lid, seam } from "../../../../../packages/render/src/crater-pit.js";
import { ring, spallRing } from "../../../../../packages/render/src/crater-spall.js";
import { stream } from "../../../../../packages/render/src/hash.js";
import type { HullSkin } from "../../../../../packages/render/src/hull.js";
import { shatter } from "../../../../../packages/render/src/shatter.js";

/**
 * GRIT — the lip of the hole is still coming away, in pieces too small to be
 * plates.
 *
 * The shipped hole is eleven plates and one size of piece. A hole torn through
 * a sheet of anything has two: the slabs that stayed attached and turned, and
 * the crumb along the break, where the material simply failed. Without the
 * second the lip is a *cut* — eleven clean edges meeting the dark at exactly
 * the mouth — and the eye reads it as a shape drawn on the ship rather than as
 * something that happened to it.
 *
 * So the ring is cut a second time, much finer, in the narrow band that touches
 * the mouth, and those pieces are let sit a little proud of where they belong:
 * pushed outward, each turned further out of true than a plate is, and lying
 * still. The owner asked for it in one line on 9 September 2026 — *see that
 * still top of craters are crumbling of smaller stone pieces part of crater*.
 *
 * **Not one value here decides what a broken piece looks like.** The fill and
 * the lit edge are `facet` (`break-piece.ts`), which is where this game already
 * writes down that a fragment is dark on the faces that were inside and still
 * carries the rim on the face that was out — the same paint every piece of
 * every destroyed body wears. This candidate only says **where the cut is and
 * how fine**, which is the one thing it is arguing about. `landed` is true for
 * every piece, and that is not a shortcut: these are lying in a hull, not
 * turning in the air, and `edgeLit` dims a settled piece for exactly that
 * reason.
 *
 * **It is the ship's own material.** The membrane is what broke, so the crumb
 * is membrane. `shards` next door is the other reading of the same sentence —
 * that what is left in the lip is pieces of the *rock* — and the pair is the
 * whole question between the two.
 *
 * **How it can lose.** *It is noise at the size a phone draws it.* A crater is
 * about twenty pixels across on a real screen and the plates are already near
 * the limit of what reads; a second cut at half that scale can dissolve into a
 * grey fringe, and a fringe around every hole on a hull carrying four of them
 * is texture on the one surface that was deliberately plain. Look at the
 * **small** craters on the sheet rather than the wide one — if those read as
 * furred rather than broken, this is the answer that costs the hull its edge.
 */

/** The band the crumb is cut out of, as multiples of the hole's radius. It
 * starts inside the plates' own inner edge, so a crumb always comes off
 * something, and stops well short of their reach, so the two cuts never read as
 * one cut at two sizes. */
const CRUMB_OUTER = 1.32;
const CRUMB_INNER = 1;
/** How many pieces the band is cut into. More than twice the plates: a crumb
 * has to be small enough that nobody counts them. */
const CRUMBS = 26;
/** How far a piece is pushed off the lip it broke from, as a share of its own
 * distance out. Outward, not inward — the plates went in, and a crumb that
 * followed them would only thicken the ring. */
const SHED = 0.06;
/** The most a piece is turned, in radians. Four times a plate's, because the
 * whole claim is that this one is no longer held by anything. */
const SPILL = 0.3;
/** Pieces below this depth are the inner ring of the cut, which is the hole
 * itself — dropping them here saves the fill rather than painting under it. */
const KEEP_FROM = 0.55;
/** How many of the cut pieces are actually drawn. Not all of them, and this is
 * the one number that decides whether the lip reads as crumbling or as tiling:
 * twenty-six equal pieces evenly round a ring is a *pattern*, and the eye names
 * a pattern as decoration in about a frame. Dropping two in five leaves the
 * break intact in some places and gone in others, which is what a break looks
 * like. */
const KEPT = 0.6;

/** The crumb along the break. Between the plates and the hole, so a piece that
 * sits over the mouth is swallowed by the dark rather than floating in it. */
function crumb(ctx: CanvasRenderingContext2D, c: Crater, skin: HullSkin): void {
  const rnd = stream(Math.round(c.x) * 104729 + Math.round(c.r) * 31);
  for (const shard of shatter(ring(c, CRUMB_OUTER), {
    ox: 0,
    oy: 0,
    wedges: CRUMBS,
    innerAt: CRUMB_INNER / CRUMB_OUTER,
    speed: 0,
    spin: 0,
    seed: Math.round(c.x * 29) + 7,
  })) {
    if (shard.depth < KEEP_FROM) continue;
    // Drawn or not, the stream is drawn from the same number of times, so a
    // dropped piece never shifts the ones after it (`stream`).
    const [keep, shed, turn] = [rnd(), 1 + SHED * rnd(), rnd()];
    if (keep > KEPT) continue;
    facet(ctx, {
      shard,
      pose: {
        x: shard.x * shed,
        y: shard.y * shed,
        angle: (turn - 0.5) * 2 * SPILL,
        alpha: 1,
        landed: true,
      },
      hex: skin.rim,
      dark: skin.muzzle,
      // The ring is already built in screen pixels, so a piece needs no
      // conversion — unlike a broken body, whose contour is body-local.
      scale: 1,
    });
  }
}

export function grit(ctx: CanvasRenderingContext2D, c: Crater, skin: HullSkin): void {
  ctx.save();
  // The shipped bound, called: without it this layer is the one thing on the
  // frame that climbs the hull's slope beside its own hole (`crater-pit.ts`).
  lid(ctx, c);
  ctx.translate(c.x, centreY(c));
  spallRing(ctx, c, skin);
  crumb(ctx, c, skin);
  hole(ctx, c, skin);
  ctx.restore();
  seam(ctx, c);
}
