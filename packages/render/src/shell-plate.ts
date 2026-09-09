import type { CreatureSilhouette } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";
import { bareArc, platePaths } from "./shell-cut.js";

/**
 * WHAT A PLATE IS MADE OF — the paint over the geometry next door.
 *
 * `shell-cut.ts` answers where the armour sits; this answers what it is. The
 * pass that finds the bodies and puts it at the right place on the field is
 * `shell-draw.ts`, the same seam `shell.ts` and `shell-round.ts` are split
 * along in the simulation, and `shell-look.ts` is the record a candidate look
 * patches — so the two functions at the bottom of this file are the *shipped*
 * answer rather than the only one.
 */

/** Dead, non-living material. Opaque, because the plate has to hide the half
 * of the body behind it — a translucent one would show the whole creature and
 * say nothing.
 *
 * Darker than `PALETTE.rockDark`, which a rock is filled with, and the
 * difference is the splits: light coming out of a crack only reads as light
 * if what surrounds it is darker than it is, and at `rockDark` the cyan came
 * out looking like a scratch on the plate rather than something behind it. */
export const PLATE = "#23222C";
/** The plate's lit outer edge. Hard and bright where the body's own outline
 * is soft and coloured; that contrast is most of what says "armour". */
export const PLATE_RIM = PALETTE.rock;

/** What one plate is drawn in: its own dead material, and the light of the
 * body behind it. All three already hazed by the caller, which owns the row. */
export interface PlateInk {
  plate: string;
  rim: string;
  light: string;
  lineWidth: number;
  /**
   * How far the body's own-motion has turned the local axes this frame
   * (`livingPose`). Nothing the shipped plate draws reads it — a fill and two
   * glows do not care which way is up — and a look that puts a light on the
   * plate does: `KEY` is a direction in *field* space, so it has to be turned
   * back by this or the highlight rides round with the sway, which is the one
   * thing a hard surface must not do.
   */
  rot: number;
}

/**
 * One plate: the half-body between its arc and the split, filled opaque,
 * rimmed hard, and then lit by the body's colour along the split and along
 * its own crack.
 */
export function drawPlate(
  ctx: CanvasRenderingContext2D,
  s: CreatureSilhouette,
  piece: number,
  seed: number,
  t: number,
  ink: PlateInk,
): void {
  const p = platePaths(s, piece, seed, t);

  ctx.fillStyle = ink.plate;
  ctx.fill(p.body);
  ctx.strokeStyle = ink.rim;
  ctx.lineWidth = ink.lineWidth;
  ctx.stroke(p.arc);

  // The light behind the plate, coming out of everything that is broken: the
  // split it will come apart along, and the crack across it. Drawn last so it
  // sits over the plate's own fill, and glowing rather than merely coloured,
  // because a hairline in the body's colour at 26 px is a hairline nobody sees.
  strokeGlow(ctx, p.edge, ink.light, ink.lineWidth * 0.9, 1);
  strokeGlow(ctx, p.crack, ink.light, ink.lineWidth * 0.7, 0.8);
}

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
 * Only the arc, never the split down the middle: the plate next door rims
 * only its arc too, and the split is where the body's light comes out.
 */
export function drawBareRim(
  ctx: CanvasRenderingContext2D,
  s: CreatureSilhouette,
  piece: number,
  t: number,
  ink: PlateInk,
): void {
  ctx.strokeStyle = ink.rim;
  ctx.lineWidth = ink.lineWidth;
  ctx.stroke(bareArc(s, piece, t));
}
