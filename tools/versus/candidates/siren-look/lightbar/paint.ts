import { halo } from "../../../../../packages/render/src/glow.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { DIAL_R } from "../../../../../packages/render/src/siren-dial.js";

/**
 * **A light bar** — the strip on an emergency vehicle's roof instead of one
 * lamp: a row of cells across the dial, lit in turn. A call runs one cool
 * light along it and back, like a scanner. A torch makes it a strobe: the
 * two halves flash red and white against each other, and each flash throws a
 * band of light the width of the screen.
 */

/** Cells in the bar. */
const CELLS = 7;

export function lightbarSiren(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  torch: boolean,
): void {
  const r = DIAL_R;
  const w = r * 2 - 4;
  const h = r * 0.9;
  const left = cx - w / 2;
  const cell = w / CELLS;
  // Torch: the halves trade 2.5 times a second, and the lit half flashes
  // twice in its turn — between full and half, never dark, so any frame of it
  // has one half burning.
  const strobe = (time * 2.5) % 1;
  const leftLit = torch && strobe < 0.5;
  const rightLit = torch && !leftLit;
  const flash = strobe % 0.25 < 0.13 ? 1 : 0.55;
  // Call: one light running end to end and back.
  const run = (0.5 - 0.5 * Math.cos(time * Math.PI * 1.2)) * (CELLS - 1);

  ctx.save();
  if (torch) {
    const band = ctx.createLinearGradient(0, cy - 60, 0, cy + 60);
    const hue = leftLit ? PALETTE.red : PALETTE.text;
    band.addColorStop(0, `${hue}00`);
    band.addColorStop(0.5, flash === 1 ? `${hue}66` : `${hue}33`);
    band.addColorStop(1, `${hue}00`);
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = band;
    ctx.fillRect(leftLit ? 0 : cx, cy - 60, cx * (leftLit ? 1 : 2), 120);
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.fillStyle = "#0D1117";
  ctx.beginPath();
  ctx.roundRect(left - 3, cy - h / 2 - 3, w + 6, h + 6, h / 2 + 3);
  ctx.fill();
  ctx.strokeStyle = "#2A2547";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  for (let i = 0; i < CELLS; i++) {
    const x = left + i * cell;
    let lit: number;
    let hue: string;
    if (torch) {
      const onLeft = i < CELLS / 2;
      lit = (onLeft ? leftLit : rightLit) ? flash : 0.18;
      hue = onLeft ? PALETTE.red : PALETTE.text;
    } else {
      lit = Math.max(0.12, 1 - Math.abs(i - run) * 0.7);
      hue = PALETTE.cyan;
    }
    ctx.globalAlpha = lit;
    ctx.fillStyle = hue;
    ctx.beginPath();
    ctx.roundRect(x + 1, cy - h / 2, cell - 2, h, 3);
    ctx.fill();
    if (lit > 0.5) halo(ctx, x + cell / 2, cy, cell * (torch ? 3 : 1.8), hue, 0.5 * lit);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
