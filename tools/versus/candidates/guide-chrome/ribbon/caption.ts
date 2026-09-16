import { anchorPoint } from "../../../../../packages/render/src/caption-anchor.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import { LABEL_LINE } from "../../../../../packages/render/src/label-box.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { withNames } from "../../../../../packages/render/src/seat-name.js";
import { seatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { wrapText } from "../../../../../packages/render/src/wrap-text.js";
import { BAND_FOOT, CAPTION_FONT, stripes } from "./paint.js";

/** Ticks the caption takes to arrive. */
const FADE_TICKS = 10;
const PAD_X = 16;
const PAD_Y = 14;
const TAIL = 16;
const TAPE = 7;

export const caption: GuideLook["caption"] = (ctx, l, world, set, step, tick, beatPhase, names) => {
  const point = anchorPoint(l, world, set, step.anchor, beatPhase);
  if (!point) return;
  const k = Math.min(1, Math.max(0, (tick - step.tick) / FADE_TICKS));
  if (k <= 0) return;
  const skin = seatSkin(l.role);

  ctx.font = CAPTION_FONT;
  const lines = wrapText(ctx, withNames(step.text, names), l.width - 24 - PAD_X * 2);
  let tw = 0;
  for (const line of lines) tw = Math.max(tw, ctx.measureText(line).width);
  const w = tw + PAD_X * 2;
  const h = lines.length * LABEL_LINE + PAD_Y * 2 + TAPE;
  const x = Math.max(8, Math.min(Math.max(8, l.width - w - 8), point.x - w / 2));
  const above = point.y - point.r - point.clear - TAIL - h;
  const below = above < BAND_FOOT;
  const y = below ? Math.max(BAND_FOOT, point.y + point.r + point.clear + TAIL) : above;

  ctx.globalAlpha = k;
  halo(ctx, point.x, point.y, Math.max(point.r, point.rx ?? 0) * 2.2, skin.tint, 0.3);
  // The tail: grown out of the box's edge towards the thing the words are about.
  const tipX = Math.max(x + 18, Math.min(x + w - 18, point.x));
  ctx.fillStyle = "rgba(9,7,20,.96)";
  ctx.strokeStyle = skin.tint;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (below) {
    ctx.moveTo(tipX - 12, y + 6);
    ctx.quadraticCurveTo(tipX - 3, y - TAIL * 0.4, point.x, point.y + point.r + 3);
    ctx.quadraticCurveTo(tipX + 5, y - TAIL * 0.4, tipX + 12, y + 6);
  } else {
    ctx.moveTo(tipX - 12, y + h - 6);
    ctx.quadraticCurveTo(tipX - 3, y + h + TAIL * 0.4, point.x, point.y - point.r - 3);
    ctx.quadraticCurveTo(tipX + 5, y + h + TAIL * 0.4, tipX + 12, y + h - 6);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.save();
  ctx.clip();
  stripes(ctx, { x, y, w, h: TAPE }, skin.tint, 0.7, 0);
  ctx.restore();
  // The path went with the tape's clip; the rim is drawn on a fresh one.
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "center";
  ctx.font = CAPTION_FONT;
  lines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, y + TAPE + PAD_Y + 16 + i * LABEL_LINE);
  });
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
};
