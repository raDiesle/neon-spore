import type { SeamDraw } from "../../../../../packages/render/src/echo-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";

/**
 * WAIST — the seam is a *meridian on a ball*, not a diameter on a coin.
 *
 * The shipped furrow is a straight line across the body, which is what the
 * seam of a sphere looks like from exactly one angle and what a scratch on a
 * disc looks like from every angle. `creature:throb` / `globe` won its slot
 * on 9 September 2026 by making the same move on the same kind of body — the
 * seam as a circle of longitude, seen a little off square, so it bows and has
 * a near half and a far half (`throb.ts`).
 *
 * So the seam here is an **ellipse**: its long axis along the shipped line,
 * its short axis a fixed share of the body's reach — the tilt the ball is
 * seen at. The half of it that faces us is stroked as the shipped furrow was,
 * dark and deepening; the half that goes round the back is stroked thin and
 * faint, the way THE THROB's far seam is, because a ring on a ball is seen
 * *through* nothing but is drawn as though it were. And as the strain
 * gathers the tilt opens, so a body a beat from parting has a seam that has
 * visibly pinched into a waist — the necking `echoStrain` already does to
 * the contour, drawn on the surface as well.
 *
 * The shipped line is still in it: at nought tilt the ellipse *is* the line,
 * and the near arc is stroked at exactly the alpha and width the furrow
 * ships with, so the first frame the pair sees is the mark they know with a
 * bow in it.
 *
 * **How it can lose.** *A ring is a different mark.* The pair reads a furrow
 * as *this one divides, and this way*; an ellipse might read as a band, a
 * belt or a mouth, and the game already has a body with a mouth. And at 26
 * px the far arc is a pixel of faint colour that may read as nothing at all.
 */

/** The furrow's own numbers, so the near arc is the shipped mark. */
const SEAM_MIN = 0.22;
const SEAM_MAX = 0.85;
const SEAM_WIDTH = 0.16;

/** The ring's tilt: the short axis as a share of the long, at rest and at
 * full strain. Never nought, so the seam bows on the first frame. */
const TILT_MIN = 0.14;
const TILT_MAX = 0.36;

/** What the far arc keeps of the near arc's darkness and width. */
const FAR_ALPHA = 0.35;
const FAR_WIDTH = 0.5;

export function waist(d: SeamDraw): void {
  const { ctx, angle, phase, rx, ry, dark } = d;
  const reach = Math.max(rx, ry) * 1.05;
  const tilt = TILT_MIN + (TILT_MAX - TILT_MIN) * phase;
  const alpha = SEAM_MIN + (SEAM_MAX - SEAM_MIN) * phase;
  const width = Math.min(rx, ry) * SEAM_WIDTH * (1 + phase);

  ctx.save();
  ctx.rotate(angle);
  ctx.lineCap = "round";
  // The far half first and under: the right-hand arc of the ring, going
  // round the back.
  ctx.strokeStyle = rgba(dark, alpha * FAR_ALPHA);
  ctx.lineWidth = width * FAR_WIDTH;
  ctx.beginPath();
  ctx.ellipse(0, 0, reach * tilt, reach, 0, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // The near half: the shipped furrow, bowed.
  ctx.strokeStyle = rgba(dark, alpha);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.ellipse(0, 0, reach * tilt, reach, 0, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.stroke();
  ctx.restore();
}
