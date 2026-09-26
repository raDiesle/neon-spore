/**
 * The hues one creature or boss owns, cut out of `palette-creatures.ts` when
 * that file reached its ceiling: spread into `PALETTE` (`palette.ts`) after
 * it, read from there, and argued for here. A new owned hue goes here.
 */
export const LATE_CREATURE_HUES = {
  /**
   * THE HALTER's plating (§36, *Colour*): a dull sage slate, cold enough to
   * read as armour and far from either cannon, and its shadow along the seam.
   */
  halterPlate: "#6C7A6E",
  halterPlateDark: "#222A25",
  /**
   * What the plating hugs: a warm peach body in the parted seam, and the
   * dull knot of it the core is while no shot is owed. Warm and pale, so it
   * never reads as the red cannon's pink or as a lit mark.
   */
  halterFlesh: "#E9B08C",
  halterFleshDark: "#6B4536",
} as const;
