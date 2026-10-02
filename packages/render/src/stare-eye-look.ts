import type { EyeInk } from "./eye.js";
import { paintGlobe } from "./stare-eye-globe.js";
import type { StareEye } from "./stare-shape.js";

/** What THE STARE's eye is painted from, read off the turn by `stare-draw.ts`. */
export interface StareEyeLook {
  /** The socket, in field pixels (`stareEye`). */
  e: StareEye;
  /** How much of the face shows, `FACE_AWAY..1` (`stareFace`). */
  face: number;
  /** The hurt shudder, a decaying sine after a hit, in radians of turn while the eye is square (`stareFace`). */
  lean: number;
  /** How far the lids stand open, `OPEN_SHUT..1` (`stareFace`). */
  open: number;
  ink: EyeInk;
  /** The wall clock, for the fluid and the lashes. */
  time: number;
  /** The beat clock, for the lens: the pupil is the same on both phones. */
  beats: number;
}

/**
 * **THE STARE's eye, as the one record the turn is painted through**: a
 * globe that rolls in its socket as `face` grows, so the sliver and the
 * square eye are one ball seen from two sides (`stare-eye-globe.ts`, taken
 * from VERSUS on 1 October 2026). A record so VERSUS can offer another turn;
 * `stare-draw.ts` calls `STARE_EYE.paint` every frame and never draws the
 * eye directly.
 */
export const STARE_EYE: {
  paint: (ctx: CanvasRenderingContext2D, look: StareEyeLook) => void;
} = {
  paint: paintGlobe,
};
