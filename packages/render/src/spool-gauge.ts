import { type SimConfig, type SpoolState, spoolGrace, spoolZoneMilli } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { spoolAheadMilli } from "./spool-pose.js";
import { type SpoolPose, spoolGaugeAt } from "./spool-shape.js";

/**
 * **The navigator's gauge**: a track under the barrel, the zone as a bracket
 * in the middle of it, and a bead where the paid-out length actually is (§21,
 * *the navigator sees the zone and the paid-out length*).
 *
 * The bracket stays still and the bead moves, so the one thing on it that
 * changes is *how far off, and which way* — the sentence she has to turn into
 * a depth for him. Right of the bracket is more line out than wanted, and the
 * bracket narrows a rib at a time. **No colour ever marks the zone or the
 * depth**: the bracket is the casing's grey and the bead the line's violet,
 * inside the zone or out of it, and no number is printed anywhere. The
 * bracket breathes through a movement's opening grace, the beats before the
 * zone is judged at all, and holds still once it is.
 */

/** How far past the bracket the bead may run before it sits on the track's end, as a share of the half-length. */
const OVERRUN = 1.1;

export function drawSpoolGauge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpoolState,
  pose: SpoolPose,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  const g = spoolGaugeAt(l, pose);
  const { mid, half } = g;
  const wide = Math.max(1, cfg.spoolZoneWideMilli);

  const track = new Path2D();
  track.moveTo(mid.x - half * OVERRUN, mid.y);
  track.lineTo(mid.x + half * OVERRUN, mid.y);
  ctx.strokeStyle = rgba(PALETTE.rockDark, 0.9);
  ctx.lineWidth = l.tile * 0.12;
  ctx.lineCap = "round";
  ctx.stroke(track);
  ctx.lineCap = "butt";

  // The bracket, `[ ]`: a movement's zone is centred on where the line
  // should be, so it never moves along the track — only narrows.
  const zoneHalf = ((spoolZoneMilli(s, cfg) / 2) * half) / wide;
  const grace = spoolGrace(s, cfg, beat) ? 0.5 + 0.5 * Math.sin(time * 5) : 1;
  const h = l.tile * 0.28;
  const bracket = new Path2D();
  for (const side of [-1, 1] as const) {
    const x = mid.x + side * zoneHalf;
    bracket.moveTo(x - side * l.tile * 0.14, mid.y - h);
    bracket.lineTo(x, mid.y - h);
    bracket.lineTo(x, mid.y + h);
    bracket.lineTo(x - side * l.tile * 0.14, mid.y + h);
  }
  // The blink is the bracket's presence and the grace its light: the halo is
  // divided back by the blink so it breathes as it always has.
  const blink = 0.45 + 0.55 * grace;
  strokeGlow(ctx, bracket, PALETTE.rock, STROKE.outline, (0.4 + 0.6 * grace) / blink, fade * blink);
  ctx.globalAlpha = fade;

  const off = spoolAheadMilli(s, cfg, beatPhase) / wide;
  const x = mid.x + Math.min(OVERRUN, Math.max(-OVERRUN, off)) * half;
  const bead = new Path2D();
  bead.arc(x, mid.y, l.tile * 0.17, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.hull, 0.9);
  ctx.fill(bead);
  strokeGlow(ctx, bead, PALETTE.hullRim, STROKE.inner, 0.9, fade);
  ctx.globalAlpha = fade;
}
