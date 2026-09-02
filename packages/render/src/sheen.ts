import { hash01 } from "./backdrop.js";
import { halo } from "./glow.js";
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
  const ch = (shift: number): string =>
    Math.round(((ca >> shift) & 255) * (1 - t) + ((cb >> shift) & 255) * t)
      .toString(16)
      .padStart(2, "0");
  // `#rrggbb`, not `rgb()`: `halo` appends a hex alpha to whatever it is given.
  return `#${ch(16)}${ch(8)}${ch(0)}`;
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
/**
 * Every one of the five passes below (`innerLight` here through `dither`) used
 * to open its own `save`/`clip(filled)`/`restore` — five clips a frame against
 * the same 140-segment hull path. `hull.ts` now opens one save/clip around all
 * five and restores once at the end, so each pass here sets the state it
 * needs rather than relying on a `restore` to have put the canvas back. A
 * pass that reads state without setting it first is a bug this file no longer
 * catches for free — see `dither`'s composite-operation reset below, the one
 * place that matters: every other value (strokeStyle, lineCap, lineWidth,
 * globalAlpha) each pass sets before it uses it.
 */
export function innerLight(ctx: CanvasRenderingContext2D, body: Path2D): void {
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
}

/**
 * The soap film: the whole spectrum laid across the field at once, added on top
 * of the hull rather than blended into it, and drifting slowly sideways. Slow
 * on purpose — the beat is the only thing on this screen allowed to be fast.
 */
export function iridescence(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  l: Layout,
  time: number,
): void {
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
}

/**
 * One bright spot travelling across the membrane, the way a highlight runs over
 * a bubble. It spends part of every pass outside the field, so the ship is not
 * permanently polished — the shimmer arrives, crosses, and leaves.
 */
export function sweep(ctx: CanvasRenderingContext2D, body: Path2D, l: Layout, time: number): void {
  const at = ((time * 0.075) % 1.55) - 0.3;
  if (at < -0.25 || at > 1.25) return;

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
}

/**
 * Bioluminescence: a handful of soft lights adrift under the skin, each one a
 * different colour off the film, each on its own slow course. This is what
 * makes the ship read as a living thing rather than a lit shape — a jellyfish
 * is dark where it is thick and bright in patches, and the patches move.
 *
 * `surfaceY` is the membrane above a given x, so a light hangs under the skin
 * and rises with a lobe instead of swimming through the middle of the hull.
 */
export function bloom(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  surfaceY: (x: number) => number,
): void {
  for (let i = 0; i < 5; i++) {
    // Coprime-ish speeds, so the five never line up into a row.
    const u = (0.11 + i * 0.23 + time * (0.013 + i * 0.004)) % 1;
    const x = l.gridLeft + u * l.gridWidth;
    const breathe = 0.62 + 0.38 * Math.sin(time * (0.5 + i * 0.17) + i * 2.1);
    const y = surfaceY(x) + l.tile * (0.55 + 0.75 * breathe);
    // A fixed colour and a radius in whole steps: `halo` caches one sprite per
    // pair, so a value that moves every frame caches a canvas every frame.
    const radius = Math.round((l.tile * (1.1 + 0.5 * breathe)) / 4) * 4;
    // `halo` saves and restores globalCompositeOperation/globalAlpha around
    // itself, so it needs nothing reset before it and leaves nothing behind.
    halo(ctx, x, y, radius, FILM[i] as string, 0.1 + 0.12 * breathe);
  }
}

/**
 * Dither.
 *
 * A gradient across a hull this large steps through the 8-bit ramp slowly
 * enough that the steps themselves are visible as bands — the eye finds an edge
 * in a wall of one colour that no amount of extra colour stops removes. A film
 * of noise under a twentieth of a level breaks the band up: too little to read
 * as grain, enough that no two neighbouring pixels round to the same step.
 */
let grain: CanvasPattern | null = null;

function grainPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (grain) return grain;
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return null;
  const img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = 255;
    img.data[i + 1] = 255;
    img.data[i + 2] = 255;
    // Deterministic, not `Math.random`: the same pixel index always gives the
    // same value, so the grain is a fixed texture rather than a fresh roll
    // per device — see `hash01` in backdrop.ts, the same pattern the motes
    // use. It is a *different* fixed noise than the old random draw, not the
    // same one reseeded — intentional, and the one place this lane's render
    // output is not pixel-identical to what shipped before it.
    img.data[i + 3] = hash01(i / 4) * 26;
  }
  g.putImageData(img, 0, 0);
  grain = ctx.createPattern(c, "repeat");
  return grain;
}

export function dither(ctx: CanvasRenderingContext2D, filled: Path2D): void {
  const pattern = grainPattern(ctx);
  if (!pattern) return;
  // The one value the shared save/clip in `hull.ts` cannot guarantee: this is
  // the last of the five passes, and `iridescence`/`sweep` before it both
  // leave `globalCompositeOperation` at `"lighter"`. Dither is a plain fill,
  // not an additive one — this used to come free from each pass's own
  // `restore`, and now has to be asked for.
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = pattern;
  ctx.fill(filled);
  ctx.globalAlpha = 1;
}
