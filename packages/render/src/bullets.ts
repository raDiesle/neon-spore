import type { Bullet } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * Shots sit on tile centres — the simulation only ever knows which tile a
 * bullet occupies and how far it has come towards the next one (`subMilli`).
 * The glide between the two is drawn here and nowhere else.
 */
export function drawBullets(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  bullets: readonly Bullet[],
): void {
  for (const b of bullets) {
    const hex = b.color === "red" ? PALETTE.red : PALETTE.cyan;
    const row = b.row - b.subMilli / 1000;
    const x = tileCX(l, b.col);
    const y = tileCY(l, row);
    const fromY = tileCY(l, b.row);

    // A short tail back to the tile it came from, so the direction is legible
    // even at twelve tiles a beat.
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = hex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, fromY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalAlpha = 1;

    halo(ctx, x, y, l.tile * 0.3, hex, 0.85);
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(x, y, l.tile * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
}
