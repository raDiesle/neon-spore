import {
  blobRadiusMul,
  catmullRomToBezierPath,
  livingSilhouette,
  type Point,
} from "@neon-spore/content";
import { type Color, livingKindForColor } from "@neon-spore/sim";

/** Points around the contour — the same count `blobPath` itself walks. */
const N = 40;

const mix = (a: number, b: number, k: number): number => a + (b - a) * k;

/** How big the spent mark's ball is, as a share of a creature's own radius. */
const BALL_SHARE = 0.34;

/** How much of the mark's own half-extent the frame inside it takes. Well
 * under one: a frame on the contour reads as the body's own edge. */
const INNER_SHARE = 0.6;

/** The outline of a creature part-way through turning into something else. */
export interface MarkOutline {
  /** Path data in silhouette units, centred on the origin. */
  d: string;
  /** Divide by this to reach radius-1 units — the creature's own half-extent,
   * never the ball's, so balling up genuinely shrinks the mark instead of
   * being normalised straight back to full size. */
  norm: number;
  /** The creature blend's half-height over `norm`, for sizing what goes inside it. */
  ryShare: number;
}

/**
 * The mark's outline: one living contour blended into the other, and the
 * result blended again towards a small ball.
 *
 * Not a cross-fade of drawings. Both silhouettes are sampled at the same
 * angles through `blobRadiusMul` — the very function `blobPath` walks to draw
 * either of them on its own — and the radii are mixed before a single outline
 * is built from the result. So a slick genuinely rounds up into a bulb rather
 * than one picture dissolving over another, and there is never a frame with
 * two contours in it.
 *
 * `k` is 0 at `from` and 1 at `to`. The aspect blends too, which is most of
 * what the eye reads: a slick is twice as wide as it is tall, a bulb is
 * round, and the squash between them is the whole movement.
 *
 * `ball` is 0 for the creature and 1 for the ball the mark that stayed shut
 * shrinks to while the other one is open. It is a third target in the same
 * blend rather than a separate shape, so the mark shrinks and rounds in one
 * continuous move and grows back out of it the same way.
 */
export function markOutline(
  from: Color,
  to: Color,
  k: number,
  ball: number,
  t: number,
): MarkOutline {
  const a0 = livingSilhouette(livingKindForColor(from));
  const b0 = livingSilhouette(livingKindForColor(to));
  const creatureRx = mix(a0.rx, b0.rx, k);
  const creatureRy = mix(a0.ry, b0.ry, k);
  const norm = Math.max(creatureRx, creatureRy);

  const ballR = norm * BALL_SHARE;
  const rx = mix(creatureRx, ballR, ball);
  const ry = mix(creatureRy, ballR, ball);

  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const creature = mix(
      blobRadiusMul(a, a0.lobes, a0.depth, a0.wobble, t, a0.seed),
      blobRadiusMul(a, b0.lobes, b0.depth, b0.wobble, t, b0.seed),
      k,
    );
    // A ball has no lobes and no wobble: a flat multiplier of 1 is a circle.
    const m = mix(creature, 1, ball);
    pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
  }
  return { d: catmullRomToBezierPath(pts), norm, ryShare: creatureRy / norm };
}

/**
 * How big a target lock drawn *inside* a mark should be, given how tall that
 * mark currently is (`MarkOutline.ryShare`).
 *
 * Player 1 gets the creature and the frame at once — the shape says what is
 * coming, the frame says the side is not theirs to know — so the frame has to
 * sit inside the silhouette at both extremes of the morph: a bulb is round and
 * roomy, a slick is half as tall and would wear an unscaled mark like a hat.
 * It takes the mark's own aspect, which is why it is a rectangle and not a
 * square: a frame as tall as it is wide inside a slick is a frame with its top
 * and bottom outside the body.
 *
 * There used to be a question mark here instead, drawn as a hook and a dot.
 * `target-lock.ts` carries why it is a frame now, and it is the owner's
 * reversal rather than this file's.
 */
export function innerLockHalf(r: number, ryShare: number): { halfW: number; halfH: number } {
  return { halfW: r * INNER_SHARE, halfH: r * INNER_SHARE * ryShare };
}
