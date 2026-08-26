import {
  blobRadiusMul,
  catmullRomToBezierPath,
  livingSilhouette,
  type Point,
} from "@neon-spore/content";
import { type Color, livingKindForColor } from "@neon-spore/sim";
import { halo } from "./glow.js";

/** Points around the contour — the same count `blobPath` itself walks. */
const N = 40;

const mix = (a: number, b: number, k: number): number => a + (b - a) * k;

/** How big the spent mark's ball is, as a share of a creature's own radius. */
const BALL_SHARE = 0.34;

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
 * The question mark: what player 2 sees where player 1 sees a creature.
 *
 * It is not a placeholder for a shape that failed to load — it is the shape.
 * Player 2 is *not told* what is coming, and the mark says so in the one
 * character that means exactly that. Drawn in the same stroked-neon hand as
 * everything else on the field, with a slow tilt so it reads as alive rather
 * than as a glyph pasted on the hull.
 *
 * Stroked, never filled: a filled question mark at this size closes its own
 * counter and turns into a blob, which is the one thing it must not look
 * like here — there is a real blob a tile away.
 */
export function drawQuestionMark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  hex: string,
  time: number,
  alpha = 1,
): void {
  if (alpha <= 0) return;
  const s = r;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(time * 1.3) * 0.07);

  ctx.strokeStyle = hex;
  ctx.lineWidth = Math.max(1.5, s * 0.2);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // The hook: up the left shoulder, over the top, down the right side, then
  // tucked back into the centre and straight down into the stem.
  ctx.beginPath();
  ctx.moveTo(-0.4 * s, -0.4 * s);
  ctx.quadraticCurveTo(-0.42 * s, -0.95 * s, 0.02 * s, -0.95 * s);
  ctx.quadraticCurveTo(0.46 * s, -0.95 * s, 0.46 * s, -0.5 * s);
  ctx.quadraticCurveTo(0.46 * s, -0.14 * s, 0.06 * s, 0.06 * s);
  ctx.quadraticCurveTo(-0.02 * s, 0.12 * s, -0.02 * s, 0.34 * s);
  ctx.stroke();

  // The dot, set well clear of the stem so the gap survives the stroke width.
  ctx.beginPath();
  ctx.arc(-0.02 * s, 0.72 * s, s * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.fill();

  ctx.restore();
  halo(ctx, cx, cy, s * 1.5, hex, 0.12 * alpha);
}

/**
 * How big a question mark drawn *inside* a mark should be, given how tall
 * that mark currently is (`MarkOutline.ryShare`). Player 1 gets the creature
 * and the glyph at once — the shape says what is coming, the glyph says the
 * side is not theirs to know — so the glyph has to sit inside the silhouette
 * at both extremes of the morph: a bulb is round and roomy, a slick is half
 * as tall and would wear an unscaled glyph like a hat.
 */
export function innerQuestionRadius(r: number, ryShare: number): number {
  return r * (0.34 + 0.34 * ryShare);
}
