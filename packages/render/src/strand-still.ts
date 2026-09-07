import { livingPath } from "@neon-spore/content";
import { hazed } from "./depth.js";
import { PALETTE } from "./palette.js";
import { type Bead, reelFrame } from "./strand-bead.js";
import { reelStill } from "./strand-reel.js";

/** The weight `living-draw.ts` outlines a body a wrong colour has shut, in
 * screen pixels. The same number here, because it is the same statement. */
const BLOCKED_WIDTH = 2;

/**
 * One live bead on the navigator's screen that **no shot can answer this
 * instant**: the reel stopped, drawn as a grey outline and nothing else.
 *
 * **It is the wrong-colour look, borrowed on purpose.** A bolt of the wrong
 * ammunition leaves an ordinary body a grey contour with no fill, no light
 * organ and no glow for as long as it is refusing shots (`living-draw.ts`,
 * `sim/colour-armour.ts`), and a pair that has played one wave already reads
 * that as *nothing reaches this now*. A bead off the answer is in exactly that
 * state, permanently rather than for a window, so it wears exactly that face.
 * The picture it replaces was a cage of grey plates around the contour, which
 * said the same thing in a vocabulary this creature did not otherwise use.
 *
 * **And it does not roll.** The roll is the picture of *this one is in play and
 * you cannot know what it is*; a bead nothing can shoot is not in play, and
 * asking the navigator to watch five bodies flip when four of them are dead
 * ends is asking them to read noise. So the reel stops (`reelStill`) and only
 * the bead under the arrow is still turning — which is the split drawn rather
 * than said, on the one screen that is allowed to know it.
 *
 * It keeps the contour's own slow wobble, because a body that has stopped
 * moving altogether is a body that has been removed from the field, and this
 * one has not.
 */
export function drawStillBead(b: Bead): void {
  const { ctx, l, cfg, c, time, near } = b;
  const f = reelFrame(l, c, b.beatPhase, time);
  const { shape } = reelStill(c.id);
  const scale = f.r / Math.max(shape.rx, shape.ry);
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = hazed(cfg, PALETTE.sparkDim, near);
  // The same two screen pixels a wrong colour leaves on an ordinary body,
  // divided back out of the scale this contour is drawn in.
  ctx.lineWidth = BLOCKED_WIDTH / scale;
  ctx.stroke(new Path2D(livingPath(shape, f.t)));
  ctx.restore();
}
