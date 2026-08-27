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
    // even at twelve tiles a beat. A lance keeps its tail: it is half the
    // speed, so the same tail is twice the object, which is the point — it has
    // to be told apart from an ordinary shot at a glance by both players.
    ctx.globalAlpha = b.lance ? 0.6 : 0.35;
    ctx.strokeStyle = hex;
    ctx.lineWidth = b.lance ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(x, fromY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalAlpha = 1;

    halo(ctx, x, y, l.tile * (b.lance ? 0.5 : 0.3), hex, 0.85);
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(x, y, l.tile * (b.lance ? 0.2 : 0.14), 0, Math.PI * 2);
    ctx.fill();
    if (!b.lance) continue;
    // The cannon's own colour round the head, so the shot carries the mark
    // that made it as well as the ammunition it was loaded with.
    ctx.strokeStyle = PALETTE.hullRim;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x, y, l.tile * 0.28, 0, Math.PI * 2);
    ctx.stroke();
  }
}
