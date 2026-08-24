import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The light inside the membrane, and the film on top of it.
 *
 * The ship is one closed contour with no panels and no plating, so the only
 * thing that can say what it is made of is the light: a lit interior, a thin
 * iridescent film that drifts across it, and a highlight that travels the way
 * one travels over a soap bubble. All three are strokes of the contour itself,
 * clipped to the inside — never rectangles. A straight edge anywhere on this
 * ship reads as a seam, and the membrane has no seams.
 */

/** The film, as a loop: it wraps, so the drift never reaches an end. */
const FILM = ["#4FE9E0", "#6E8CFF", "#C05CFF", "#FF6BD6", "#8B5BFF"] as const;

function mix(a: string, b: string, t: number): string {
  const ca = Number.parseInt(a.slice(1), 16);
  const cb = Number.parseInt(b.slice(1), 16);
  const ch = (shift: number): number =>
    Math.round(((ca >> shift) & 255) * (1 - t) + ((cb >> shift) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

/** The film colour at a position along the loop. `at` wraps, in turns. */
function film(at: number): string {
  const p = ((at % 1) + 1) * FILM.length;
  const i = Math.floor(p) % FILM.length;
  return mix(FILM[i] as string, FILM[(i + 1) % FILM.length] as string, p - Math.floor(p));
}

/**
 * The glow just under the skin.
 *
 * It used to be a gradient rectangle across the full width, starting at the
 * highest point of the contour — which meant that whenever the two lobes met
 * and the surface rose, a pale band slid up the whole hull and showed its own
 * straight lower edge. So the glow is a wide, soft stroke of the contour
 * itself, clipped to the inside of the hull: it follows every swelling exactly,
 * and the half that would spill into space is cut away by the clip rather than
 * by a horizontal line.
 */
export function innerLight(ctx: CanvasRenderingContext2D, body: Path2D, filled: Path2D): void {
  ctx.save();
  ctx.clip(filled);
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineCap = "round";
  for (const [width, alpha] of [
    [46, 0.05],
    [22, 0.06],
    [9, 0.08],
  ] as const) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.stroke(body);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * The soap film: the whole spectrum laid across the field at once, added on top
 * of the hull rather than blended into it, and drifting slowly sideways. Slow
 * on purpose — the beat is the only thing on this screen allowed to be fast.
 */
export function iridescence(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  filled: Path2D,
  l: Layout,
  time: number,
): void {
  ctx.save();
  ctx.clip(filled);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  const g = ctx.createLinearGradient(l.gridLeft, 0, l.gridLeft + l.gridWidth, 0);
  const drift = time * 0.045;
  const stops = 12;
  for (let i = 0; i <= stops; i++) g.addColorStop(i / stops, film(i / stops + drift));
  ctx.strokeStyle = g;

  for (const [width, alpha] of [
    [34, 0.06],
    [15, 0.07],
    [5, 0.09],
  ] as const) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.stroke(body);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * One bright spot travelling across the membrane, the way a highlight runs over
 * a bubble. It spends part of every pass outside the field, so the ship is not
 * permanently polished — the shimmer arrives, crosses, and leaves.
 */
export function sweep(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  filled: Path2D,
  l: Layout,
  time: number,
): void {
  const at = ((time * 0.075) % 1.55) - 0.3;
  if (at < -0.25 || at > 1.25) return;

  ctx.save();
  ctx.clip(filled);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  const g = ctx.createLinearGradient(l.gridLeft, 0, l.gridLeft + l.gridWidth, 0);
  for (const [offset, alpha] of [
    [-0.18, 0],
    [-0.07, 0.35],
    [0, 1],
    [0.07, 0.35],
    [0.18, 0],
  ] as const) {
    const x = at + offset;
    if (x > 0 && x < 1) g.addColorStop(x, `rgba(244,231,255,${alpha})`);
  }
  ctx.strokeStyle = g;
  for (const [width, alpha] of [
    [26, 0.07],
    [10, 0.1],
    [3, 0.14],
  ] as const) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.stroke(body);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
