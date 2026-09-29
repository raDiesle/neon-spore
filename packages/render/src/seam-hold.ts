import { SEAM_POINTS, type SeamState, type SimConfig, seamLitStep } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { phaseInto } from "./phase-into.js";
import { seamFalsePath, seamPointPath } from "./seam-shape.js";

/**
 * **THE SEAM's two steps answered by sending nothing** (§26 rows 10 and 16,
 * `sim/seam-step.ts`): the false point, and the dark before the ridge gives.
 * Both are read off the lit step every frame; the one thing that outlives a
 * frame is the reseal's flash (`seam-fx.ts`).
 *
 * **The false point** flickers at the crack's midpoint in the shell's own
 * grey — no cannon's colour and not the white either cannon answers — at half
 * a real point's brightness and on a period twice as long, so a seat who has
 * learned the tell reads it before the window opens (*Presentation*). It
 * fades over the rest that follows it, fired at or not.
 *
 * **The dark** is the crack black and still: no ember wandering it, the
 * crack's rim all but gone, and the last point's sealed white the one mark
 * left on the ridge. A bolt fired into it flashes the whole crack white as
 * it reseals.
 */

/** The false point's period, in beats: a real point's is one. */
const FALSE_PERIOD_BEATS = 2;

/** How lit the false point is: 1 while its step is lit, easing out over the rest after it, 0 otherwise. */
export function seamFalseLight(
  s: SeamState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase === "lit") return seamLitStep(s)?.ask === "decoy" ? 1 : 0;
  if (s.phase !== "rest" || s.steps[s.cursor - 1]?.ask !== "decoy") return 0;
  return 1 - smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.seamRestBeats));
}

/** Whether the crack lies dark: the last step, asking the pair to hold fire. */
export function seamDark(s: SeamState): boolean {
  return seamLitStep(s)?.ask === "dark";
}

/** The false point, `light` of the way lit. Laid in the ridge's own frame. */
export function drawSeamFalse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  light: number,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (light <= 0) return;
  const pulse = 0.5 + 0.5 * Math.cos(((beat + beatPhase) / FALSE_PERIOD_BEATS) * Math.PI * 2);
  const flicker = 0.85 + 0.15 * Math.sin(time * 29) * Math.sin(time * 13);
  const k = light * flicker;
  const lens = seamFalsePath(l);
  // Half a real point's fill, which runs 0.2 to 0.7 on its beat, and half its
  // glow (`seam-marks.ts`); the rim's core stays drawn, or grey on the grey
  // shell is not seen at all.
  ctx.fillStyle = rgba(PALETTE.rock, (0.1 + 0.25 * pulse) * k);
  ctx.fill(lens);
  strokeGlow(ctx, lens, PALETTE.rock, STROKE.inner, 0.65, (0.6 + 0.4 * pulse) * k);
}

/**
 * The dark's marks over the black crack: the last point's sealed white,
 * steady, and the reseal's flash down the whole crack while it lasts.
 */
export function drawSeamDark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: SeamState,
  crack: Path2D,
  reseal: number,
): void {
  if (s.sealed > 0) {
    const last = seamPointPath(l, Math.min(SEAM_POINTS, s.sealed) - 1, 0.3);
    strokeGlow(ctx, last, PALETTE.hullRim, STROKE.inner, 0.6, 0.55);
  }
  if (reseal > 0) strokeGlow(ctx, crack, PALETTE.hullRim, STROKE.outline, 1.6, reseal);
}
