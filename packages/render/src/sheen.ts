import { hash01 } from "./backdrop.js";
import type { Layout } from "./layout.js";

/**
 * The two membrane passes the wet skin still draws: a highlight that travels
 * the way one travels over a soap bubble (`sweep`, from `gland-wet.ts`), and a
 * grain under a twentieth of a level (`dither`, from `gland-join.ts`). The
 * lit interior, the drifting film and the lights under the skin that used to
 * sit beside them went when GLAND took the ship (`hull-sheen.ts`).
 *
 * Neither opens a save/clip of its own: each runs inside its caller's clip,
 * so each sets the state it needs rather than relying on a `restore` to have
 * put the canvas back — see `dither`'s composite-operation reset below.
 */

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
  // The one value a caller's clip cannot guarantee: `sweep` and the wet
  // skin's other strokes leave `globalCompositeOperation` at `"lighter"`, and
  // dither is a plain fill, not an additive one.
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = pattern;
  ctx.fill(filled);
  ctx.globalAlpha = 1;
}
