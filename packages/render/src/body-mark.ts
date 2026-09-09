import { livingPath, livingSilhouette } from "@neon-spore/content";
import type { CreatureKind } from "@neon-spore/sim";
import { bakedCache } from "./baked.js";
import { drawDetails } from "./creature-detail.js";
import { strokeGlow } from "./glow.js";

/**
 * One living body, at a size, with no world around it.
 *
 * `living-draw.ts` next door draws a body **standing on the field**: it takes a
 * `Creature`, and everything about the drawing comes off that — the haze of
 * the row it is in, its own-motion, its lure's hole, its throb's turn, the beat
 * it is on. There is a second thing a body has to be, and it is not that one: a
 * *mark*, drawn at a place somebody else chose, at a size somebody else chose,
 * with nothing to be far away from and no beat to sway on.
 *
 * Player 2's fire buttons were the first — the button shows the creature the
 * colour is *for* — and THE PULSE's four lanes are the second and third, since
 * the owner replaced its arrows with the game's own bodies: a slick and a bulb
 * fall down two of the lanes and stand on two of the buttons. Three callers of
 * one drawing is exactly where a second spelling appears, so it is one
 * function.
 *
 * The contour is baked per kind and never per frame: it is drawn at `t = 0`,
 * which is the contour with the wobble at rest. A mark is not alive in the way
 * a body on the field is — it is a picture *of* one — so it does not breathe,
 * and a cache of four paths is the whole cost of it.
 */

const BLOBS = bakedCache<CreatureKind, Path2D>();

function blobFor(kind: CreatureKind): Path2D {
  const held = BLOBS.get(kind);
  if (held !== undefined) return held;
  const made = new Path2D(livingPath(livingSilhouette(kind), 0));
  BLOBS.set(kind, made);
  return made;
}

/** The three colours a body is painted in — `creature-tint.ts`'s `Tint`. */
export interface MarkTint {
  hex: string;
  rim: string;
  dark: string;
}

/**
 * Draw one, centred on `x`,`y`, at half-height `r`.
 *
 * Dark body, bright rim, interior detail: the field's own three passes, in the
 * field's own order, so a mark of a slick reads as the slick it is a picture
 * of rather than as a silhouette of one. The pen is divided back out of the
 * transform, the same arithmetic `drawLiving` does around its own body.
 */
export function drawLivingMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  kind: CreatureKind,
  tint: MarkTint,
): void {
  const shape = livingSilhouette(kind);
  const s = r / Math.max(shape.rx, shape.ry);
  const blob = blobFor(kind);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = tint.dark;
  ctx.fill(blob);
  strokeGlow(ctx, blob, tint.hex, Math.max(1, r * 0.15) / s, 1);
  // A mark is a still picture of one body: no rotation to undo and no clock,
  // so an interior with a light or a pulse in it draws its resting frame.
  drawDetails(ctx, kind, {
    hex: tint.hex,
    rim: tint.rim,
    dark: tint.dark,
    rx: shape.rx,
    ry: shape.ry,
    rot: 0,
    t: 0,
  });
  ctx.restore();
}
