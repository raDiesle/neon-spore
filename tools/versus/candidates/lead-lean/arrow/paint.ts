import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import type { LeanDraw } from "../../../../../packages/render/src/lead-lean.js";
import { faded } from "../../../../../packages/render/src/lead-rock.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";

/** How far the arrow stands off the tip before it starts, and a chevron's half-height, in tiles. */
const GAP = 0.25;
const CHEVRON = 0.32;

/**
 * ARROW — the lean as the design drew it: an arrow out of the stalk's tip
 * the way the body goes, with a length to it. **The length is the pace** —
 * a chevron for every column it moves a beat, one at the walk, two at the
 * run, three on the pass — so the pilot reads "going left, two a beat" off
 * one shape. It is not the lead: the sum is still the pair's, and the
 * column is still only on the navigator's screen, where this is never
 * drawn. Upright and dim while the body stands still; gone with no lean.
 */
export function paintLeanArrow(d: LeanDraw): void {
  const { ctx, l, tip, lean, pace, still, time, fade } = d;
  if (lean === 0) return;
  const t = l.tile;
  const x0 = tip.x + lean * GAP * t;
  const y = tip.y;
  const end = x0 + lean * Math.max(1, pace) * t;
  const alpha = (still ? 0.45 : 0.85 + 0.15 * Math.sin(time * 6)) * fade;
  const hex = faded(still ? PALETTE.dim : PALETTE.hullRim, fade);
  const shaft = new Path2D();
  shaft.moveTo(x0, y);
  shaft.lineTo(end, y);
  strokeGlow(ctx, shaft, hex, STROKE.outline * 1.6, alpha);
  const heads = new Path2D();
  for (let i = 1; i <= Math.max(1, pace); i++) {
    const hx = x0 + lean * i * t;
    heads.moveTo(hx - lean * CHEVRON * t, y - CHEVRON * t);
    heads.lineTo(hx, y);
    heads.lineTo(hx - lean * CHEVRON * t, y + CHEVRON * t);
  }
  strokeGlow(ctx, heads, hex, STROKE.outline * 2, alpha);
}
