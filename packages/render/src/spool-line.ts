import type { SimConfig, SpoolState } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { spoolRunRate, spoolSag } from "./spool-pose.js";
import { type SpoolPose, spoolLineFoot, spoolLineTop, spoolSide } from "./spool-shape.js";
import { drawSpoolStoryLine, spoolWhipPath } from "./spool-story.js";

/**
 * **The line**, from the underside of the winding to the hull — the one part
 * of THE SPOOL that says how fast it is paying out, and it says it to both
 * seats. Dashes stream down it at the run's own speed (`spoolRunMilli`, the
 * same number the winding's stripes turn by), so a shallow brake is a line
 * that pours and a deep one a line that creeps, and a spool that is not
 * paying has a line standing still.
 *
 * A slip throws a loop into it that pulls back taut; the slack spool lets it
 * go altogether, and its foot lifts off the hull and trails. The story between
 * the ribs is `spool-story.ts`': the whip's loop in place of the curve, and
 * the snag's catch and the fray's fibres laid over it.
 */
export function drawSpoolLine(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpoolState,
  pose: SpoolPose,
  beat: number,
  beatPhase: number,
  time: number,
  run: number,
): void {
  const sag = spoolSag(s, cfg, beat, beatPhase);
  const rate = spoolRunRate(s, cfg) / Math.max(1, cfg.spoolRateFastMilli);
  const top = spoolLineTop(l, pose);
  const hull = spoolLineFoot(l, cfg);
  const slack = s.phase === "slack" ? sag : 0;
  const foot = { x: hull.x, y: hull.y - slack * (hull.y - top.y) * 0.55 };
  const side = spoolSide(l, cfg);
  const bow = side * (sag * 1.2 + rate * 0.05 * Math.sin(time * 30)) * l.tile;
  const ctrl = { x: (top.x + foot.x) / 2 + bow, y: (top.y + foot.y) / 2 };
  let line = spoolWhipPath(l, s, cfg, top, foot, side, beat, beatPhase);
  if (line === null) {
    line = new Path2D();
    line.moveTo(top.x, top.y);
    line.quadraticCurveTo(ctrl.x, ctrl.y, foot.x, foot.y);
  }

  const alpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha * 0.45;
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(line);
  ctx.globalAlpha = alpha;
  ctx.setLineDash([l.tile * 0.22, l.tile * 0.3]);
  ctx.lineDashOffset = -(run * l.tile) / 100;
  strokeGlow(ctx, line, PALETTE.hull, STROKE.outline, 0.8, alpha);
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ctx.globalAlpha = alpha;
  drawSpoolStoryLine(ctx, l, s, cfg, top, ctrl, foot, beat, beatPhase);
}
