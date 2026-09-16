import { anchorPoint } from "../../../../../packages/render/src/caption-anchor.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import { LABEL_LINE } from "../../../../../packages/render/src/label-box.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { withNames } from "../../../../../packages/render/src/seat-name.js";
import { seatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { wrapText } from "../../../../../packages/render/src/wrap-text.js";
import { CAPTION_FONT, LOBE_W } from "./paint.js";

/** Ticks the caption takes to arrive. */
const FADE_TICKS = 10;
const PAD_X = 16;
const PAD_Y = 12;
const TAIL = 14;

export const caption: GuideLook["caption"] = (ctx, l, world, set, step, tick, beatPhase, names) => {
  const point = anchorPoint(l, world, set, step.anchor, beatPhase);
  if (!point) return;
  const k = Math.min(1, Math.max(0, (tick - step.tick) / FADE_TICKS));
  if (k <= 0) return;
  const skin = seatSkin(l.role);

  ctx.font = CAPTION_FONT;
  const lines = wrapText(ctx, withNames(step.text, names), l.width - LOBE_W * 2 - PAD_X * 2);
  let tw = 0;
  for (const line of lines) tw = Math.max(tw, ctx.measureText(line).width);
  const w = tw + PAD_X * 2;
  const h = lines.length * LABEL_LINE + PAD_Y * 2;
  // Kept off the two lobes: the words stand between the walls' buttons.
  const x = Math.max(LOBE_W + 4, Math.min(l.width - LOBE_W - 4 - w, point.x - w / 2));
  const above = point.y - point.r - point.clear - TAIL - h;
  const below = above < 8;
  const y = below ? point.y + point.r + point.clear + TAIL : above;

  ctx.globalAlpha = k;
  halo(ctx, point.x, point.y, Math.max(point.r, point.rx ?? 0) * 2.2, skin.tint, 0.3);
  const tipX = Math.max(x + 18, Math.min(x + w - 18, point.x));
  ctx.fillStyle = "rgba(9,7,20,.96)";
  ctx.strokeStyle = skin.tint;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (below) {
    ctx.moveTo(tipX - 11, y + 5);
    ctx.quadraticCurveTo(tipX - 2, y - TAIL * 0.4, point.x, point.y + point.r + 3);
    ctx.quadraticCurveTo(tipX + 4, y - TAIL * 0.4, tipX + 11, y + 5);
  } else {
    ctx.moveTo(tipX - 11, y + h - 5);
    ctx.quadraticCurveTo(tipX - 2, y + h + TAIL * 0.4, point.x, point.y - point.r - 3);
    ctx.quadraticCurveTo(tipX + 4, y + h + TAIL * 0.4, tipX + 11, y + h - 5);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
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
