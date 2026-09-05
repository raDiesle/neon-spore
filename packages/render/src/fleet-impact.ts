import type { Chart } from "./fleet-chart.js";
import { chartX, chartY } from "./fleet-chart.js";
import { halo } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * What a shell does when it arrives: a rocket into a hull, or a column of
 * water where there was nothing.
 *
 * **The two have to be told apart at a glance, and by shape rather than by
 * colour.** The navigator is shown no ships at all, so the burst in the square
 * they aimed at is the first thing on their screen that answers the sentence
 * they have just been counting out. A hit throws fire *outwards* — a flash, a
 * ring leaving the square, shards on the flat; a splash throws water *upwards*
 * — a plume that rises, hangs and falls back into rings. One spreads, the
 * other stands up. That difference survives a glance across a room where a
 * pair of colours would not.
 *
 * Nothing here is random. Every shard and every drop is a fixed function of
 * its own index, for the reason `snake-shot.ts` gives: this package has no rng
 * and wants none, and two phones drawing the same square differently is the
 * one thing a shared chart cannot afford.
 *
 * The clock is `fleet-fx.ts`'s. This file is the paint.
 */

/** Shards a hit throws, and drops a splash does. Enough to read, few enough to draw. */
const SHARDS = 9;
const DROPS = 11;

/** An angle for the nth piece. Spread evenly and turned, so no two look alike. */
function spoke(i: number, n: number): number {
  return (i / n) * Math.PI * 2 + Math.sin(i * 2.7) * 0.34;
}

/** How far the nth piece gets, as a share of the others. */
function reach(i: number): number {
  return 0.62 + 0.38 * Math.abs(Math.sin(i * 1.9 + 0.7));
}

/**
 * A rocket into a hull. `t` runs 0..1 across the burst.
 *
 * Four things in the one picture, each with its own share of the clock: the
 * flash, which is over almost before it is seen; the shockwave, a thin ring
 * that leaves the square and is gone; the fireball, which swells and then
 * darkens into smoke rather than fading; and the shards, which fly flat and
 * outrun all three.
 */
export function drawFleetHitBurst(
  ctx: CanvasRenderingContext2D,
  c: Chart,
  col: number,
  row: number,
  t: number,
): void {
  const x = chartX(c, col);
  const y = chartY(c, row);
  ctx.save();

  // The flash. A hard white core for the first tenth, and nothing after it.
  const flash = Math.max(0, 1 - t * 9);
  if (flash > 0) {
    halo(ctx, x, y, c.tile * (1.1 + 1.4 * flash), PALETTE.podRim, flash);
  }

  // The shockwave: one thin ring, leaving fast and thinning as it goes.
  const ring = Math.min(1, t * 2.6);
  if (ring < 1) {
    ctx.globalAlpha = (1 - ring) * 0.8;
    ctx.strokeStyle = PALETTE.redRim;
    ctx.lineWidth = STROKE.outline * (1 - ring * 0.6);
    ctx.beginPath();
    ctx.arc(x, y, c.tile * (0.2 + 1.5 * ring), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // The fireball. It swells over the first third and then goes to smoke — a
  // ball that only faded would read as a light being turned down.
  //
  // **Soft-edged, and about one square across.** It was a flat lobed polygon
  // in the ember colour at full alpha, and at that size and opacity it read as
  // a sticker over the chart rather than as fire: it covered the hull it was
  // supposed to be breaking and three squares either side of it. So it is a
  // radial gradient now — white-hot in the middle, ember through it, gone at
  // the rim — and it is held to a square and a half at its widest.
  const swell = Math.min(1, t * 3);
  const smoke = Math.max(0, (t - 0.34) / 0.66);
  const r = c.tile * (0.16 + 0.32 * swell) * (1 + smoke * 0.5);
  ctx.globalAlpha = 1 - smoke * 0.92;
  halo(ctx, x, y, r * 2, PALETTE.ember, 0.6 * (1 - smoke));
  const ball = ctx.createRadialGradient(x, y, 0, x, y, r * 1.25);
  ball.addColorStop(0, PALETTE.podRim);
  ball.addColorStop(0.4, PALETTE.ember);
  ball.addColorStop(1, "rgba(255,59,107,0)");
  ctx.fillStyle = ball;
  ctx.beginPath();
  // Lobed rather than round: a fireball is not a circle, and the lobes are the
  // same trick every body in this game is drawn with.
  for (let i = 0; i <= 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const wob = 1 + 0.16 * Math.sin(a * 3 + 1.1) + 0.09 * Math.sin(a * 5 - 0.4);
    const px = x + Math.cos(a) * r * wob;
    const py = y + Math.sin(a) * r * wob;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // The shards: hull, thrown flat and turning, out ahead of everything else.
  ctx.fillStyle = PALETTE.rock;
  for (let i = 0; i < SHARDS; i++) {
    const a = spoke(i, SHARDS);
    const d = c.tile * (0.25 + 1.5 * t * reach(i));
    const px = x + Math.cos(a) * d;
    const py = y + Math.sin(a) * d * 0.7;
    const s = c.tile * 0.07 * (1 - t);
    if (s <= 0) break;
    ctx.globalAlpha = Math.max(0, 1 - t * 1.2);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(a + t * 6);
    ctx.fillRect(-s, -s * 0.5, s * 2, s);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * A salvo into open water. `t` runs 0..1 across the burst.
 *
 * The plume rises over the first third, hangs, and comes back down — drawn as
 * one column with drops leaving its crown, so what the eye reads is water
 * going *up*. The rings it leaves are the last of it, and they widen after the
 * column is gone rather than with it: that is what a thing dropped into water
 * does, and it is the whole of how a miss is told from a hit at a glance.
 */
export function drawFleetSplashBurst(
  ctx: CanvasRenderingContext2D,
  c: Chart,
  col: number,
  row: number,
  t: number,
): void {
  const x = chartX(c, col);
  const y = chartY(c, row);
  ctx.save();

  // The column. Up over the first third of the clock, down over the rest,
  // narrowing as it goes — the same one quantity for both, so there is never a
  // moment where it is tall and fat at once.
  const rise = t < 0.34 ? t / 0.34 : Math.max(0, 1 - (t - 0.34) / 0.66);
  const h = c.tile * 1.5 * rise;
  const w = c.tile * 0.24 * (0.5 + 0.5 * rise);
  if (h > 0.5) {
    ctx.globalAlpha = 0.8 * rise;
    halo(ctx, x, y - h * 0.5, h * 0.9, PALETTE.shield, 0.35 * rise);
    ctx.fillStyle = PALETTE.cyanRim;
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.quadraticCurveTo(x - w * 0.5, y - h * 0.8, x, y - h);
    ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.8, x + w, y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // The drops off the crown, thrown out sideways and falling under their own
  // weight — the `t * t` is the fall, and it is the reason they arc.
  ctx.fillStyle = PALETTE.shieldRim;
  for (let i = 0; i < DROPS; i++) {
    const a = spoke(i, DROPS);
    const d = c.tile * (0.1 + 1.3 * t * reach(i));
    const px = x + Math.cos(a) * d;
    const py = y - h * 0.8 + Math.sin(a) * d * 0.3 + c.tile * 2.4 * t * t;
    if (py > y + c.tile * 0.4) continue;
    ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.beginPath();
    ctx.arc(px, py, Math.max(0.6, c.tile * 0.05 * (1 - t * 0.5)), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // The rings the water closes with. Two of them, the second a beat behind the
  // first, both flattened — the chart is a surface seen at a slant.
  ctx.strokeStyle = PALETTE.shield;
  ctx.lineWidth = STROKE.inner;
  for (const lag of [0, 0.22]) {
    const u = (t - lag) / (1 - lag);
    if (u <= 0) continue;
    ctx.globalAlpha = Math.max(0, 1 - u) * 0.7;
    ctx.beginPath();
    ctx.ellipse(x, y, c.tile * (0.12 + 0.8 * u), c.tile * (0.05 + 0.34 * u), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
