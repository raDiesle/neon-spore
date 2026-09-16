import { anchorPoint } from "../../../../../packages/render/src/caption-anchor.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import { LABEL_LINE } from "../../../../../packages/render/src/label-box.js";
import { navBlob } from "../../../../../packages/render/src/nav-button.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { withNames } from "../../../../../packages/render/src/seat-name.js";
import { wrapText } from "../../../../../packages/render/src/wrap-text.js";
import { BAND_FOOT, CAPTION_FONT } from "./paint.js";

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

  // The scrim, with the subject's own hole in it: dark everywhere but there.
  const hole = Math.max(point.r, point.rx ?? 0) + 26;
  const scrim = ctx.createRadialGradient(point.x, point.y, hole, point.x, point.y, hole + 90);
  scrim.addColorStop(0, "rgba(3,2,10,0)");
  scrim.addColorStop(1, `rgba(3,2,10,${0.6 * k})`);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, l.width, l.height);
  halo(ctx, point.x, point.y, hole * 1.6, PALETTE.pod, 0.22 * k);

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

  ctx.globalAlpha = k;
  // The bubble is the panel's own body, stretched to the words, with a tail
  // grown out of it towards the thing it is about.
  const cx = x + w / 2;
  const cy = y + h / 2;
  const tipX = Math.max(x + 18, Math.min(x + w - 18, point.x));
  ctx.fillStyle = "rgba(9,7,20,.97)";
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (below) {
    ctx.moveTo(tipX - 11, y + 4);
    ctx.quadraticCurveTo(tipX - 2, y - TAIL * 0.4, point.x, point.y + point.r + 3);
    ctx.quadraticCurveTo(tipX + 4, y - TAIL * 0.4, tipX + 11, y + 4);
  } else {
    ctx.moveTo(tipX - 11, y + h - 4);
    ctx.quadraticCurveTo(tipX - 2, y + h + TAIL * 0.4, point.x, point.y - point.r - 3);
    ctx.quadraticCurveTo(tipX + 4, y + h + TAIL * 0.4, tipX + 11, y + h - 4);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const path = navBlob(h, h);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(w / h, 1);
  ctx.fill(path);
  // Stroked inside the stretch, so the rim thickens towards the ends the way
  // every stretched body on the bar does; the root keeps it from going wide.
  ctx.lineWidth = 2 / Math.sqrt(w / h);
  ctx.stroke(path);
  ctx.restore();
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "center";
  ctx.font = CAPTION_FONT;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, y + PAD_Y + 16 + i * LABEL_LINE);
  });
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
};
