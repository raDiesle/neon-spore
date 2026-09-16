import type { StrikePaint } from "../../../../../packages/render/src/breach-look.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";

/**
 * The blow, drawn as a blow: a white core at the point and one crest running
 * away from it along the membrane in both directions.
 *
 * Everything here rides `surfaceY`, which is `hull-shock.ts`'s one decision
 * taken again and for the same reason: a wash of light over the ship is a
 * ship lit from outside, and a line that follows every rise the membrane takes
 * is something travelling *through* it.
 */

/** Seconds. Short: a hammer blow that lasted a second would be a press. */
export const SECONDS = 0.55;

/** How far the crest gets, in tiles, for a one-column body. */
const REACH_TILES = 6;

/** How high the crest stands off the skin at its own middle, in tiles. */
const CREST_TILES = 0.42;

/** Half the crest's length along the skin, in tiles. */
const CREST_HALF = 1.1;

/** Steps along one crest. Enough to ride the lobes, few enough to stay a line. */
const STEPS = 12;

/** The core's radius at the instant of the hit, in tiles. */
const CORE_TILES = 1.3;

/**
 * The halo's radius is quantised to whole pixels in steps of six, because
 * `haloSprite` caches one canvas per colour and radius and a radius that
 * changed every frame would bake a new sprite every frame (`glow.ts`).
 */
const CORE_STEP = 6;

function ease(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function hammer(ctx: CanvasRenderingContext2D, s: StrikePaint): void {
  const fade = 1 - s.t;
  const out = ease(s.t);
  const wide = Math.sqrt(s.span);
  const reach = s.tile * REACH_TILES * wide * out;
  const half = s.tile * CREST_HALF * wide;

  ctx.save();
  for (const dir of [-1, 1] as const) {
    const path = new Path2D();
    for (let k = 0; k <= STEPS; k++) {
      const along = reach + half * (2 * (k / STEPS) - 1);
      const x = s.x + dir * along;
      // Pinned to the skin at both ends of the crest and standing clear of it
      // in the middle: a wave in a surface rather than a line over one.
      const lift = Math.sin((k / STEPS) * Math.PI) * s.tile * CREST_TILES * fade;
      const y = s.surfaceY(x) - lift;
      if (k === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    strokeGlow(ctx, path, s.hex, Math.max(1.6, s.tile * 0.08), 0.5 + 1.8 * fade);
  }

  // The core, white rather than the body's colour: at the instant of the hit
  // there is more energy in that point than anything on the field is made of,
  // and the colour comes back as it dies (`breach-hue.ts` paints the crest).
  const r = s.tile * CORE_TILES * wide * (1 - 0.55 * out);
  halo(ctx, s.x, s.y, Math.max(CORE_STEP, Math.round(r / CORE_STEP) * CORE_STEP), "#FFFFFF", fade);
  halo(
    ctx,
    s.x,
    s.y,
    Math.max(CORE_STEP, Math.round((r * 1.9) / CORE_STEP) * CORE_STEP),
    s.hex,
    fade * 0.8,
  );
  ctx.restore();
}
