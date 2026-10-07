import { drawFilamentHeart } from "../../../packages/render/src/filament-heart-look.js";
import { PALETTE } from "../../../packages/render/src/palette.js";

/**
 * The FILAMENT sheet (`bun run solid --filament`): THE FILAMENT's heart
 * (`packages/render/src/filament-heart-look.ts`) across its idle sway on the
 * top row at seven veins, and below it at seven, four and one, on the dub,
 * and struck.
 */

const W = 300;
const H = 420;
const RX = 72;
const SWAY_PERIOD = 7.5;

function draw(): string {
  const canvas = document.createElement("canvas");
  const top = [-0.25, -0.125, 0, 0.125, 0.25].map((k) => ({
    name: `sway ${k}`,
    time: k * SWAY_PERIOD,
    strands: 7,
    beat: 0.6,
    hurt: 0,
  }));
  const bottom = [
    { name: "7 left, lub", time: 0.8, strands: 7, beat: 0.02, hurt: 0 },
    { name: "7 left, dub", time: 0.8, strands: 7, beat: 0.3, hurt: 0 },
    { name: "4 left", time: 0.8, strands: 4, beat: 0.15, hurt: 0 },
    { name: "1 left", time: 0.8, strands: 1, beat: 0.15, hurt: 0 },
    { name: "struck", time: 0.8, strands: 5, beat: 0.6, hurt: 1 },
  ];
  canvas.width = W * 5;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  [top, bottom].forEach((row, r) => {
    row.forEach((c, col) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(col * W, r * H, W, H);
      ctx.clip();
      const rx = RX * (0.6 + (0.4 * c.strands) / 7);
      const heart = { x: col * W + W / 2, y: r * H + H * 0.62, rx, ry: rx * 0.95 };
      drawFilamentHeart(ctx, heart, c.strands, c.time, c.beat, 1, c.hurt);
      ctx.restore();
      ctx.strokeStyle = PALETTE.grid;
      ctx.strokeRect(col * W + 0.5, r * H + 0.5, W - 1, H - 1);
      ctx.fillStyle = PALETTE.dim;
      ctx.font = "14px monospace";
      ctx.fillText(c.name, col * W + 10, r * H + 20);
    });
  });
  return canvas.toDataURL("image/png");
}

(window as unknown as { __sheet: string }).__sheet = draw();
