import type { Chart } from "./fleet-chart.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The water THE FLEET's chart stands on, and what closes over a hull that has
 * gone down in it.
 *
 * **The chart used to be a flat dark rectangle**, which is a perfectly good
 * lattice and not a sea. The owner asked for the sinking to look like a
 * sinking — waves, and then the ship gone into them — and a ship cannot go
 * *into* water that is a fill colour. So the surface moves: a long slow swell
 * crossing the squares, under the lattice and under everything a player has to
 * read. It carries no information at all, deliberately. Every square on this
 * chart is named out loud, and a surface that drew attention to one of them
 * would be a sixth thing on screen saying something.
 *
 * The swell runs on wall-clock `time` rather than on the beat. Nothing about
 * it touches a tile, and the two phones do not have to agree about where a
 * wave crest is — the same licence a creature's own ripple takes
 * (`ViewState.time`).
 */

/** Bands of swell across the chart. Four reads as water; eight reads as cloth. */
const BANDS = 4;
/** Samples along one band. Enough for a smooth crest at chart width. */
const STEPS = 14;

/**
 * The swell: four long crests drifting across the chart at different speeds.
 *
 * Filled bands rather than stroked lines, because a stroke of one pixel on a
 * dark ground reads as a scratch and a band of slightly paler water reads as
 * water. Each has its own speed and wavelength so the four never line up into
 * a pattern, and all of them are far too faint to compete with a mark.
 */
export function drawChartWater(ctx: CanvasRenderingContext2D, c: Chart, time: number): void {
  const w = c.cols * c.tile;
  const h = c.rows * c.tile;
  if (w <= 0 || h <= 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(c.left, c.top, w, h);
  ctx.clip();
  ctx.fillStyle = PALETTE.cyanDark;
  for (let b = 0; b < BANDS; b++) {
    // Spread down the chart, each drifting at its own rate. The `0.31`s are
    // there to keep the four out of phase with one another for good.
    const y = c.top + h * ((b + 0.5) / BANDS);
    const speed = 0.06 + b * 0.031;
    const wave = c.tile * (0.16 + 0.05 * b);
    const thick = c.tile * (0.2 + 0.06 * b);
    ctx.globalAlpha = 0.16 + 0.05 * b;
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i++) {
      const x = c.left + (w * i) / STEPS;
      const py = y + Math.sin(i * 0.9 + time * speed * 6 + b) * wave;
      if (i === 0) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    for (let i = STEPS; i >= 0; i--) {
      const x = c.left + (w * i) / STEPS;
      const py = y + Math.sin(i * 0.9 + time * speed * 6 + b) * wave + thick;
      ctx.lineTo(x, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Rings a sinking hull pushes out. Three, each a little behind the last. */
const RINGS = [0, 0.18, 0.36];
/** Bubbles that come up after it. Fixed positions — this package has no rng. */
const BUBBLES = 7;

/**
 * The water closing over a hull, drawn around the ship's own footprint.
 *
 * `sinking` is 0 the moment the last square is holed and 1 when the ship is
 * gone. Three things across that: rings leaving the hull along its own length,
 * a crest of foam that swells and dies with them, and bubbles that only start
 * once there is nothing left on the surface to explain them.
 *
 * Every ellipse is flattened. The chart is read as a surface seen at a slant —
 * that is why a splash leaves ellipses too (`fleet-impact.ts`) — and a circle
 * on it reads as a hole rather than as a ripple.
 */
export function drawSinkWash(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  long: number,
  vertical: boolean,
  sinking: number,
): void {
  if (sinking < 0 || sinking >= 1) return;
  ctx.save();
  ctx.translate(cx, cy);
  if (vertical) ctx.rotate(Math.PI / 2);

  ctx.strokeStyle = PALETTE.shield;
  ctx.lineWidth = STROKE.inner;
  for (const lag of RINGS) {
    const u = (sinking - lag) / (1 - lag);
    if (u <= 0) continue;
    ctx.globalAlpha = Math.max(0, 1 - u) * 0.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, long * (1 + 1.1 * u), long * (0.34 + 0.5 * u), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // The foam: a bright, broken crest right on the hull's edge, loudest halfway
  // through — when the deck is awash and there is still something to be awash.
  const crest = Math.sin(Math.min(1, sinking * 1.4) * Math.PI);
  if (crest > 0.01) {
    ctx.globalAlpha = crest * 0.85;
    ctx.strokeStyle = PALETTE.shieldRim;
    ctx.lineWidth = STROKE.outline;
    ctx.setLineDash([long * 0.16, long * 0.11]);
    ctx.beginPath();
    ctx.ellipse(0, 0, long * 1.02, long * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // And the bubbles, which begin only once the hull is more under than over.
  const up = Math.max(0, (sinking - 0.45) / 0.55);
  if (up > 0) {
    ctx.fillStyle = PALETTE.cyanRim;
    for (let i = 0; i < BUBBLES; i++) {
      // Its own start along the length, its own rate. Fixed functions of `i`,
      // so both phones raise the same bubbles in the same places.
      const along = (Math.sin(i * 2.3) * 0.7 - 0.05) * long;
      const t = Math.min(1, up * (0.6 + 0.4 * Math.abs(Math.cos(i * 1.7))));
      ctx.globalAlpha = Math.max(0, 1 - t) * 0.8;
      ctx.beginPath();
      ctx.arc(along, -long * 0.5 * t, Math.max(0.6, long * 0.05 * (1 - t * 0.4)), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
