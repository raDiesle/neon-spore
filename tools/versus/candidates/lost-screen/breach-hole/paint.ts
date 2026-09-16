import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import type { LostPaint } from "../../../../../packages/render/src/lost-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { drop } from "../../../../../packages/render/src/text-drop.js";
import { wrapText } from "../../../../../packages/render/src/wrap-text.js";

/**
 * The screen goes out except over the place it got through: near-black
 * everywhere, and one clear shaft standing over the breach column from the
 * hull to the top of the field, ringed where it meets the skin.
 *
 * The hole is cut with `destination-out` rather than drawn as a lighter patch,
 * so what shows through it is the *field itself*, undimmed — the breach, the
 * scar and the rock lying in it, exactly as the pair last saw them.
 */

const DARK = "rgba(4,3,8,.93)";

/** How wide the shaft is at the hull and at the top, in tiles. */
const FOOT_TILES = 2.2;
const HEAD_TILES = 3.6;

export function veil(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, p.l.width, p.l.height);
  // A wall earths through the dome and scars nothing, so there is no place to
  // cut. The screen is simply out, which is the honest picture of it.
  if (p.breachX === null) return;

  const foot = p.l.tile * FOOT_TILES;
  const head = p.l.tile * HEAD_TILES;
  const shaft = new Path2D();
  shaft.moveTo(p.breachX - foot, p.hullY + p.l.tile);
  shaft.lineTo(p.breachX - head, p.l.gridTop);
  shaft.lineTo(p.breachX + head, p.l.gridTop);
  shaft.lineTo(p.breachX + foot, p.hullY + p.l.tile);
  shaft.closePath();

  ctx.save();
  // Taken back out of the dark rather than painted lighter: what stands in the
  // shaft is the held field at full strength, which is the whole point of the
  // pause (`lost-look.ts`).
  ctx.globalCompositeOperation = "destination-out";
  const fade = ctx.createLinearGradient(0, p.hullY, 0, p.l.gridTop);
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(1, "rgba(0,0,0,.35)");
  ctx.fillStyle = fade;
  ctx.fill(shaft);
  ctx.restore();

  strokeGlow(ctx, shaft, PALETTE.red, Math.max(1, p.l.tile * 0.03), 0.7);
}

export function words(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const mid = p.l.width / 2;
  ctx.textAlign = "center";
  let y = p.l.playHeight * 0.13;
  drop(ctx, mid, y, p.age, 0, 0, () => {
    ctx.font = '700 40px "Courier New",monospace';
    ctx.fillStyle = PALETTE.red;
    ctx.fillText("WAVE LOST", 0, 0);
  });
  y += 26;
  drop(ctx, mid, y, p.age, 1, 0, () => {
    ctx.font = '600 12px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAVE ${p.wave} · TRY ${p.tries} · PLAY IT AGAIN`, 0, 0);
  });
  y += 26;
  const line =
    p.breachX === null
      ? "It got through. Say where, and it will not get through twice."
      : "That is where it got through. Look at it, then go again.";
  ctx.font = '13px "Courier New",monospace';
  for (const text of wrapText(ctx, line, p.l.width - 64)) {
    drop(ctx, mid, y, p.age, 2, 0, () => {
      ctx.font = '13px "Courier New",monospace';
      ctx.fillStyle = PALETTE.text;
      ctx.fillText(text, 0, 0);
    });
    y += 18;
  }
  ctx.textAlign = "left";
}
