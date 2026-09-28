import { type SimConfig, type SpoolState, spoolDepthMilli, spoolHeld } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { drawVerdictRing, type GripVerdict } from "./grip-verdict.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { PALETTE, STROKE } from "./palette.js";
import { SPOOL_BRAKE_MARK } from "./spool-fx.js";
import { spoolBrakeAsks } from "./spool-grip.js";
import { type SpoolPose, spoolBrakeAt } from "./spool-shape.js";
import { showsSpoolBrake } from "./view-role-clocks-c.js";

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
 *
 * **The knob answers a touch the way every mark does** (`mark-feedback.ts`,
 * `.claude/skills/new-boss` §5). While the line runs and nobody holds it,
 * the pilot's knob has the halo under it, and the navigator — shown no rail
 * and no depth — is shown the partner's turning ring and clock where the knob
 * rests, which says *his hand is wanted* and nothing about how deep. On
 * both, the verdict: green for the grip, red for her refused press
 * (`spool-fx.ts`), hers at the rest so it tells her no depth either. No arc
 * fills while he carries it: a brake is a level, not a gesture with an end,
 * and how far it is along is the knob down the rail and the shoe biting.
 */
export function drawSpoolBrakeMark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpoolState,
  pose: SpoolPose,
  time: number,
  verdicts: { at(key: number): GripVerdict | null },
): void {
  const v = verdicts.at(SPOOL_BRAKE_MARK);
  if (showsSpoolBrake(l.role)) {
    const knob = drawSpoolBrake(ctx, l, cfg, s, pose, time);
    if (v !== null) drawVerdictRing(ctx, knob.x, knob.y, knob.r * RING, v);
    return;
  }
  const rest = spoolBrakeAt(l, cfg, pose, 0);
  const r = rest.r * RING;
  if (spoolBrakeAsks(s)) {
    drawMarkTheirs(ctx, rest.knob.x, rest.knob.y, r, time);
    drawMarkWait(ctx, rest.knob.x, rest.knob.y, r, time);
  }
  if (v !== null) drawVerdictRing(ctx, rest.knob.x, rest.knob.y, r, v);
}

/** The breathing ring's radius round the knob, at rest, in knob radii. */
const RING = 1.5;

/** The pilot's rail, linkage, shoe and knob; where the knob stands is returned for its verdict. */
export function drawSpoolBrake(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpoolState,
  pose: SpoolPose,
  time: number,
): { x: number; y: number; r: number } {
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

  if (spoolBrakeAsks(s)) drawMarkHalo(ctx, b.knob.x, b.knob.y, b.r * RING, time);
  ctx.globalAlpha = fade;
  const knob = new Path2D();
  knob.arc(b.knob.x, b.knob.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(held ? PALETTE.rock : PALETTE.rockDark, held ? 0.9 : 0.8);
  ctx.fill(knob);
  strokeGlow(ctx, knob, PALETTE.rock, STROKE.outline, held ? 1.2 : 0.5, fade);

  if (!held) {
    const breath = 0.5 + 0.5 * Math.sin(time * 4);
    const ring = new Path2D();
    ring.arc(b.knob.x, b.knob.y, b.r * (RING + 0.35 * breath), 0, Math.PI * 2);
    ctx.globalAlpha = fade * (0.35 + 0.45 * breath);
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = STROKE.inner;
    ctx.stroke(ring);
  }
  ctx.globalAlpha = fade;
  return { x: b.knob.x, y: b.knob.y, r: b.r };
}
