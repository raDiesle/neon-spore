import type { CreatureSilhouette } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { bareArc } from "./shell-cut.js";
import { litFace, type PlateInk } from "./shell-plate.js";

/**
 * The half that has already been chipped: no plate, but the same hard grey
 * edge the surviving plate is rimmed with, traced along the *body's* own
 * contour rather than the plating's — the body underneath stands at its true
 * size, and this is a border on it, not a ghost of the armour that left.
 *
 * The reason it is drawn at all is the pair's problem, not a decorative one:
 * with one plate on and one off, the two halves of a shell are a hard rim and
 * a soft coloured outline standing side by side, and the rim on the bare half
 * says *this body is still a shell* while the missing plate says *this is the
 * side that is already open*. Once the last plate goes, `drawShellArmour`
 * stops before reaching here and the body is drawn with its own outline
 * alone — which is exactly what "no armour left" has to look like.
 *
 * It is the same material as the plate beside it or the body wears two
 * answers, so it is the same colour at the same strength on either half, with
 * the lit edge on top only where the key reaches it. There is no plate left to
 * lift, which is also the honest picture of a rim with nothing standing on it.
 *
 * Only the arc, never the split down the middle: the plate next door rims
 * only its arc too, and the split is where the body's colour comes out.
 *
 * Its own file since 20 September 2026, cut out of `shell-plate.ts` at its
 * line limit along the seam the two already had: that one paints armour that
 * is there, this one the edge of armour that is gone.
 */
export function drawBareRim(
  ctx: CanvasRenderingContext2D,
  s: CreatureSilhouette,
  piece: number,
  t: number,
  ink: PlateInk,
): void {
  const lit = litFace(piece, ink.rot);
  const arc = bareArc(s, piece, t);
  ctx.strokeStyle = rgba(ink.rim, 0.75);
  ctx.lineWidth = ink.lineWidth;
  ctx.stroke(arc);
  if (lit > 0.12) {
    ctx.strokeStyle = rgba(PALETTE.text, 0.1 + 0.4 * lit);
    ctx.lineWidth = ink.lineWidth * 0.5;
    ctx.stroke(arc);
  }
}
