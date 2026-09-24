import { PALETTE } from "./palette.js";

/**
 * The colours a ship is painted in, and the two ships there were first: the
 * player's own and THE MIRROR's. A seat's — player two's amber — is built on
 * the same interface in `seat-skin.ts`. The membrane they are painted onto is
 * `hull.ts`, which re-exports these so nothing that takes a skin has to know
 * they moved; they moved because the hull was at the limit and a skin is a
 * palette, not a drawing.
 */

/**
 * The colours one ship is painted in. Everything else about a hull — its
 * contour, its lobes, its sheen, the way damage hangs off it — is the same for
 * every ship there will ever be, so the only thing THE MIRROR needs in order
 * to be an exact copy of the player's ship is a second one of these.
 */
export interface HullSkin {
  /** The body, dark where it is thick and bright at the skin, top to bottom. */
  body: readonly [string, string, string, string];
  /** The outline, and what its glow is made of. */
  rim: string;
  /** How strong the rim glows, 0..1; absent is full. The ship's own is always
   * full — it has no points to dim with — and THE MIRROR's fades with its.
   * The glow only, handed to `strokeGlow` as its intensity: the line itself
   * stays whole, so a mirror down to its last points still has an outline.
   * Named `rimAlpha` until 24 September 2026, which read as a fade of the
   * whole rim and was not one. */
  rimGlow?: number;
  /** The bright edge on the muzzle. */
  edge: string;
  /** Inside the muzzle. */
  muzzle: string;
}

/** The player's ship: purple membrane, pale rim. The style guide, as a skin. */
export const OWN_SKIN: HullSkin = {
  body: ["#B268F0", "#6C2AAE", "#33105E", "#150632"],
  rim: PALETTE.hull,
  edge: PALETTE.hullRim,
  muzzle: PALETTE.redDark,
};

/**
 * THE MIRROR: the same ship with the light gone out of it. Blood where the
 * player has violet, bone where the player has white — near enough to read as
 * a copy at a glance, wrong enough to read as a copy of the wrong thing.
 */
export const MIRROR_SKIN: HullSkin = {
  body: ["#FF4A63", "#8E0F2E", "#3A0413", "#120106"],
  rim: "#FF2E52",
  edge: "#FFD9DE",
  muzzle: "#120106",
};
