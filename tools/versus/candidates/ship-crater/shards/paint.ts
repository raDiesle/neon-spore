import { facet } from "../../../../../packages/render/src/break-piece.js";
import { type Crater, centreY } from "../../../../../packages/render/src/crater-geom.js";
import { hole, lid, seam } from "../../../../../packages/render/src/crater-pit.js";
import { ring, spallRing } from "../../../../../packages/render/src/crater-spall.js";
import { stream } from "../../../../../packages/render/src/hash.js";
import type { HullSkin } from "../../../../../packages/render/src/hull.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { shatter } from "../../../../../packages/render/src/shatter.js";

/**
 * SHARDS — the rock broke too, and some of it is still in the wound.
 *
 * The same sentence as `grit` next door, read the other way. A rock that goes
 * through a membrane does not survive it intact either, and the pieces of stone
 * that stayed behind are the one thing on a healed-over hull that still says
 * **what** made the hole. So the finer cut along the lip is painted in the
 * rock's own greys (`PALETTE.rock`, `PALETTE.rockDark` — the two every meteor,
 * torch and tier in the game is drawn in) rather than in the ship's.
 *
 * It is a smaller change than it sounds and a bigger claim. The geometry is
 * `grit`'s to the last number, deliberately: two candidates that differed in
 * where the cut is *and* what colour it is would be a vote on two things at
 * once, and the pair would have no way of saying which half it liked. What is
 * being asked here is only **whose material is crumbling** — the ship's, or the
 * thing that hit it.
 *
 * It is also the one place in this game where a crater says which rock made it
 * in colour rather than in size. `craters.ts` already draws a hole at the
 * radius of the rock that made it, and `torchRotation` already faces it the way
 * that rock was facing; grey chips in the lip are the third and loudest of
 * those.
 *
 * **How it can lose, and it is the sharper risk of the two.** *Grey is the
 * field's word for a rock, and a rock is a thing you have to answer.* The pair
 * reads the field for grey and calls a column when it sees one; grey sitting on
 * the hull is grey in a place nothing can arrive, and if it makes either player
 * look twice at damage that is already paid for, the candidate is wrong however
 * good it looks standing still. Watch a *falling* rock cross a hull that
 * already has three of these in it, and see whether the eye goes to the right
 * one.
 */

/** `grit`'s band, its count and its scatter, spelled the same way on purpose:
 * the two candidates differ in colour and in nothing else, so a vote between
 * them is a vote about material. */
const CRUMB_OUTER = 1.32;
const CRUMB_INNER = 1;
const CRUMBS = 26;
const SHED = 0.06;
const SPILL = 0.3;
const KEEP_FROM = 0.55;
/** `grit`'s share, kept identical for the reason above. */
const KEPT = 0.6;

/** Stone left in the lip. `facet` again, so the fill and the lit edge are the
 * shipped fracture paint and only the two colours handed to it have changed. */
function splinters(ctx: CanvasRenderingContext2D, c: Crater): void {
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
      // The stone every rock in the game is filled with, and the dark it is
      // shaded into — called rather than mixed here, so a chip in a hull is the
      // same material as the rock still falling above it.
      hex: PALETTE.rock,
      dark: PALETTE.rockDark,
      scale: 1,
    });
  }
}

export function shards(ctx: CanvasRenderingContext2D, c: Crater, skin: HullSkin): void {
  ctx.save();
  // The shipped bound, called: without it this layer is the one thing on the
  // frame that climbs the hull's slope beside its own hole (`crater-pit.ts`).
  lid(ctx, c);
  ctx.translate(c.x, centreY(c));
  spallRing(ctx, c, skin);
  splinters(ctx, c);
  hole(ctx, c, skin);
  ctx.restore();
  seam(ctx, c);
}
