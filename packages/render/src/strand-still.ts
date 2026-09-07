import { livingPath } from "@neon-spore/content";
import { hazed } from "./depth.js";
import { PALETTE } from "./palette.js";
import { type Bead, reelFrame } from "./strand-bead.js";

/** The weight `living-draw.ts` outlines a body a wrong colour has shut, in
 * screen pixels. The same number here, because it is the same statement. */
const BLOCKED_WIDTH = 2;

/**
 * One live bead on the navigator's screen that **no shot can answer this
 * instant**: the reel still rolling, drawn as a grey outline and nothing else.
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
 * **And it rolls, like every other bead on the thread.** It did not: the reel
 * stopped here, on the grounds that a bead nothing can shoot is not in play and
 * five bodies flipping at once is noise. That was a leak. A stopped bead stands
 * as one of the two whole silhouettes — a flat slick or a round bulb — and a
 * thread is answered head first, so the navigator reading down a still thread
 * is reading the shapes of the beads that have not come up yet. Which of the
 * two a stopped reel landed on was arbitrary, but nothing on the screen says
 * so, and a picture that looks like the order is a picture the pair will play
 * as though it were. Rolling, every bead offers both bodies in turn and none of
 * them says what comes next.
 *
 * What it keeps is the **paint**: two grey pixels of contour, no fill, no
 * light, no interference. That is the whole of the difference between this and
 * the bead under the arrow, and it is enough — one bead on the thread is lit
 * and coloured and torn, and the rest are outlines of it.
 */
export function drawStillBead(b: Bead): void {
  const { ctx, l, cfg, c, time, near } = b;
  const f = reelFrame(l, c, b.beatPhase, time);
  // The squash goes into the silhouette rather than into the transform: a
  // context scaled unevenly draws an oval pen, and the two pixels below have
  // to be two pixels at the top of a flattened bead as much as at its side.
  const shape = { ...f.shape, ry: f.shape.ry * f.squash.sy };
  ctx.save();
  ctx.translate(f.x, f.y + f.jump);
  ctx.scale(f.scale, f.scale);
  ctx.strokeStyle = hazed(cfg, PALETTE.sparkDim, near);
  // The same two screen pixels a wrong colour leaves on an ordinary body,
  // divided back out of the scale this contour is drawn in.
  ctx.lineWidth = BLOCKED_WIDTH / f.scale;
  ctx.stroke(new Path2D(livingPath(shape, f.t)));
  ctx.restore();
}
