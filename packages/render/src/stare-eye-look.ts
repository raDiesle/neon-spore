import { drawEyeFluid, drawEyeFringe, drawEyeLens, type EyeInk } from "./eye.js";
import { strokeGlow } from "./glow.js";
import { STROKE } from "./palette.js";
import type { StareEye } from "./stare-shape.js";

/** What THE STARE's eye is painted from, read off the turn by `stare-draw.ts`. */
export interface StareEyeLook {
  /** The socket, in field pixels (`stareEye`). */
  e: StareEye;
  /** How much of the face shows, `FACE_AWAY..1` (`stareFace`). */
  face: number;
  /** The sliver's shear, gone once the eye is square (`stareFace`). */
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
 * **THE STARE's eye, as the one record the turn is painted through**: the
 * whole eye scaled across by `face` and sheared by `lean` about its own
 * middle, so the sliver and the square eye are one picture at two angles
 * rather than two pictures. A record so VERSUS can offer another turn
 * (`tools/versus/candidates/stare-eye/`); `stare-draw.ts` calls
 * `STARE_EYE.paint` every frame and never draws the eye directly.
 */
export const STARE_EYE: {
  paint: (ctx: CanvasRenderingContext2D, look: StareEyeLook) => void;
} = {
  paint: (ctx, { e, face, lean, open, ink, time, beats }) => {
    ctx.save();
    ctx.translate(e.cx, e.cy);
    ctx.transform(face, 0, lean, 1, 0, 0);
    drawEyeFluid(ctx, 0, 0, e.rx, e.ry, open, time);
    drawEyeLens(ctx, 0, 0, e.rx, e.ry, ink, open, beats);
    drawEyeFringe(ctx, 0, 0, e.rx, e.ry, ink, open, time);
    // The socket's own rim, the one line there at every angle.
    const rim = new Path2D(
      `M ${-e.rx} 0 Q ${-e.rx * 0.4} ${-e.ry * 1.7} ${e.rx} 0 Q ${e.rx * 0.4} ${e.ry * 1.3} ${-e.rx} 0 Z`,
    );
    strokeGlow(ctx, rim, ink.rim, STROKE.outline, 0.5 + 0.6 * open);
    ctx.restore();
  },
};
