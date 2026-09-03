import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";
import type { Arena } from "./snake-draw.js";
import type { Point } from "./snake-skin.js";

/**
 * What the acid does when it stops moving.
 *
 * Split off `snake-shot.ts` because the two halves are about different things
 * and both are the size of a file: next door is a *flight* — a mass with a
 * tail, thrown along a line and arriving — and here is a *surface*, which is a
 * pool spreading, eating what it lands on and boiling off. Nothing here knows
 * which way the head was pointing, and nothing next door knows what a tile
 * looks like once it has been hit.
 *
 * **Why it is a pool and not a flash.** The owner asked for acid, and the one
 * thing acid does that fire does not is *stay*: it lands, it spreads to a
 * ragged edge, it bubbles where it is working, and it thins out from the
 * middle rather than going out all at once. A ring that expanded and vanished
 * would be an explosion drawn in green.
 *
 * Every number here is fixed rather than rolled: `packages/render` has no rng
 * and wants none, so the ragged edge and the bubbles are written down and two
 * devices draw the same splash.
 */

/**
 * The pool's outline, as a share of its radius at each of ten points around
 * it. The variation is deliberately shallow: a pool of liquid has a *ragged*
 * edge, not a spiky one, and a first pass at this alternated 1.0 with 0.7 and
 * came out as a diamond somebody had drawn on the tile.
 */
const EDGE = [1, 0.9, 0.97, 0.86, 1.02, 0.92, 0.88, 0.99, 0.87, 0.95];
/** Bubbles working in it: across, along, and how big, in shares of the radius. */
const BUBBLES = [
  [-0.34, -0.2, 0.2],
  [0.28, -0.36, 0.15],
  [0.1, 0.3, 0.24],
  [-0.16, 0.44, 0.13],
  [0.46, 0.14, 0.17],
];
/** Runs of acid off the pool: which way, and how far, in shares of the radius. */
const RUNS = [
  [0.5, 1.5],
  [2.4, 1.25],
  [4.3, 1.4],
];

/**
 * The pool where the spit landed. `at` is the tile's centre, `hit` says
 * whether there was a body on it, and `t` runs 0 to 1 across the rest of the
 * shot's fade — before 0 nothing has landed yet.
 *
 * A hit is bigger and brighter than a miss, and that is the whole of what the
 * two look like: the reach ran out either way, and what changed is whether
 * anything was standing where it ran out.
 */
export function acidEtch(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  at: Point,
  hit: boolean,
  t: number,
): void {
  if (t <= 0) return;
  const age = Math.max(0, Math.min(1, t));
  // Spreads fast and then holds: a liquid finds its edge in the first moment
  // and spends the rest of its time thinning.
  const spread = Math.min(1, age * 3.2);
  const r = arena.tile * (hit ? 0.42 : 0.24) * (0.55 + 0.45 * spread);

  ctx.save();
  ctx.globalAlpha *= (hit ? 1 : 0.75) * (1 - age * 0.6);

  // A wash under it, so the tile itself reads as lit by what is lying on it.
  halo(ctx, at.x, at.y, r * 2.2, PALETTE.venom, 0.22 * (1 - age));
  runs(ctx, at, r, spread);
  pool(ctx, at, r);
  // Pale in the body of it and still green at the rim: a pool of something
  // bright has its light in the middle, and the outer stop was `venomDeep`
  // once, which turned the whole splash into a dark ring.
  const g = ctx.createRadialGradient(at.x, at.y, r * 0.1, at.x, at.y, r);
  g.addColorStop(0, PALETTE.venomRim);
  g.addColorStop(0.4, PALETTE.venom);
  g.addColorStop(1, PALETTE.venomDeep);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = PALETTE.venomRim;
  ctx.lineWidth = 1.6;
  ctx.globalAlpha *= 0.8;
  ctx.stroke();
  ctx.globalAlpha /= 0.8;

  bubbles(ctx, at, r, age);
  ctx.restore();
}

/**
 * The pool's contour, as a closed smooth curve rather than a ring of straight
 * edges: every segment is a quadratic through the midpoint between two
 * neighbours, which is the cheapest closed curve that has no corners in it.
 */
function pool(ctx: CanvasRenderingContext2D, at: Point, r: number): void {
  const n = EDGE.length;
  const px = (i: number): Point => {
    const a = ((i % n) / n) * Math.PI * 2;
    const mul = EDGE[i % n] ?? 1;
    return { x: at.x + Math.cos(a) * r * mul, y: at.y + Math.sin(a) * r * mul };
  };
  const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = mid(px(0), px(1));
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  for (let i = 1; i <= n; i++) {
    const here = px(i);
    const next = mid(here, px(i + 1));
    ctx.quadraticCurveTo(here.x, here.y, next.x, next.y);
  }
  ctx.closePath();
}

/**
 * The bubbles: rings rather than discs, because what says *working* is a wall
 * of liquid standing up round a gap. They open as the pool ages, which is the
 * only motion in the whole splash and the only thing that says it is not paint.
 */
function bubbles(ctx: CanvasRenderingContext2D, at: Point, r: number, age: number): void {
  ctx.strokeStyle = PALETTE.venomRim;
  ctx.lineWidth = 1.1;
  for (const [i, b] of BUBBLES.entries()) {
    const [bx, by, size] = b as [number, number, number];
    // Each one starts a little after the one before it, so they come up in
    // sequence rather than all at once.
    const own = Math.max(0, Math.min(1, (age - i * 0.09) * 2.4));
    if (own <= 0) continue;
    ctx.globalAlpha *= 0.85 * (1 - own * 0.6);
    ctx.beginPath();
    ctx.arc(at.x + bx * r, at.y + by * r, r * size * (0.3 + 0.8 * own), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha /= 0.85 * (1 - own * 0.6);
  }
}

/**
 * Three runs of acid off the edge of the pool — a tapered smear each, in a
 * fixed direction. It is what stops the splash reading as a circle somebody
 * stamped on the tile.
 */
function runs(ctx: CanvasRenderingContext2D, at: Point, r: number, spread: number): void {
  ctx.fillStyle = PALETTE.venom;
  ctx.globalAlpha *= 0.7;
  for (const run of RUNS) {
    const [a, reach] = run as [number, number];
    const far = r * reach * spread;
    const wide = r * 0.22;
    const cx = Math.cos(a);
    const cy = Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(at.x - cy * wide, at.y + cx * wide);
    ctx.quadraticCurveTo(
      at.x + cx * far * 0.6 - cy * wide * 0.5,
      at.y + cy * far * 0.6 + cx * wide * 0.5,
      at.x + cx * far,
      at.y + cy * far,
    );
    ctx.quadraticCurveTo(
      at.x + cx * far * 0.6 + cy * wide * 0.5,
      at.y + cy * far * 0.6 - cx * wide * 0.5,
      at.x + cy * wide,
      at.y - cx * wide,
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha /= 0.7;
}

/**
 * The highlight on a drop: a small pale ellipse up and to the left of centre,
 * where the arena's light is (`snake-skin.ts`).
 *
 * It is the whole of what makes a green fill read as *fluid* rather than as
 * green light, and it costs one ellipse. Here rather than next door because
 * both files put one on something.
 */
export function wet(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.save();
  ctx.globalAlpha *= 0.8;
  ctx.fillStyle = PALETTE.venomRim;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.3, y - r * 0.34, r * 0.36, r * 0.24, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
