/**
 * **The pattern painted on THE VOLLEY's shell**: the four seams a basketball
 * has, in the colour of the body sealed inside it.
 *
 * Its own file rather than thirty more lines in `volley.ts`, which is at its
 * 250-line limit, and the seam is a real one: next door is what the shell *is*
 * — a ball of the same rock every meteor is made of, and how much of it a ward
 * has taken off — and this is what is drawn on it. The two change for
 * different reasons, and only this one is a picture the owner decides by
 * looking at.
 *
 * **The pattern is the owner's own drawing, normalised.** It was four straight
 * lines through the middle to begin with, which is what a basketball looks
 * like only when it is facing you exactly and is a cross the rest of the time;
 * the owner sent the SVG he wanted and `SEAMS` is that drawing measured
 * against its own rim and written down in unit coordinates.
 */

/**
 * The four seams, in coordinates of the ball's own radius: a start point and
 * then two cubics apiece, `c1 c2 end`, exactly as the owner's SVG draws them.
 *
 * Measured off that file rather than approximated — its circle is an ellipse
 * under a transform, so x is divided by its own radius and y by its own, which
 * is what puts every endpoint back on a true circle. Multiplied by `r` at the
 * draw site and by nothing else; a seam is a fact about the pattern, and the
 * only thing a row is allowed to change about one is how big it is.
 */
const SEAMS: readonly (readonly number[])[] = [
  // Across the top, left rim to right rim, bowing up.
  [
    -1.0, -0.029, -1.0, -0.029, -0.731, -0.552, -0.023, -0.606, 0.742, -0.664, 0.969, -0.247, 0.969,
    -0.247,
  ],
  // From the crown, bowing left, down to the lower right.
  [
    -0.036, -0.999, -0.036, -0.999, -0.652, -0.839, -0.606, -0.425, -0.551, 0.073, 0.934, 0.347,
    0.934, 0.347,
  ],
  // Upper left, bowing out to the rim, down to the lower right.
  [
    -0.787, -0.614, -0.787, -0.614, -0.953, -0.197, -0.497, 0.465, -0.167, 0.943, 0.458, 0.887,
    0.458, 0.887,
  ],
  // And the short one down the left rim, which is the panel the other three
  // cut off — the piece that stops the pattern reading as a cross.
  [
    -0.955, -0.299, -0.955, -0.299, -0.983, -0.121, -0.938, 0.116, -0.893, 0.353, -0.769, 0.637,
    -0.769, 0.637,
  ],
];
/** How wide a seam is drawn, as a share of the radius. Thick enough to carry a
 * colour at 26 px, thin enough that the rock is still the thing you see: at a
 * tenth the four of them read as a cage over a stone rather than as paint on
 * a ball. */
const SEAM_MUL = 0.07;
/** How far a seam's glow reaches past it, in the same share. The colour has to
 * survive a phone in a bright room, and a bare stroke this thin does not. */
const SEAM_GLOW = 2.4;

/**
 * The seams, in the colour of the body inside: `SEAMS` scaled to this ball and
 * clipped to its own contour.
 *
 * Each is stroked twice — once wide and faint for the glow that carries the
 * colour at the size a phone draws a body, once narrow and full for the line
 * itself. The clip is what keeps them painted *on* the stone: the rock's
 * contour is faceted and is inside `r` almost everywhere, so a seam drawn to
 * the rim overhangs it and four lines overhanging a rock read as a scribble
 * over one rather than as panels on it.
 */
export function drawSeams(
  ctx: CanvasRenderingContext2D,
  ball: Path2D,
  r: number,
  turn: number,
  glow: string,
): void {
  const path = new Path2D();
  for (const seam of SEAMS) {
    path.moveTo(seam[0]! * r, seam[1]! * r);
    for (let i = 2; i + 5 < seam.length; i += 6) {
      path.bezierCurveTo(
        seam[i]! * r,
        seam[i + 1]! * r,
        seam[i + 2]! * r,
        seam[i + 3]! * r,
        seam[i + 4]! * r,
        seam[i + 5]! * r,
      );
    }
  }

  ctx.save();
  ctx.rotate(turn);
  ctx.clip(ball);
  ctx.lineCap = "round";
  ctx.strokeStyle = glow;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = Math.max(1, r * SEAM_MUL * SEAM_GLOW);
  ctx.stroke(path);
  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(0.8, r * SEAM_MUL);
  ctx.stroke(path);
  ctx.restore();
}
