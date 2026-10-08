import { rgba } from "./hex.js";
import type { Torn } from "./latch-fx.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE LATCH's receipts, drawn** — what `latch-fx.ts` holds between frames.
 * The torn body is drawn where it was flung, in the field's pixels, off the
 * place `latch-draw.ts` stood it the frame before it was torn.
 */

/** How far a torn body is flung aside and falls, in tiles, how far it turns, and what is left of it at the end. */
const FLING = 1.6;
const FALL = 6;
const TURN = 1.2;
const SHRINK = 0.45;

/**
 * A body torn off the colony: flung clear on its own side and falling away
 * down the field, turning and shrinking as it goes, its torn side ragged
 * where the skin let go of it, and a bead of skin still stretched behind it
 * for the first moment.
 */
export function drawLatchTorn(ctx: CanvasRenderingContext2D, l: Layout, f: Torn): void {
  if (f.now <= 0) return;
  const k = 1 - f.now;
  const x = f.x + f.side * FLING * l.tile * Math.sin(k * Math.PI * 0.5);
  const y = f.y + FALL * l.tile * k * k;
  const r = f.r * (1 - SHRINK * k);
  ctx.save();
  ctx.globalAlpha *= f.now;
  if (k < 0.25) {
    // The skin it was torn from, stretched to a thread and snapping.
    ctx.strokeStyle = rgba(PALETTE.latchSkin, 1 - k * 4);
    ctx.lineWidth = r * 0.3 * (1 - k * 4);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(f.x - f.side * f.r * 0.6, f.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.translate(x, y);
  ctx.rotate(f.side * k * TURN);
  // The body, its torn side — the one that faced the core — bitten ragged.
  ctx.beginPath();
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const facing = Math.cos(a) * -f.side;
    const bite = facing > 0.4 ? (i % 2 === 0 ? 0.78 : 0.9) : 1;
    const px = Math.cos(a) * r * bite;
    const py = Math.sin(a) * r * bite;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = PALETTE.latchSkin;
  ctx.fill();
  ctx.strokeStyle = PALETTE.latchSkinDark;
  ctx.lineWidth = STROKE.outline * 1.5;
  ctx.stroke();
  ctx.fillStyle = rgba(PALETTE.latchKnot, 0.45);
  ctx.beginPath();
  ctx.arc(0, r * 0.05, r * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
