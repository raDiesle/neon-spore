import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { KeelSeamLook } from "../../../../../packages/render/src/keel-seam-look.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import { keelBreathing } from "../../../../../packages/sim/src/keel.js";

/**
 * The seam in three brightnesses across the fight (§24 *Animation*), read off
 * `movement` and the phase and nothing new: a faint hairline through movement
 * one; a seam twice the shipped width, flaring on every beat, from the socket
 * to the breath; and white-hot, four times the shipped width in a wide halo,
 * through the breath — burning while the plates dim round it — and after,
 * where the tempo run's dim still reads in it. A lock's snap, the held
 * breath's flare and the cooldown's heat glow over all three as they do in the
 * shipped seam. Widened on 1 October 2026, when the owner could barely tell
 * the first offer from the shipped seam.
 */
export function paint(
  ctx: CanvasRenderingContext2D,
  seam: Path2D,
  { s, bright, pulse, snap, heat, beatPhase }: KeelSeamLook,
): void {
  const beat = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  const [width, alpha, glow, spread] =
    s.movement === 1
      ? [STROKE.inner * 0.4, 0.25 + 0.25 * bright, 0, STROKE.glowSpread]
      : keelBreathing(s)
        ? [STROKE.inner * 4, 1, 3, STROKE.glowSpread * 2.4]
        : s.movement === 2
          ? [STROKE.inner * 2, 0.6 + 0.4 * bright, 0.6 + 1.8 * beat, STROKE.glowSpread * 1.6]
          : [STROKE.inner * 3.5, 0.5 + 0.5 * bright, 2.6 * bright, STROKE.glowSpread * 2.4];
  ctx.lineWidth = width;
  ctx.strokeStyle = rgba(PALETTE.hullRim, alpha);
  ctx.stroke(seam);
  const flare = Math.max(glow, 0.6 * pulse, 1.4 * snap, 1.8 * heat);
  if (flare > 0) strokeGlow(ctx, seam, PALETTE.hullRim, width, flare, 1, spread);
}
