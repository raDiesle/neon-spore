import { anchorPoint } from "../../../../../packages/render/src/caption-anchor.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import { LABEL_LINE } from "../../../../../packages/render/src/label-box.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { withNames } from "../../../../../packages/render/src/seat-name.js";
import { wrapText } from "../../../../../packages/render/src/wrap-text.js";
import { BAND_FOOT, CAPTION_FONT } from "./paint.js";

/** Ticks the caption takes to arrive. */
const FADE_TICKS = 10;
const PAD_X = 16;
const PAD_Y = 12;
const LEAD = 18;

export const caption: GuideLook["caption"] = (ctx, l, world, set, step, tick, beatPhase, names) => {
  const point = anchorPoint(l, world, set, step.anchor, beatPhase);
  if (!point) return;
  const k = Math.min(1, Math.max(0, (tick - step.tick) / FADE_TICKS));
  if (k <= 0) return;

  ctx.font = CAPTION_FONT;
  const lines = wrapText(ctx, withNames(step.text, names), l.width - 24 - PAD_X * 2);
  let tw = 0;
  for (const line of lines) tw = Math.max(tw, ctx.measureText(line).width);
  const w = tw + PAD_X * 2;
  const h = lines.length * LABEL_LINE + PAD_Y * 2;
  const x = Math.max(8, Math.min(Math.max(8, l.width - w - 8), point.x - w / 2));
  const ring = Math.max(point.r, point.rx ?? 0) + 10;
  const above = point.y - ring - point.clear - LEAD - h;
  const below = above < BAND_FOOT;
  const y = below ? Math.max(BAND_FOOT, point.y + ring + point.clear + LEAD) : above;

  ctx.globalAlpha = k;
  // A viewfinder's ring around the subject, turning, and a leader up to the words.
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.lineDashOffset = -tick * 0.6;
  ctx.beginPath();
  ctx.arc(point.x, point.y, ring, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  halo(ctx, point.x, point.y, ring * 1.5, PALETTE.pod, 0.18);
  const tipX = Math.max(x + 14, Math.min(x + w - 14, point.x));
  ctx.beginPath();
  ctx.moveTo(tipX, below ? y : y + h);
  ctx.lineTo(point.x, below ? point.y + ring : point.y - ring);
  ctx.stroke();

  // The words on a slate plate with the pod's edge: the bezel's material.
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#1B2140");
  g.addColorStop(1, "#080A18");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "center";
  lines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, y + PAD_Y + 16 + i * LABEL_LINE);
  });
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
};
