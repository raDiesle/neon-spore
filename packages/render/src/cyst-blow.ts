import type { SimConfig } from "@neon-spore/sim";
import type { Point, StrikeFrame } from "./boss-strike-look.js";
import { cystCentre, cystTip, RESTING } from "./cyst-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE CYST's own blow at the hull** (`boss-strike-look.ts`). A step ran out
 * unanswered (`cyst-step.ts`'s `miss`: a swell let go, a spore unturned, a
 * bud or the core unshot), and the sac does the one thing its bottom lobe is
 * for: it spits. A spore in the sac's own mauve, ringed in its pale scar —
 * the spore its spit step already hangs (`cyst-story.ts`), a size up — is
 * shot out of that lobe's tip, stretched along its flight, and bursts on the
 * skin at `reach = 1`: flattened, a ring spreading along the plating and
 * five droplets of it thrown up and falling back.
 */

/** The spore's radius, in tiles: a size up on the one the spit step hangs. */
const SPORE = 0.38;
/** How long it stretches along its flight at its fastest, and how flat it goes on the skin. */
const STRETCH = 0.45;
const SPLAT = 0.6;
/** The droplets it bursts into, how far they are thrown out and up, in tiles. */
const DROPS = 5;
const THROW_X = 1.3;
const THROW_UP = 0.9;

/** Where the blow leaves the body: the tip of the bottom lobe, the one that spits. */
export function cystBlowFrom(l: Layout, cfg: SimConfig): Point {
  const c = cystCentre(l, cfg);
  const tip = cystTip(l, Math.PI / 2, RESTING);
  return { x: c.x + tip.x, y: c.y + tip.y };
}

export function cystBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  // Spat, not dropped: fast off the lobe and still quick at the skin.
  const t = 1 - (1 - f.reach) ** 1.4;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  const r = SPORE * tile * (0.6 + 0.4 * Math.min(1, f.reach * 3));
  const splat = Math.min(1, f.after * 5);
  const speed = f.after > 0 ? 0 : 1 - f.reach * 0.5;
  const sx = 0.9 * (1 - 0.25 * STRETCH * speed) * (1 + SPLAT * splat);
  const sy = (1 + STRETCH * speed) * (1 - SPLAT * splat);
  ctx.save();
  ctx.translate(x, y);
  const spore = new Path2D();
  spore.ellipse(0, 0, r * sx, r * sy, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.cystSac, 0.95 * fade);
  ctx.fill(spore);
  strokeGlow(ctx, spore, PALETTE.cystScar, STROKE.inner, fade);
  ctx.restore();
  if (f.after <= 0) return;
  // Burst: a ring along the plating, and droplets thrown up and falling back.
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.cystScar, 0.8 * fade);
  ctx.lineWidth = tile * 0.08;
  ctx.beginPath();
  ctx.ellipse(
    to.x,
    to.y,
    tile * (0.4 + 1.4 * f.after),
    tile * (0.1 + 0.25 * f.after),
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.fillStyle = rgba(PALETTE.cystSac, fade);
  const a = f.after;
  for (let i = 0; i < DROPS; i++) {
    const across = (i / (DROPS - 1)) * 2 - 1;
    const dx = across * THROW_X * tile * a;
    const dy = -THROW_UP * tile * (1 - Math.abs(across) * 0.4) * 4 * a * (1 - a);
    ctx.beginPath();
    ctx.arc(to.x + dx, to.y + dy, tile * 0.1 * fade, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
