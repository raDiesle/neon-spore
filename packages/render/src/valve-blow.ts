import type { StrikeFrame } from "./boss-strike-look.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE VALVE's own blow at the hull** (`boss-strike-look.ts`). The ember its
 * first pin leaked has already fallen the middle column in plain sight
 * (`valve-draw.ts`'s `drawSpark`) and sits on the skin when its count runs
 * out, so nothing new is thrown. It is a valve's blow, so it is pressure: the
 * ember burns through the plating, the hole it leaves glows molten, and the
 * ship vents through it — a jet of pale steam shot straight up the column,
 * each puff wider and fainter than the one under it.
 */

/** The ember's own half-sizes, in tiles — `drawSpark`'s. */
const EMBER_W = 0.16;
const EMBER_H = 0.24;
/** Puffs in the jet, how high it reaches and how wide the last is, in tiles. */
const PUFFS = 10;
const JET = 2.6;
const PUFF_R = 0.5;

export function valveBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { l, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  ctx.save();
  // The ember burning in: from where it fell to, sinking and spreading as it goes.
  if (f.after === 0) {
    const y = l.hullY + (to.y - l.hullY) * f.reach;
    const ember = new Path2D();
    ember.ellipse(
      to.x,
      y,
      tile * EMBER_W * (1 + f.reach),
      tile * EMBER_H * (1 - 0.6 * f.reach),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = rgba(PALETTE.ember, 0.95);
    ctx.fill(ember);
    strokeGlow(ctx, ember, PALETTE.emberRim, STROKE.inner, 1 + 1.5 * f.reach);
  } else {
    // The hole, molten at its lip, cooling from white-hot to ember.
    const hole = new Path2D();
    const r = tile * (0.3 + 0.25 * Math.min(1, f.after * 4));
    hole.ellipse(to.x, to.y, r, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.redDark, 0.9 * fade);
    ctx.fill(hole);
    strokeGlow(
      ctx,
      hole,
      f.after < 0.3 ? PALETTE.emberRim : PALETTE.ember,
      STROKE.outline,
      2 * fade,
    );
    // The jet: puffs leaving the hole in turn, rising, swelling and thinning.
    for (let i = 0; i < PUFFS; i++) {
      const t = f.after * 1.6 - i * 0.07;
      if (t <= 0 || t >= 1) continue;
      const y = to.y - JET * tile * (1 - (1 - t) ** 2);
      const pr = tile * PUFF_R * (0.35 + 0.65 * t);
      const drift = tile * 0.12 * Math.sin(i * 2.1 + f.time * 3) * t;
      ctx.fillStyle = rgba(i === 0 ? PALETTE.emberRim : PALETTE.text, 0.5 * (1 - t) * fade);
      ctx.beginPath();
      ctx.arc(to.x + drift, y, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
