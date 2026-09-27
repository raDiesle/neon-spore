import { type InstarState, instarStep, type SimConfig } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { instarMarkPoint, instarMarkRadius, type Point } from "./instar-place.js";
import type { Figure } from "./instar-shape.js";
import { drawWeak } from "./instar-weak.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/** The heart where it beats this frame: `r` swells with the thump, `a` is its strength. */
export interface HeartBeat {
  at: Point;
  r: number;
  thump: number;
  a: number;
}

/** How the heart is painted — the seam VERSUS offers a baked look through. */
export const HEART_LOOK: { paint: (ctx: CanvasRenderingContext2D, beat: HeartBeat) => void } = {
  paint: (ctx, { at, r, thump, a }) => {
    const g = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, r * 2.2);
    g.addColorStop(0, rgba(PALETTE.redRim, 0.9 * a));
    g.addColorStop(0.25, rgba(PALETTE.red, (0.6 + 0.3 * thump) * a));
    g.addColorStop(0.6, rgba(PALETTE.ember, 0.25 * a));
    g.addColorStop(1, rgba(PALETTE.red, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(at.x, at.y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
    // The heart itself: two lobes and a point, the shape the word already is.
    const [p0, c1, c2, p1, c3, c4] = heartCurves(at, r);
    ctx.fillStyle = rgba(PALETTE.redRim, 0.85 * a);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p1.x, p1.y);
    ctx.bezierCurveTo(c3.x, c3.y, c4.x, c4.y, p0.x, p0.y);
    ctx.fill();
  },
};

/** The heart's half-height in its `r`, and how far below its paint point its middle falls, in that half-height. */
export const HEART_H = 0.55;
export const HEART_MID = 0.2;

/**
 * The heart's outline about `at`, `r` its size: the point, two controls, the
 * cleft, two controls — the second curve closes on the point. Painted this
 * way by the shipped look, and asked by the test that finds it round the
 * ring (`instar-heart.test.ts`).
 */
export function heartCurves(
  at: Point,
  r: number,
): readonly [Point, Point, Point, Point, Point, Point] {
  const h = r * HEART_H;
  const { x, y } = at;
  return [
    { x, y: y + h },
    { x: x - h * 1.4, y },
    { x: x - h * 0.6, y: y - h * 1.1 },
    { x, y: y - h * 0.35 },
    { x: x + h * 0.6, y: y - h * 1.1 },
    { x: x + h * 1.4, y },
  ];
}

/**
 * The heart's size in mark radii, at rest and added on the thump. The owner,
 * 27 September 2026: the ring sat over a heart no bigger than itself, so it
 * could not be seen. Sized off the ring rather than the tile, so it stays a
 * third of a mark radius clear of it at the ring's widest breath on every
 * side (`instar-heart.test.ts`) whatever size a mark is set to.
 */
export const HEART_SIZE = { rest: 4.6, thump: 1.15 } as const;

/**
 * The heart as it beats this frame over the mark at `mark`: its paint point
 * lifted so the middle of the shape, not its paint point, is on the mark.
 */
export function heartBeat(
  l: Layout,
  cfg: SimConfig,
  mark: Point,
  beatPhase: number,
  a: number,
): HeartBeat {
  // A beat is a thump and a slower easing off.
  const thump = Math.exp(-beatPhase * 5);
  const r = instarMarkRadius(l, cfg) * (HEART_SIZE.rest + HEART_SIZE.thump * thump);
  return { at: { x: mark.x, y: mark.y - r * HEART_H * HEART_MID }, r, thump, a };
}

/**
 * **The bare body's heart**, lit in the split along its back after the moult
 * (docs/spec/bosses.md §11.32, *The second act*): a glow that beats on the
 * music's beat where the step's heart mark is, under the ring, so the ring is
 * on something alive rather than on a stretch of body.
 *
 * Its strength is the figure's `heart`, which the morph brings in and every
 * bolt that lands puts out by its share of the count (`deformed`,
 * `instar-shape.ts`), so the four shots are four steps down to dark.
 */
export function drawInstarHeart(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: InstarState,
  f: Figure,
  sway: { xMilli: number; yMilli: number },
  beatPhase: number,
  fade: number,
  weak = 0,
): void {
  if (f.heart <= 0.01) return;
  const mark = instarStep(s)?.marks.find((m) => m.part === "heart");
  if (mark === undefined) return;
  const beat = heartBeat(l, cfg, instarMarkPoint(l, mark, sway, 0), beatPhase, f.heart * fade);
  ctx.save();
  HEART_LOOK.paint(ctx, beat);
  ctx.restore();
  const [p0, c1, c2, p1, c3, c4] = heartCurves(beat.at, beat.r);
  const outline = new Path2D();
  outline.moveTo(p0.x, p0.y);
  outline.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p1.x, p1.y);
  outline.bezierCurveTo(c3.x, c3.y, c4.x, c4.y, p0.x, p0.y);
  drawWeak(ctx, outline, weak * fade, "heart");
}
