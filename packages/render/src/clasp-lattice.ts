import { PALETTE } from "./palette.js";

/**
 * The honeycomb inside THE CLASP's bubble.
 *
 * The owner asked for it by name, with a picture: a lit sphere whose surface
 * is a lattice of hexagons, brighter at the rim, wrapped in a wide radiant
 * glow. So this is not a texture painted flat across a disc — a flat grid of
 * regular hexagons reads as a hexagon *wallpaper* with a circle cut out of
 * it, which is the one thing the reference is not. It is a grid on a sphere,
 * and the sphere is what the warp below buys.
 *
 * **The warp is the whole trick.** A cell is laid out on a flat unit disc and
 * every point of it is then pushed through `sin(d * π/2)`: a distance `d`
 * from the centre becomes a screen radius `sin` of it. That is the orthographic
 * projection of a sphere — the same reason a globe's squares crowd towards its
 * outline — so cells near the rim compress into slivers and the ball reads as
 * round before a single highlight has been drawn on it.
 *
 * Nothing here is stored between calls. The lattice's slow turn is read off
 * `time` alone, the way `shield-spark.ts`'s arcs are and for the same reason:
 * `time` goes back to zero on a wave restart, so a formula of it needs no
 * entry in `Effects.reset()`.
 */

/** Cell size, centre to corner, as a share of the ball's radius. */
const CELL = 0.235;
/** The drawn hexagon, as a share of `CELL` — the gap is the seam between cells. */
const INSET = 0.9;
/** How fast the shell turns, in radians per second. Slow enough to read as drift. */
const SPIN = 0.3;
/** Beyond this planar radius a cell is a sliver on the horizon and is skipped. */
const HORIZON = 0.97;
/** Inside this planar radius a cell is over the body, and draws faint. */
const FACE = 0.52;

/** Sphere, not disc: a planar distance becomes the radius it projects to. */
function project(d: number): number {
  return Math.sin(Math.min(1, d) * (Math.PI / 2));
}

/**
 * One warped hexagon's corners, in screen pixels around `(cx, cy)`.
 *
 * The corners are warped individually rather than the centre being warped and
 * a regular hexagon drawn around it. That costs six `sin` calls and buys the
 * only thing that makes the projection legible: a cell near the rim comes out
 * *bent*, its outer edge shorter than its inner one, which is what a real
 * facet on a sphere does.
 */
function cellCorners(
  u: number,
  v: number,
  cx: number,
  cy: number,
  r: number,
  spin: number,
): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 180) * (30 + 60 * k);
    const px = u + Math.cos(a) * CELL * INSET;
    const py = v + Math.sin(a) * CELL * INSET;
    const d = Math.hypot(px, py);
    const angle = Math.atan2(py, px) + spin;
    const rr = project(d) * r;
    pts.push([cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr]);
  }
  return pts;
}

/**
 * The lattice, drawn inside a ball of radius `r` at `(cx, cy)`.
 *
 * `lit` is `claspResonance` — the ship's shield standing in this column — and
 * it does one thing here: turns the seams up. The geometry is identical either
 * way, so what a player sees change is the light on a structure they already
 * know the shape of, rather than a second structure arriving.
 *
 * Additive, thin, and never a fill: the body inside the bubble is the colour
 * player 2 has to be able to read, and a honeycomb that shades its own cells
 * is a lid over that colour however pretty it is on its own.
 */
export function drawClaspLattice(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  time: number,
  lit: number,
): void {
  const spin = time * SPIN;
  const rowStep = CELL * 1.5;
  const colStep = CELL * Math.sqrt(3);
  const rows = Math.ceil(1 / rowStep) + 1;
  const cols = Math.ceil(1 / colStep) + 1;

  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = PALETTE.claspShieldRim;
  ctx.lineWidth = Math.max(0.6, r * 0.045);
  // Two passes, and the reason is the body inside. The face of the sphere is
  // the one place the slick's or the bulb's own colour can be read, and a
  // comb at one brightness right across it is a lid over the word player 2
  // has to hear. So the cells near the rim — which is where the projection
  // crowds them anyway, and where the reference is brightest — carry the
  // structure, and the ones over the middle are barely there.
  for (const near of [false, true]) {
    ctx.beginPath();
    let drawn = 0;
    for (let j = -rows; j <= rows; j++) {
      for (let i = -cols; i <= cols; i++) {
        const u = colStep * (i + j / 2);
        const v = rowStep * j;
        const d = Math.hypot(u, v);
        if (d > HORIZON) continue;
        if (d >= FACE !== near) continue;
        const pts = cellCorners(u, v, cx, cy, r, spin);
        ctx.moveTo(pts[0]![0], pts[0]![1]);
        for (let k = 1; k < 6; k++) ctx.lineTo(pts[k]![0], pts[k]![1]);
        ctx.closePath();
        drawn++;
      }
    }
    // One stroke for the whole pass rather than one per cell: the seams are a
    // single figure, and fifty strokes of the same style is fifty state
    // changes on a phone GPU for a picture that cannot tell them apart.
    if (drawn === 0) continue;
    ctx.globalAlpha = near ? 0.34 + 0.4 * lit : 0.12 + 0.16 * lit;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}
