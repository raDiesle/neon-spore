import { facet, pin } from "@neon-spore/content";
import { SPOOL_RIBS, type SpoolState, type World } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawSpoolBrake } from "./spool-brake.js";
import type { SpoolFx } from "./spool-fx.js";
import { drawSpoolGauge } from "./spool-gauge.js";
import { drawSpoolLine } from "./spool-line.js";
import { spoolDrift, spoolEnter, spoolPlaced, spoolRibLift, spoolRunMilli } from "./spool-pose.js";
import {
  type SpoolPose,
  spoolBarrelHalf,
  spoolBarrelPath,
  spoolFlangePath,
  spoolFlangeR,
  spoolRibPath,
  spoolSide,
  spoolSocketPath,
  spoolWindR,
} from "./spool-shape.js";
import { showsSpoolBrake, showsSpoolZone } from "./view-role-clocks-c.js";

/**
 * **THE SPOOL**: a thread-spool slung sideways across the top of the field, a
 * rock-grey casing with four ribs round a winding of the ship's own violet
 * line, and the line run down to the hull (§11.36, §21).
 *
 * Five poses, drawn off the world alone: taut and still; the brake shallow
 * and the line running fast; the brake deep and the line crawling; a rib
 * easing open off the casing; and the spool slack, turning its flange to the
 * ship and drifting off the top with the line trailing. The two paying poses
 * differ in **how fast the line visibly moves** — the dashes down the line
 * and the stripes round the winding are placed off one number
 * (`spoolRunMilli`), so they cannot disagree — and in nothing else on the
 * shared picture: no number is drawn and no colour marks the zone.
 *
 * **Its health is the ribs, and the winding under them.** Each rib eases up
 * and away rather than cracking, and the winding thins with it, so a spool
 * with one rib left is a thinner silhouette with three bare grooves.
 *
 * **The pilot is shown only his grip and the navigator only the gauge**
 * (`view-role-clocks-c.ts`); both see the spool and the line.
 */
export function drawSpool(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SpoolState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: SpoolFx,
): void {
  const cfg = world.cfg;
  const side = spoolSide(l, cfg);
  const enter = spoolEnter(s, cfg, beat, beatPhase);
  const drift = spoolDrift(s, cfg, beat, beatPhase);
  const pose = spoolPlaced(l, cfg, s, beat, beatPhase);
  const { at } = pose;
  const run = spoolRunMilli(s, cfg, beatPhase);

  ctx.save();
  ctx.globalAlpha = Math.min(1, 0.15 + 0.85 * enter * (1 - 0.8 * drift) + 0.3 * fx.glare);
  const alpha = ctx.globalAlpha;
  ctx.translate(at.x, at.y + fx.jolt * l.tile);
  ctx.rotate(fx.shudder * 0.025 * Math.sin(time * 44));
  ctx.translate(-at.x, -at.y);

  drawSpoolLine(ctx, l, cfg, s, pose, beat, beatPhase, time, run);
  ctx.globalAlpha = alpha;
  drawFlange(ctx, l, pose, side, false);
  drawBarrel(ctx, l, pose, run, drift);
  drawRibs(ctx, l, world, s, pose, side, beat, beatPhase);
  drawFlange(ctx, l, pose, -side as -1 | 1, true);
  if (s.phase !== "slack" && showsSpoolBrake(l.role)) drawSpoolBrake(ctx, l, cfg, s, pose, time);
  if (s.phase !== "slack" && showsSpoolZone(l.role)) {
    drawSpoolGauge(ctx, l, cfg, s, pose, beat, beatPhase, time);
  }
  ctx.restore();
}

function drawFlange(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  pose: SpoolPose,
  end: -1 | 1,
  facing: boolean,
): void {
  const alpha = ctx.globalAlpha;
  const path = spoolFlangePath(l, pose, end, facing);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(path);
  strokeGlow(ctx, path, PALETTE.rock, STROKE.outline, 0.8, alpha);
  ctx.globalAlpha = alpha;
  if (!facing || pose.turn < 0.05) return;
  // The face the turn brings round: a hub and five spokes, which were edge on
  // and unseen all fight and are the one new thing the slack spool shows.
  const x = pose.at.x + end * spoolBarrelHalf(l, pose.turn);
  const r = spoolFlangeR(l) * 0.82;
  const open = Math.sin((pose.turn * Math.PI) / 2);
  const spokes = new Path2D();
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + pose.turn * 1.2;
    spokes.moveTo(x, pose.at.y);
    spokes.lineTo(x + Math.cos(a) * r * open, pose.at.y + Math.sin(a) * r);
  }
  spokes.moveTo(x + l.tile * 0.3 * open, pose.at.y);
  spokes.ellipse(x, pose.at.y, l.tile * 0.3 * open, l.tile * 0.3, 0, 0, Math.PI * 2);
  strokeGlow(ctx, spokes, PALETTE.rock, STROKE.inner, 0.6, alpha * pose.turn);
  ctx.globalAlpha = alpha;
}

/** How many wraps of line are marked round the winding — enough to read a turn, few enough to count as texture. */
const WRAPS = 10;

/**
 * The barrel and its winding. The stripes are **placed** on the winding, not
 * posed (`.claude/skills/depth`): each is pinned at a longitude round the
 * axle and carried round by the line's own run, so the near ones slide over
 * the top and the far ones come up from under — a turn, and not a scroll. The
 * axle lies across the screen, so a facet's `x` is read as the height.
 */
function drawBarrel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  pose: SpoolPose,
  run: number,
  drift: number,
): void {
  const alpha = ctx.globalAlpha;
  const path = spoolBarrelPath(l, pose);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(path);
  ctx.fillStyle = rgba(PALETTE.hull, 0.3);
  ctx.fill(path);
  const r = spoolWindR(l, pose.wound);
  const half = spoolBarrelHalf(l, pose.turn);
  const theta = (run * l.tile) / 100 / Math.max(1, r) + drift * 6;
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = STROKE.inner;
  for (let k = 0; k < WRAPS; k++) {
    const f = facet(pin((k / WRAPS) * Math.PI * 2, 0, r), theta);
    if (!f.near) continue;
    const wrap = new Path2D();
    wrap.moveTo(pose.at.x - half, pose.at.y + f.x);
    wrap.lineTo(pose.at.x + half, pose.at.y + f.x);
    ctx.globalAlpha = alpha * (0.2 + 0.6 * f.lit * f.sx);
    ctx.stroke(wrap);
  }
  strokeGlow(ctx, path, PALETTE.rock, STROKE.inner, 0.5, alpha);
  ctx.globalAlpha = alpha;
}

/**
 * The four ribs, the brake's end first: whole, easing, or gone to a groove.
 * The rib going is the one the last movement freed, and it lifts and fades
 * over the ease's beats (`spoolRibLift`).
 */
function drawRibs(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SpoolState,
  pose: SpoolPose,
  side: -1 | 1,
  beat: number,
  beatPhase: number,
): void {
  const alpha = ctx.globalAlpha;
  const gone = SPOOL_RIBS - s.ribs;
  const easing = s.phase === "ease" || s.phase === "slack";
  const going = easing ? gone - 1 : -1;
  const lift = spoolRibLift(s, world.cfg, beat, beatPhase);
  for (let i = 0; i < SPOOL_RIBS; i++) {
    if (i < gone && i !== going) {
      ctx.globalAlpha = alpha * 0.5;
      ctx.strokeStyle = PALETTE.rock;
      ctx.lineWidth = STROKE.inner;
      ctx.stroke(spoolSocketPath(l, pose, side, i));
      ctx.globalAlpha = alpha;
      continue;
    }
    const up = i === going ? lift : 0;
    const rib = spoolRibPath(l, pose, side, i, up);
    ctx.globalAlpha = alpha * (1 - up);
    ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
    ctx.fill(rib);
    strokeGlow(
      ctx,
      rib,
      i === going ? PALETTE.wispRim : PALETTE.rock,
      STROKE.outline,
      0.9,
      alpha * (1 - up),
    );
    ctx.globalAlpha = alpha;
  }
}
