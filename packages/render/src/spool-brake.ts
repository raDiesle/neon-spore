import { type SimConfig, type SpoolState, spoolDepthMilli, spoolHeld } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { type SpoolPose, spoolBrakeAt } from "./spool-shape.js";

/**
 * **The pilot's brake**: a rail hanging outside the brake's flange, a knob on
 * it at the depth his thumb has it, and the linkage pressing a shoe into the
 * flange's rim — deeper in the deeper the grip (§21, *the pilot sees only his
 * grip*).
 *
 * Its own page off `spool-draw.ts` because it is the one handle on this boss,
 * and it is shown to one seat (`showsSpoolBrake`). **Nothing here says a
 * rate**: the knob sits where the thumb is and the shoe bites as far as the
 * knob says, and what that does to the line is on the line itself, which
 * both seats see. The mark (`.claude/skills/new-boss` §5's fifth standard) is
 * the ring breathing round a knob nobody is holding: a brake let go pays the
 * line out fastest of all, so an empty rail is the thing to notice.
 */
export function drawSpoolBrake(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpoolState,
  pose: SpoolPose,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  const held = spoolHeld(s);
  const b = spoolBrakeAt(l, cfg, pose, spoolDepthMilli(s));

  const rail = new Path2D();
  rail.moveTo(b.top.x, b.top.y);
  rail.lineTo(b.bottom.x, b.bottom.y);
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.rockDark, 0.9);
  ctx.lineWidth = l.tile * 0.16;
  ctx.stroke(rail);
  ctx.lineCap = "butt";
  strokeGlow(ctx, rail, PALETTE.rock, STROKE.inner, 0.4, fade);
  ctx.globalAlpha = fade;

  // The linkage from knob to shoe: a straight arm, so how far it leans is how
  // hard the shoe is pressed.
  const arm = new Path2D();
  arm.moveTo(b.knob.x, b.knob.y);
  arm.lineTo(b.shoe.x, b.shoe.y);
  strokeGlow(ctx, arm, PALETTE.rock, STROKE.inner, held ? 0.8 : 0.3, fade);
  ctx.globalAlpha = fade;
  const shoe = new Path2D();
  shoe.ellipse(b.shoe.x, b.shoe.y, l.tile * 0.08, l.tile * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.rock, held ? 0.8 : 0.4);
  ctx.fill(shoe);

  const knob = new Path2D();
  knob.arc(b.knob.x, b.knob.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(held ? PALETTE.rock : PALETTE.rockDark, held ? 0.9 : 0.8);
  ctx.fill(knob);
  strokeGlow(ctx, knob, PALETTE.rock, STROKE.outline, held ? 1.2 : 0.5, fade);

  if (!held) {
    const breath = 0.5 + 0.5 * Math.sin(time * 4);
    const ring = new Path2D();
    ring.arc(b.knob.x, b.knob.y, b.r * (1.5 + 0.35 * breath), 0, Math.PI * 2);
    ctx.globalAlpha = fade * (0.35 + 0.45 * breath);
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = STROKE.inner;
    ctx.stroke(ring);
  }
  ctx.globalAlpha = fade;
}
