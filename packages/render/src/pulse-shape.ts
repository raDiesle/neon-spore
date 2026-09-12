import {
  blobPath,
  crystalPath,
  livingPath,
  livingSilhouette,
  METEOR,
  POD,
} from "@neon-spore/content";
import type { PulseLane } from "@neon-spore/sim";
import { bakedCache } from "./baked.js";
import { drawLivingMark, type MarkTint } from "./body-mark.js";
import { drawRockBody } from "./meteor.js";
import { PALETTE } from "./palette.js";
import { drawPodBody } from "./pods.js";

/**
 * What falls down each of THE PULSE's four lanes, and what colour it is.
 *
 * **The four are the game's own bodies, not four arrows.** The round shipped
 * as Dance Dance Revolution unmodified and the owner replaced its arrows with
 * a slick, a bulb, a meteor and a pod: *change the arrows to be the following
 * elements instead.* Everything here is therefore a **call** into the drawing
 * the field already uses — `drawLivingMark` for the two living bodies,
 * `drawRockBody` for the stone, `drawPodBody` for the lamp — and not one line
 * of it paints a shape of its own. A second spelling of a slick is a slick
 * that drifts off the one the pair meet on every other wave.
 *
 * **Their colours are their own.** A slick is the red it is everywhere else, a
 * bulb the cyan, a meteor rock grey, a pod amber — four distinct colours
 * without inventing one, and no second meaning for red. That was the owner's
 * answer when he was asked; the alternative was tinting them to four lane hues,
 * which would have painted a slick violet, which it never is anywhere.
 *
 * **The empty contour is here too**, because the placeholders sunk into the
 * hull are the same four outlines with nothing in them (`pulse-body.ts` draws
 * one). Four callers of one contour is where a second copy appears, so the
 * contour lives here and every one of them calls it.
 */

/** What each lane is painted in, from the field's own palette. */
const TINT: Record<PulseLane, MarkTint> = {
  slick: { hex: PALETTE.red, rim: PALETTE.redRim, dark: PALETTE.redDark },
  bulb: { hex: PALETTE.cyan, rim: PALETTE.cyanRim, dark: PALETTE.cyanDark },
  meteor: { hex: PALETTE.rock, rim: PALETTE.sparkDim, dark: PALETTE.rockDark },
  pod: { hex: PALETTE.pod, rim: PALETTE.podRim, dark: PALETTE.podDark },
};

export const pulseLaneTint = (lane: PulseLane): MarkTint => TINT[lane];
export const pulseLaneColor = (lane: PulseLane): string => TINT[lane].hex;
export const pulseLaneRim = (lane: PulseLane): string => TINT[lane].rim;

/**
 * The lane's contour at half-height 1, centred on the origin.
 *
 * Baked per lane and never per frame: an outline sunk in the hull is a
 * *placeholder*, a picture of the body rather than the body, so it does not
 * breathe and four paths is the whole cost. The caller scales it, which is why
 * everything here is normalised to 1 rather than to the silhouette's own rx.
 */
const OUTLINES = bakedCache<PulseLane, Path2D>();

export function pulseLaneOutline(lane: PulseLane): Path2D {
  const held = OUTLINES.get(lane);
  if (held !== undefined) return held;
  const made = new Path2D(outlineFor(lane));
  OUTLINES.set(lane, made);
  return made;
}

function outlineFor(lane: PulseLane): string {
  if (lane === "meteor") {
    return crystalPath(0, 0, 1, 1, METEOR.sides, METEOR.depth, METEOR.wobble, 0, METEOR.seed);
  }
  const shape = lane === "pod" ? POD : livingSilhouette(lane);
  const k = Math.max(shape.rx, shape.ry);
  return lane === "pod"
    ? blobPath(0, 0, POD.rx / k, POD.ry / k, POD.lobes, POD.depth, POD.wobble, 0, POD.seed)
    : livingPath({ ...shape, rx: shape.rx / k, ry: shape.ry / k }, 0);
}

/**
 * One of the four, filled and lit, at a place and a size somebody else chose.
 *
 * `seed` is what makes two meteors on one screen face differently and two pods
 * pulse out of step; it comes out of the chart — a note's index — so both
 * devices agree about it without the simulation storing an angle.
 */
export function drawPulseBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  lane: PulseLane,
  time: number,
  seed: number,
): void {
  if (lane === "meteor") {
    // Two pits, which is what an unshot rock carries on the field.
    drawRockBody(ctx, x, y, r, time, seed, 2);
    return;
  }
  if (lane === "pod") {
    drawPodBody(ctx, x, y, r, time + (seed % 7) * 0.83, "ward");
    return;
  }
  drawLivingMark(ctx, x, y, r, lane, TINT[lane]);
}
