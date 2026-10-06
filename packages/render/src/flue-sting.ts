import { flueSightR, type Point } from "./flue-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **A shot spent, drawn as the hurt it is** (the owner, 6 October 2026: *when
 * the cannon did not hit … the visual should be more clear that it's
 * damaging*). Where a miss was a scuff of grit, the sight now flashes red,
 * red cracks split out of it, and the pip the shot cost flares red as it goes
 * dark (`drawFlueShots`), so a pair sees the shot cost them one before the
 * verdict ring has settled.
 *
 * On both screens, like every other receipt of a shot: it says nothing of
 * where the ember is, since every shot is met at the sight. `sting` is
 * `FlueFx`'s, 1 as the shot is spent and fading to 0.
 */

/** How many cracks split out of the sight, and how far, against its radius. */
const CRACKS = 7;
const CRACK_OUT = 1.9;

export function drawFlueSting(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  sting: number,
): void {
  if (sting <= 0) return;
  const r = flueSightR(l);
  const disc = new Path2D();
  disc.arc(at.x, at.y, r * (0.7 + 0.6 * (1 - sting)), 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.red, 0.45 * sting);
  ctx.fill(disc);
  strokeGlowFaded(ctx, disc, PALETTE.red, STROKE.outline, 1.6 * sting, sting);

  const reach = Math.min(1, (1 - sting) * 4);
  const cracks = new Path2D();
  for (let i = 0; i < CRACKS; i++) {
    const a = (i / CRACKS) * Math.PI * 2 + 0.3;
    const kink = a + (i % 2 === 0 ? 0.22 : -0.22);
    const mid = r * (0.55 + 0.5 * reach);
    const end = r * (0.55 + (CRACK_OUT - 0.55) * reach);
    cracks.moveTo(at.x + Math.cos(a) * r * 0.55, at.y + Math.sin(a) * r * 0.55);
    cracks.lineTo(at.x + Math.cos(kink) * mid, at.y + Math.sin(kink) * mid);
    cracks.lineTo(at.x + Math.cos(a) * end, at.y + Math.sin(a) * end);
  }
  strokeGlowFaded(ctx, cracks, PALETTE.redRim, STROKE.outline, 1.4 * sting, sting);
}
