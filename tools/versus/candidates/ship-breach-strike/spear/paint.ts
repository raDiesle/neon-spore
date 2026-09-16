import type { StrikePaint } from "../../../../../packages/render/src/breach-look.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { signedHash } from "../../../../../packages/render/src/hash.js";

/**
 * The lane, lit. A column of light stands from the top of the field down into
 * the point the body went in at, holds, and is drawn back up into the sky.
 *
 * **It answers a question the other two do not.** The pair talk in columns —
 * that is the whole control scheme — and after a wave is lost the thing they
 * have to say to each other is *which column it came down*. A picture at the
 * hull says the ship was hit; a picture the length of the lane says where
 * from, and leaves the answer standing long enough to be read out loud.
 */

/** Seconds. Long, because the field is held anyway: `failWave` stops the wave
 * on the tick of the hit and nothing falls or fires for `waveFailBeats`. */
export const SECONDS = 0.9;

/** Half the lit lane's width, in tiles, for a one-column body. */
const HALF_TILES = 0.44;

/** Ragged edges: how far the lane's own sides wander, as a share of its width. */
const RAGGED = 0.3;

/** Steps down the lane. Each one is a kink in both edges. */
const STEPS = 9;

/** The core's radius at the hull, in tiles. */
const CORE_TILES = 1.1;
const CORE_STEP = 6;

/** How long the lane takes to arrive, and when it starts leaving, as shares of
 * the whole strike. Between the two it stands still. */
const IN = 0.18;
const OUT = 0.6;

function strength(t: number): number {
  if (t < IN) return t / IN;
  if (t < OUT) return 1;
  return 1 - (t - OUT) / (1 - OUT);
}

export function spear(ctx: CanvasRenderingContext2D, s: StrikePaint): void {
  const k = strength(s.t);
  if (k <= 0) return;
  const top = s.l.gridTop;
  const half = s.tile * HALF_TILES * s.span;

  ctx.save();
  // The two edges of the lane, each kinked away from straight by the column
  // and the beat, so two lanes lit in one wave are not the same picture.
  for (const side of [-1, 1] as const) {
    const path = new Path2D();
    for (let i = 0; i <= STEPS; i++) {
      const u = i / STEPS;
      // Narrowing to the point: the lane is a thing arriving, not a pillar.
      const w = half * (0.45 + 0.55 * (1 - u));
      const wander = signedHash(s.seed, i, side) * w * RAGGED;
      const x = s.x + side * w + wander;
      const y = top + (s.y - top) * u;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    strokeGlow(ctx, path, s.hex, Math.max(1.4, s.tile * 0.06), 0.4 + 1.4 * k);
  }

  // And the middle of it, brightest, straight, and the one part that is white:
  // the edges say how wide the lane is, this says which column it is.
  const spine = new Path2D();
  spine.moveTo(s.x, top);
  spine.lineTo(s.x, s.y);
  strokeGlow(ctx, spine, "#FFFFFF", Math.max(1, s.tile * 0.04), 0.3 + 1.1 * k);

  const r = s.tile * CORE_TILES * s.span;
  halo(ctx, s.x, s.y, Math.max(CORE_STEP, Math.round(r / CORE_STEP) * CORE_STEP), s.hex, k);
  ctx.restore();
}
