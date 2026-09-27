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
  /**
   * THE CAPSTAN's drum (§37, *Colour*): a dull corroded rust, orange gone
   * brown, and its shadow — warm, but far enough from the red cannon's pink
   * that nothing on the drum reads as a colour asked for.
   */
  capstanRust: "#8A5236",
  capstanRustDark: "#2C1A12",
  /**
   * A band's marks: the dull grate while they are unworn, and the bare metal
   * a reversal wears each one down to — pale and a little warm, so a worn
   * band reads as scrubbed, not as a lit mark, which is the rim's white.
   */
  capstanGrate: "#4B3A30",
  capstanWorn: "#E4DACB",
  /** The soft core under the cap, while no shot is owed. */
  capstanCore: "#7B5A49",
} as const;
