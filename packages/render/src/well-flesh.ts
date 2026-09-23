import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { splineInto } from "./spline.js";
import {
  wellAngle,
  wellAt,
  wellCenter,
  wellHub,
  wellRim,
  wellSectorAngle,
  wellSectors,
} from "./well.js";

/**
 * **THE WELL as a throat**: the flesh under the clock face `well-face.ts`
 * draws, so the board reads as a living thing a pair is looking down into and
 * not as a chart (`new-boss-more` §6.3).
 *
 * The bowl darkens toward the hub, which is what depth looks like from above.
 * The rim is a lip: a band of flesh outside the circle arrivals cross, lobed
 * once per lane, with a wet bead on every lobe. The lines between lanes sit in
 * grooves, as muscle does between its bands. The ship at the middle stands in
 * a wet socket, and a film of gloss lies on the far wall, the lower right,
 * which is the side a light from the upper left finds in a hollow.
 *
 * **The face stays the board.** Nothing here is a line an eye could count as a
 * row or a lane: the rings, the spokes, the seam and the numbers are drawn over
 * all of it, at their own weights, and every colour here is the sheen violet
 * under a quarter of its strength. The lobes are placed by `wellAngle`, so the
 * flesh rolls with the face (`well-roll.ts`). **Every width is off the tile.**
 */

/** How far the lip stands outside the rim, in tiles. */
const LIP = 0.26;
/** How deep a lobe of the lip is, as a share of the lip. */
const LOBE = 0.45;

/** The bowl's fill: deep at the hub, the flesh's own colour at the rim. */
function bowlFill(ctx: CanvasRenderingContext2D, l: Layout): CanvasGradient {
  const c = wellCenter(l);
  const hub = wellHub(l);
  const rim = wellRim(l);
  const g = ctx.createRadialGradient(c.x, c.y, hub, c.x, c.y, rim);
  g.addColorStop(0, rgba(PALETTE.sheenDeep, 0.95));
  g.addColorStop(0.55, rgba(PALETTE.sheenDeep, 0.55));
  g.addColorStop(0.9, rgba(PALETTE.sheenCold, 0.1));
  g.addColorStop(1, rgba(PALETTE.sheenMid, 0.2));
  return g;
}

/** Under the rings and spokes: the bowl, the grooves the spokes lie in, the
 * lip, the socket and the film. `time` breathes the lip; nothing else moves. */
export function drawWellFlesh(ctx: CanvasRenderingContext2D, l: Layout, time: number): void {
  ctx.save();
  drawBowl(ctx, l);
  drawGrooves(ctx, l);
  drawLip(ctx, l, time);
  drawSocket(ctx, l);
  drawFilm(ctx, l);
  ctx.restore();
}

/**
 * The bowl: a disc from the rim in, minus the seam's dead sector.
 *
 * Drawn as one wedge per column rather than as a circle with a bite out of it,
 * because that is what it is — eleven lanes and a gap — and because a ring cut
 * by two radial lines over the top of it reads as a circle with marks on it
 * rather than as a board with a wall in it. It was the face's own until the
 * face grew flesh, and it is the flesh's ground now.
 */
function drawBowl(ctx: CanvasRenderingContext2D, l: Layout): void {
  const c = wellCenter(l);
  const rim = wellRim(l);
  const hub = wellHub(l);
  const half = wellSectorAngle(l) / 2;
  ctx.fillStyle = bowlFill(ctx, l);
  for (let col = 0; col < l.cols; col++) {
    // Canvas angles run from the +x axis; the well's run clockwise from up, so
    // every one of them is a quarter turn behind. `wellAt` is the only other
    // place that conversion happens and it does it with a sine and a cosine.
    const mid = wellAngle(l, col) - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, rim, mid - half, mid + half);
    ctx.arc(c.x, c.y, hub, mid + half, mid - half, true);
    ctx.closePath();
    ctx.fill();
  }
}

/** A dark band under every spoke, so a lane is a raised band of muscle and
 * the line between two is the fold between them. */
function drawGrooves(ctx: CanvasRenderingContext2D, l: Layout): void {
  const hub = wellHub(l);
  const rim = wellRim(l);
  const half = wellSectorAngle(l) / 2;
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.7);
  ctx.lineWidth = Math.max(2, l.tile * 0.16);
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let col = 0; col < l.cols; col++) {
    for (const side of [-1, 1]) {
      const a = wellAngle(l, col) + side * half;
      const from = wellAt(l, a, hub);
      const to = wellAt(l, a, rim);
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
    }
  }
  ctx.stroke();
}

/** The lip: a lobed band of flesh from the rim out, one lobe a lane with its
 * swell on the lane's middle, lit on its outer edge and beaded where it is
 * fullest. */
function drawLip(ctx: CanvasRenderingContext2D, l: Layout, time: number): void {
  const c = wellCenter(l);
  const rim = wellRim(l);
  const lip = l.tile * LIP;
  const sectors = wellSectors(l);
  const breath = 1 + 0.06 * Math.sin(time * 0.9);
  const outer = (a: number): number => {
    const phase = (a - wellAngle(l, 0)) * sectors;
    return rim + lip * breath * (1 - LOBE + LOBE * (0.5 + 0.5 * Math.cos(phase)));
  };
  const N = sectors * 8;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    pts.push(wellAt(l, a, outer(a)));
  }
  const band = new Path2D();
  splineInto(band, pts, true);
  band.moveTo(c.x + rim, c.y);
  band.arc(c.x, c.y, rim, 0, Math.PI * 2, true);

  const g = ctx.createRadialGradient(c.x, c.y, rim, c.x, c.y, rim + lip);
  g.addColorStop(0, rgba(PALETTE.sheenMid, 0.28));
  g.addColorStop(0.6, rgba(PALETTE.sheenCold, 0.16));
  g.addColorStop(1, rgba(PALETTE.sheenDeep, 0.5));
  ctx.fillStyle = g;
  ctx.fill(band, "evenodd");
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.18);
  ctx.lineWidth = Math.max(1, l.tile * 0.03);
  ctx.stroke(splineOnly(pts));

  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.3);
  const bead = Math.max(0.7, l.tile * 0.035);
  for (let col = -1; col < l.cols; col++) {
    const a = wellAngle(l, col);
    const at = wellAt(l, a - 0.05, outer(a) - lip * 0.25);
    ctx.beginPath();
    ctx.arc(at.x, at.y, bead, 0, Math.PI * 2);
    ctx.fill();
  }
}

function splineOnly(pts: readonly { x: number; y: number }[]): Path2D {
  const p = new Path2D();
  splineInto(p, pts, true);
  return p;
}

/** The ship's socket: the bowl sunk darkest just round the hub, its far lip
 * wet and catching the light. */
function drawSocket(ctx: CanvasRenderingContext2D, l: Layout): void {
  const c = wellCenter(l);
  const hub = wellHub(l);
  const g = ctx.createRadialGradient(c.x, c.y, hub, c.x, c.y, hub * 1.35);
  g.addColorStop(0, rgba(PALETTE.sheenDeep, 0.9));
  g.addColorStop(1, rgba(PALETTE.sheenDeep, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(c.x, c.y, hub * 1.35, 0, Math.PI * 2);
  ctx.arc(c.x, c.y, hub, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.3);
  ctx.lineWidth = Math.max(1, l.tile * 0.05);
  ctx.beginPath();
  ctx.arc(c.x, c.y, hub * 1.1, Math.PI * 0.05, Math.PI * 0.65);
  ctx.stroke();
}

/** The film on the far wall: a soft sheen along the inside of the rim, lower
 * right, where a hollow lit from the upper left shines, brightest at its
 * middle and gone at its ends. */
function drawFilm(ctx: CanvasRenderingContext2D, l: Layout): void {
  const c = wellCenter(l);
  const rim = wellRim(l);
  ctx.lineCap = "round";
  for (const [from, to, alpha, width] of [
    [0.1, 0.55, 0.05, 0.5],
    [0.18, 0.47, 0.07, 0.3],
    [0.25, 0.4, 0.1, 0.12],
  ] as const) {
    ctx.strokeStyle = rgba(PALETTE.sheenRim, alpha);
    ctx.lineWidth = l.tile * width;
    ctx.beginPath();
    ctx.arc(c.x, c.y, rim - l.tile * 0.45, Math.PI * from, Math.PI * to);
    ctx.stroke();
  }
}
