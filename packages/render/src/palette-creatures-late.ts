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
  /**
   * THE GALL's seam (§38, *Colour*): the hull's own violet gone dull, as if
   * the growth were the hull's skin raised — it is on the hull, not a thing
   * landed on it — and the shadow along its underside.
   */
  gallSeam: "#6E4A82",
  gallSeamDark: "#24172C",
  /**
   * The nodule: a pale swollen mauve, lighter than the seam it grows out of
   * so the eye finds it at a glance on either half, and its shadow. Pale and
   * cool, so it never reads as the red cannon's pink or as a lit mark.
   */
  gallFlesh: "#B889C9",
  gallFleshDark: "#4E3160",
  /** The root the peeled seam bares, while no shot is owed. */
  gallRoot: "#8C6A7E",
  /**
   * THE BURGEE's boom and spindle (§39, *Colour*): a scoured steel grey, the
   * mast of a fixture rather than the hull's violet, and its shadow.
   */
  burgeeSteel: "#8E98A3",
  burgeeSteelDark: "#2B3139",
  /**
   * The flag: a dull canvas tan, its shadow, and the tan it brightens to once
   * both catches are in. Warm and unlit, so it never reads as a cannon's
   * colour — the spindle is the only lit thing on the body.
   */
  burgeeCanvas: "#A28E6C",
  burgeeCanvasDark: "#43392A",
  burgeeCanvasCaught: "#E3CC98",
  /**
   * THE FLUE's units (§40, *Colour*): a dark plum flesh since the owner
   * asked for the flue *more alien living* on 6 October 2026, where it was a
   * sooted grey — low in value so the sight's red and cyan stay the brightest
   * colour on it; its creases' shadow, and the gullet cut along it, near
   * black, that the spore rides in. The spore is the rim's white at its heart.
   */
  flueSoot: "#6A4C7A",
  flueSootDark: "#170C1E",
  flueSlot: "#09050D",
  /** THE GRINDSTONE's spent axle as row 11's fade opens: a white with no cannon's in it. */
  grindstoneHeat: "#F6F3EC",
  /**
   * THE GOVERNOR (§43, *Colour*): a scoured brass for the flywheel, the
   * spindle, the flyweights and the yoke, its shadow, and the dark face the
   * needle is read off. The needle runs a hot pale amber while it crosses a
   * lit mark — paler than a pod's, so it never reads as one — and the hub,
   * unlit, is a dull boss of the same brass gone brown: the hub lit is the
   * only cannon's colour on the body.
   */
  governorBrass: "#A88B4E",
  governorBrassDark: "#33291A",
  governorFace: "#15110C",
  governorHot: "#FFE0A8",
  governorHub: "#5C4B31",
  /**
   * THE LAMPREY (§41, *Colour*): a dark wet olive for the body and its
   * shadow, a pale bone white for the teeth — the lit one the only bright
   * thing on the ring — the mouth's black, and the gullet unlit, a dull meat
   * red that is not the hull's: the gullet lit is the only cannon's colour
   * on the body, and the scar is the hull's own red.
   */
  lampreyHide: "#4E5A3A",
  lampreyHideDark: "#1A2014",
  lampreyTooth: "#E8E2CC",
  lampreyMouth: "#0E0A0A",
  lampreyGullet: "#5A2A22",
  /**
   * THE MIMIC (§42, *Colour*): a mottle of two dark greens close to the
   * field's own dark, so it hides against it flattened; its outline darker
   * still; a sign the pale cyan line that is the only bright line on the
   * body; and the core unlit, a dull grey-green — lit, it is the only lit
   * fill on the body, in a cannon's colour. A mimicked sign is the hull's red.
   */
  mimicSkin: "#1D3326",
  mimicMottle: "#243D2D",
  mimicSkinDark: "#0A140E",
  mimicSign: "#C4F6FF",
  mimicCore: "#33413A",
} as const;
