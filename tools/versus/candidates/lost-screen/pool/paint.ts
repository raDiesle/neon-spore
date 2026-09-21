import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { LostPaint } from "../../../../../packages/render/src/lost-look.js";
import { shutPlates } from "../../../../../packages/render/src/lost-shut.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * Nothing falls. A level rises from the foot of the phone and stops under the
 * hull, and after that only its surface moves.
 *
 * The fourth answer to the owner's *much slower, less elements*, and the only
 * one in the slot with no element in it at all: one boundary, one colour under
 * it, one slow movement that ends. `slime` hangs, `splash` is thrown, `one`
 * falls; all three are a thing arriving. This is the ship having already lost
 * what it lost — the pair come back to the screen a minute later and the level
 * is exactly where they left it, which is the truest thing this screen has to
 * say about a wave that is over.
 *
 * **It stops under the hull, and that is the picture, not a clearance.** The
 * rule the slot has is that the breach stays where it was seen
 * (`lost-screen.ts`); here the level stops half a tile below the ship's own
 * line, so the break is the thing standing just clear of the surface. What
 * pools is under the ship and what broke it is above — there is no age at
 * which this covers it, and none at which it has to be arranged not to.
 *
 * **The surface is the whole of the animation.** A level that rose and then
 * held perfectly still would be a coloured rectangle, and a rectangle is what
 * a screen looks like when it has frozen. It breathes instead, off two slow
 * waves out of step with each other and a period that is a share of the
 * phone's width, so nothing on it ever repeats across its own length.
 *
 * **How it can lose.** It is a rectangle for most of its height, which is the
 * one shape nothing else in this game is — every body here is a closed contour
 * with lobes, and a flat plane of colour may simply look like a different
 * program. It also puts its weight at the bottom of the phone, where the thumb
 * is, and a pair reaching for RETRY reach through it.
 */

/** Seconds the level takes to come up to where it stops. */
const RISE = 9;

/** How far below the hull's own line it stops, in tiles. */
const UNDER = 0.5;

/** How far the surface stands off its own level at rest, in tiles. */
const SWELL = 0.35;

/** Seconds one breath of the surface takes. */
const BREATH = 7;

/** The pool at the foot of the phone. */
const DEEP = 0.68;

/** And at its own surface, where the light is coming through it. */
const THIN = 0.3;

const HUE = PALETTE.red;
const RIM = PALETTE.redRim;

/** Where the surface stands at this x: two waves out of step, breathing off
 * the screen's own clock rather than off anything the field is doing. */
function swell(x: number, age: number, l: { width: number; tile: number }): number {
  const a = Math.sin((x / l.width) * 4.7 + (age / BREATH) * Math.PI * 2);
  const b = Math.sin((x / l.width) * 9.3 - (age / BREATH) * Math.PI * 1.3 + 1.7);
  return (a * 0.65 + b * 0.35) * l.tile * SWELL;
}

export const risingPool = (ctx: CanvasRenderingContext2D, p: LostPaint): void => {
  shutPlates(ctx, p);
  const { width: w, height: h, tile } = p.l;
  // Half a tile under the ship's line, so the break stands clear of it.
  const level = p.l.hullY + tile * UNDER;
  const top = h - (h - level) * smoothstep(Math.min(1, p.age / RISE));
  if (top >= h) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, top + swell(0, p.age, p.l));
  const step = tile * 0.4;
  for (let x = step; x < w; x += step) ctx.lineTo(x, top + swell(x, p.age, p.l));
  ctx.lineTo(w, top + swell(w, p.age, p.l));
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  const down = ctx.createLinearGradient(0, top, 0, h);
  down.addColorStop(0, rgba(HUE, THIN));
  down.addColorStop(1, rgba(HUE, DEEP));
  ctx.fillStyle = down;
  ctx.fill();
  // The meniscus, and only it: the sides and the foot of this are the edges
  // of the phone and have no line on them.
  ctx.beginPath();
  ctx.moveTo(0, top + swell(0, p.age, p.l));
  for (let x = step; x <= w; x += step) ctx.lineTo(x, top + swell(x, p.age, p.l));
  ctx.strokeStyle = rgba(RIM, 0.55);
  ctx.lineWidth = Math.max(1, tile * 0.05);
  ctx.stroke();
  ctx.restore();
};
