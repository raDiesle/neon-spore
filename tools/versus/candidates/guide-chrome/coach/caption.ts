import { anchorPoint } from "../../../../../packages/render/src/caption-anchor.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import { LABEL_LINE } from "../../../../../packages/render/src/label-box.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { withNames } from "../../../../../packages/render/src/seat-name.js";
import { wrapText } from "../../../../../packages/render/src/wrap-text.js";
import { BAND_FOOT, CAPTION_FONT, COACH } from "./paint.js";

/** Ticks the caption takes to arrive. */
const FADE_TICKS = 10;
const PAD_X = 16;
const PAD_Y = 12;
const TAIL = 16;
/** How dark the rest of the picture goes: the owner asked for more, not less. */
const SCRIM = 0.72;

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
  const above = point.y - point.r - point.clear - TAIL - h;
  const below = above < BAND_FOOT;
  const y = below ? Math.max(BAND_FOOT, point.y + point.r + point.clear + TAIL) : above;

  // The scrim, with the subject's own hole in it: dark everywhere but there,
  // and the hole small enough that the bar and the header are the only other
  // things left lit.
  const hole = Math.max(point.r, point.rx ?? 0) + 30;
  const scrim = ctx.createRadialGradient(point.x, point.y, hole, point.x, point.y, hole + 70);
  scrim.addColorStop(0, "rgba(3,2,10,0)");
  scrim.addColorStop(1, `rgba(3,2,10,${SCRIM * k})`);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, l.width, l.height);
  ctx.globalAlpha = k;
  halo(ctx, point.x, point.y, hole * 1.5, COACH, 0.2);
  // The coach's bubble again, in its colour, tail to the thing it is about.
  const cx = x + w / 2;
  const tipX = Math.max(x + 20, Math.min(x + w - 20, point.x));
  ctx.fillStyle = "rgba(9,7,20,.96)";
  ctx.strokeStyle = COACH;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (below) {
    ctx.moveTo(tipX - 12, y + 4);
    ctx.quadraticCurveTo(tipX - 2, y - TAIL * 0.4, point.x, point.y + point.r + 3);
    ctx.quadraticCurveTo(tipX + 4, y - TAIL * 0.4, tipX + 12, y + 4);
  } else {
    ctx.moveTo(tipX - 12, y + h - 4);
    ctx.quadraticCurveTo(tipX - 2, y + h + TAIL * 0.4, point.x, point.y - point.r - 3);
    ctx.quadraticCurveTo(tipX + 4, y + h + TAIL * 0.4, tipX + 12, y + h - 4);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "center";
  ctx.font = CAPTION_FONT;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, y + PAD_Y + 16 + i * LABEL_LINE);
  });
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
};
