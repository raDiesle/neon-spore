import type { Point } from "@neon-spore/content";

/**
 * What a crater *is*, and the two heights everything about one is measured
 * against.
 *
 * Split from `craters.ts` on the day the hole's paint became a record a
 * candidate could patch (`crater-look.ts`). The paint needs the geometry and
 * the geometry's own file needs the record, so without a third file holding the
 * shape the two would import each other — the same split `magnet-look.ts` and
 * `magnet-coil.ts` already make around `magnet.ts`.
 *
 * Nothing here decides anything. Where a crater is, how wide its mouth is and
 * whether it should be drawn open yet are all in `craters.ts`; this is the
 * vocabulary those answers are written in.
 */

/**
 * A rock's own mark: not the whole rock's silhouette, only the sliver of it
 * that was ever inside the skin. `craters.ts` says how one is found and how its
 * mouth is measured.
 */
export interface Crater {
  /** Centre of the rock that made it — the pair's midpoint for a torch. */
  x: number;
  /** The skin line right above it — the crater's mouth sits on this. */
  top: Point;
  r: number;
  rotation: number;
  /** Which scarred columns this crater covers — two for a torch, one otherwise. */
  cols: readonly number[];
  /**
   * Where the hole cuts the skin, left and right — `mouth`'s answer, kept.
   *
   * It is the crystal's own outline intersected with `cutY`, an eight-point
   * rotated polygon walked edge by edge, and it depends on nothing but the four
   * fields above it. Both `clipOutMouths` and the pit's paint need it, so it
   * used to be computed twice a frame for every crater on the hull.
   */
  left: number;
  right: number;
}

/** A crater before its mouth has been measured — what `mouth` needs and no more. */
export type CraterShape = Omit<Crater, "left" | "right">;

/**
 * How far above the skin line the fill and the rim gap both start, rather than
 * exactly at it. The rotated crystal's edge only reaches the true skin line at a
 * single point per side — a pixel row sampled exactly on that line catches the
 * shape mid-taper, not yet wide enough to cover the seam, and a sliver of the
 * hull's own bright fill shows through right at the top of the hole. Starting
 * the cut a few pixels higher, where the shape has already widened, closes that
 * seam; `Layout.tile` is never this small, so the bias stays a fixed few pixels
 * rather than a share of anything that could shrink under it.
 */
export const LID = 3;

/** Where the fill and the rim-gap measurements actually start — `LID` above the
 * true skin line. */
export function cutY(c: CraterShape): number {
  return c.top.y - LID;
}

/** The rock's centre while embedded: above the skin line by half its radius, so
 * only its bottom quarter-height ever crosses below the line. Shared with
 * `rock-impact.ts`'s stuck rock, which sits at exactly this height. */
export function centreY(c: CraterShape): number {
  return c.top.y - c.r * 0.5;
}
