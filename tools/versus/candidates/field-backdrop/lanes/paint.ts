import {
  drawHorizon,
  drawMotes,
  drawWash,
  FAR,
  type MoteStyle,
  motesOf,
} from "../../../../../packages/render/src/backdrop.js";
import type { BackdropDraw } from "../../../../../packages/render/src/backdrop-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * LANES — every other column a shade darker, so a column is counted off the
 * space behind the field rather than off the grid lines.
 *
 * Two people playing this game say column numbers to each other, and the
 * one thing the back could do for them that no amount of dust does is make
 * a column *countable* at a glance: a ruled page is read faster than a blank
 * one. So this keeps the shipped wash and horizon, halves the far dust and
 * drops the near dust and the light shafts — the shafts lean diagonally
 * across the sky, and a diagonal behind a set of vertical bands is the one
 * thing that would make them harder to count — and lays a faint band of the
 * field's own black down every odd column from the top of the sky to the
 * band. The black and not the act's tint: the tint is within a shade of the
 * ground, and a band of it was there and could not be seen. A band of the
 * dark the field already ends in reads as the shape of the space rather
 * than as a new thing in it.
 *
 * **How it can lose.** *A striped field is louder than a plain one.* The rule
 * that binds this slot is that a decoration is much smaller over the field
 * than anywhere else, and a band under every second body is close to the
 * bodies. If the stripes are the first thing the eye lands on, they are in
 * the way of exactly what they were meant to help.
 */

/** How dark a shaded column is, as the black's alpha over the ground. */
const LANE_ALPHA = 0.22;

/** The far dust at half its shipped brightness — the same motes in the same
 * places, so only the loudness changes. */
const FAR_HALF: MoteStyle = { ...FAR, alpha: [FAR.alpha[0] / 2, FAR.alpha[1] / 2] };
const FAR_HALF_MOTES = motesOf(FAR_HALF);

export function lanes(d: BackdropDraw): void {
  const { ctx, l, wave, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawWash(ctx, l, wave, time);
  ctx.fillStyle = `${PALETTE.background}${Math.round(LANE_ALPHA * 255).toString(16)}`;
  for (let col = 1; col < l.cols; col += 2) {
    ctx.fillRect(l.gridLeft + col * l.tile, 0, l.tile, height);
  }
  drawHorizon(ctx, l, wave);
  drawMotes(ctx, l, time, FAR_HALF, FAR_HALF_MOTES);
}
