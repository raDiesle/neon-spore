import type { KeelState } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/** What a locked segment's seam is painted from, read off the pose and `KeelFx` by `keel-draw.ts`. */
export interface KeelSeamLook {
  s: KeelState;
  /** The segment. */
  k: number;
  /** How lit it is, 0..1 (`keelBright`). */
  bright: number;
  /** The tempo run's pulse on an answered joint, 0..1 (`keelPulse`). */
  pulse: number;
  /** Its lock's snap, and every seam's held-breath flare, 0..1 (`KeelFx.snap`). */
  snap: number;
  /** How hot the cooldown still has it, 0..1 (`keelHeat`). */
  heat: number;
  beatPhase: number;
}

/**
 * **THE KEEL's seam, as the one record a locked segment is painted
 * through**: a thin white line as bright as the segment, glowing on the
 * tempo run's pulse, a lock's snap and the cooldown's heat. A record so
 * VERSUS can offer another seam (`tools/versus/candidates/keel-seam/`);
 * `keel-draw.ts` calls `KEEL_SEAM.paint` every frame and never the stroke
 * directly.
 */
export const KEEL_SEAM: {
  paint: (ctx: CanvasRenderingContext2D, seam: Path2D, look: KeelSeamLook) => void;
} = {
  paint: (ctx, seam, { bright, pulse, snap, heat }) => {
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.4 + 0.5 * bright);
    ctx.stroke(seam);
    const glow = Math.max(0.6 * pulse, 1.4 * snap, 1.8 * heat);
    if (glow > 0) strokeGlow(ctx, seam, PALETTE.hullRim, STROKE.inner, glow);
  },
};
