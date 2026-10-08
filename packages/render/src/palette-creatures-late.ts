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
  /**
   * THE TRAPEZE (§39, *Colour*): the swing's hemp rope and its shadow, and
   * the seat's worn wood — warm and unlit, so nothing on the swing reads as
   * a cannon's colour or as a lit mark.
   */
  trapezeRope: "#B9A27A",
  trapezeRopeDark: "#3F3424",
  trapezeWood: "#8A5A3A",
  /** The alien on it: a pale moss green and its shadow, a living thing on a made one. */
  trapezeAlien: "#9CC98A",
  trapezeAlienDark: "#2E4529",
  /** The gong it kicks: dull brass, its shadow, and the brass it rings to. */
  trapezeBrass: "#B08A3E",
  trapezeBrassDark: "#4A3815",
  trapezeBrassLit: "#F2D27A",
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
   * only cannon's colour on the body. The face's alloy is that brass with a
   * cool film of gloss over it, and the veins under its seams a faint acid
   * green no cannon, the shield or the hull carries (`governor-face-baked.ts`).
   */
  governorBrass: "#A88B4E",
  governorBrassDark: "#33291A",
  governorFace: "#15110C",
  governorHot: "#FFE0A8",
  governorHub: "#5C4B31",
  governorSheen: "#DCEBFF",
  governorGlow: "#B4F25A",
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
   * Its skin's detail (`lamprey-skin.ts`, `lamprey-disc.ts`): a paler olive
   * for the fin's membrane, the dark red of its gill pores and the ribs down
   * its throat — darker than the gullet, so the gullet unlit is still the one
   * meat on the disc — the gums the teeth stand in, and the eye's pale ring.
   */
  lampreyFin: "#7D8A5A",
  lampreyGill: "#2A1012",
  lampreyThroat: "#3A1816",
  lampreyGum: "#6E3A34",
  lampreyEye: "#B8BC8E",
  /** Its dung: a warm brown over the rock it is, and the dark of its folds. */
  lampreyDung: "#7A5530",
  lampreyDungDark: "#2E1D0E",
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
  /**
   * THE LATCH (§11.61): a dull bile ochre for the colony's skin, far from
   * both cannons and from THE LAMPREY's olive, and its outline; the tendril
   * a shade paler, so the rope reads as the colony's own; and the knot a pale
   * cream, the brightest thing on it — the next to come in is the one lit.
   */
  latchSkin: "#8C7A34",
  latchSkinDark: "#2A230C",
  latchTendril: "#A8934A",
  latchKnot: "#F0E2A0",
} as const;
