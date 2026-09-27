import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * **The fire in THE INSTAR's mouth**: a blur of ember light in the middle of
 * the open jaws, a speck when the window opens and swelling as it runs.
 *
 * The owner, 25 September 2026: *we have to close the mouth, so he cant spit
 * out the fire* — so it can never be bigger than the gap between the two
 * lips: as the pair push the jaws together the fire is squeezed out, and
 * with the mouth shut there is none (`instar-head.ts`). What it does when
 * they do not is `instar-strike.ts`.
 *
 * And on 27 September 2026: *the fire in the middle of the mouth must look
 * more subtle (maybe just some fire blur), otherwise players think it's some
 * action to perform on. Also it should start small and then grow bigger.*
 * A turning ball with an edge read as a mark, so it is light and nothing
 * else — three soft glows, no line, no rim, no shape that turns — flickering
 * in brightness. It grows from a tenth of the lip gap across when the window
 * opens, eased in, so the last beats swell the most (`fireGrown`).
 */

/** The fire when the window opens, against the fire at its close: a tenth of
 * the lip gap across, the full fire being four fifths of it. */
export const FIRE_SPECK = 0.125;

/** The fire `x` of the way through the window, 0..1: the speck, swelling
 * slowly and then fast. */
export function fireGrown(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return FIRE_SPECK + (1 - FIRE_SPECK) * t * t;
}

/** The fire's radius in pixels: `fire` of the widest it can be, which is
 * four tenths of the lip gap — or, with the jaws flung wide, half the head
 * again. `gapHalf` is half the distance from lip to lip. */
export function fireRadius(fire: number, r: number, gapHalf: number): number {
  return Math.max(0, fire) * Math.min(r * 0.54, gapHalf * 0.8);
}

/** A glow's radius is cached per size (`haloSprite`), so the sizes come from a short ladder. */
const HALO_STEP = 3;

function rung(radius: number): number {
  return Math.max(1, Math.round(radius / HALO_STEP)) * HALO_STEP;
}

export function drawFireball(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  fade: number,
): void {
  if (radius < 0.5) return;
  // Two sines at no common beat, so the flicker never settles into a pulse.
  const flicker = 0.8 + 0.12 * Math.sin(time * 13) + 0.08 * Math.sin(time * 31 + 1);
  const lit = fade * flicker;
  halo(ctx, x, y, rung(radius * 2.2), PALETTE.ember, 0.6 * lit);
  halo(ctx, x, y, rung(radius * 1.1), PALETTE.pod, 0.75 * lit);
  halo(ctx, x, y, rung(radius * 0.55), PALETTE.podRim, 0.9 * lit);
}
