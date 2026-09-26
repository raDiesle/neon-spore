import type { StrikeFrame } from "./boss-strike-look.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE MANTLE's own blow at the hull** (`boss-strike-look.ts`): the spark
 * that leaked from the gap has already run the whole column down to the skin
 * in plain sight (`mantle-draw.ts`'s `drawSpark`), so the blow is not a second
 * thing thrown out of the shell. It is that bead, the core's own red, bursting
 * on the plating: it squashes flat against the skin, throws a spatter of
 * drops up and out, and leaves a red scald spreading and cooling where it
 * burst.
 */

/** The bead's half-width and half-height, in tiles — `drawSpark`'s own. */
const BEAD_W = 0.18;
const BEAD_H = 0.26;
/** Drops thrown off the burst, and how far the furthest goes, in tiles. */
const DROPS = 7;
const THROW = 1.1;

export function mantleBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const hit = 1 - (1 - f.reach) ** 3;
  ctx.save();
  // The bead, squashing flat on the skin as it arrives.
  const w = tile * BEAD_W * (1 + 1.6 * hit);
  const h = tile * BEAD_H * (1 - 0.7 * hit);
  const bead = new Path2D();
  bead.ellipse(to.x, to.y - h * 0.6, w, h, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.red, 0.95 * fade);
  ctx.fill(bead);
  strokeGlow(ctx, bead, PALETTE.red, STROKE.inner, 2 * fade);
  if (f.after > 0) {
    // The spatter: drops thrown up and out in a fan, falling back as they fade.
    for (let k = 0; k < DROPS; k++) {
      const angle = Math.PI * (0.15 + (0.7 * k) / (DROPS - 1));
      const reach = tile * THROW * (0.55 + (0.45 * ((k * 5) % DROPS)) / DROPS);
      const t = f.after;
      const x = to.x + Math.cos(angle) * reach * t;
      const y = to.y - Math.sin(angle) * reach * t * (1.4 - t);
      ctx.fillStyle = rgba(PALETTE.redRim, 0.9 * fade);
      ctx.beginPath();
      ctx.arc(x, y, tile * 0.07 * (1 - 0.5 * t), 0, Math.PI * 2);
      ctx.fill();
    }
    // The scald: the plating lit where it burst, spreading as it cools.
    ctx.lineWidth = tile * 0.08;
    ctx.strokeStyle = rgba(PALETTE.red, 0.85 * fade);
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.35 + 1.3 * f.after),
      tile * (0.1 + 0.24 * f.after),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}
