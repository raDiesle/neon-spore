import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { KeelSeamLook } from "../../../../../packages/render/src/keel-seam-look.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import { keelBreathing } from "../../../../../packages/sim/src/keel.js";

/**
 * The seam in three brightnesses across the fight (§24 *Animation*), read off
 * `movement` and the phase and nothing new: a hairline through movement one;
 * a fuller seam pulsing on the beat from the socket to the breath; and full
 * white, thick and glowing, through the breath — burning while the plates
 * dim round it — and after, where the tempo run's dim still reads in it. A
 * lock's snap, the held breath's flare and the cooldown's heat glow over all
 * three as they do in the shipped seam.
 */
export function paint(
  ctx: CanvasRenderingContext2D,
  seam: Path2D,
  { s, bright, pulse, snap, heat, beatPhase }: KeelSeamLook,
): void {
  const beat = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  const [width, alpha, glow] =
    s.movement === 1
      ? [STROKE.inner * 0.5, 0.45 + 0.3 * bright, 0]
      : keelBreathing(s)
        ? [STROKE.inner * 1.8, 1, 1.4]
        : s.movement === 2
          ? [STROKE.inner * 1.3, 0.6 + 0.3 * bright, 0.4 + 0.7 * beat]
          : [STROKE.inner * 1.8, 0.4 + 0.6 * bright, 1.2 * bright];
  ctx.lineWidth = width;
  ctx.strokeStyle = rgba(PALETTE.hullRim, alpha);
  ctx.stroke(seam);
  const flare = Math.max(glow, 0.6 * pulse, 1.4 * snap, 1.8 * heat);
  if (flare > 0) strokeGlow(ctx, seam, PALETTE.hullRim, width, flare);
}
