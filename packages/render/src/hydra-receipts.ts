import { sinHash } from "./hash.js";
import type { HydraFx } from "./hydra-fx.js";
import { drawSerpentHead, glow } from "./hydra-head.js";
import { drawNeck } from "./hydra-neck.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE HYDRA's receipts, drawn (§11.64): the heads cut off falling and
 * tumbling, ichor dripping off them; the rings of a coil turned off
 * slackening as they drop; the steam off a maw quenched; and the head that
 * struck, lunging down on its neck to the hull and drawn back. Kept by
 * `hydra-fx.ts`.
 */

/** How far a cut head falls, in tiles, and how far it is thrown out to its side. */
const DROP = 8;
const THROW = 1.6;

export function drawHydraReceipts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  fx: HydraFx,
  time: number,
): void {
  const t = l.tile;
  ctx.save();
  for (const f of fx.heads) {
    const k = 1 - f.now;
    const at = { x: f.at.x + f.side * k * THROW * t, y: f.at.y + k * k * DROP * t };
    ctx.globalAlpha = Math.min(1, f.now * 2);
    drawSerpentHead(ctx, at, f.angle + f.side * k * 5, t * 1.35, 0.7, 0);
    for (let j = 0; j < 4; j++) {
      const lag = 0.1 + 0.12 * j;
      const y = f.at.y + Math.max(0, k - lag) ** 2 * DROP * t - j * t * 0.25;
      glow(ctx, { x: at.x - f.side * j * t * 0.12, y }, t * 0.22, PALETTE.hydraIchor, 0.7);
    }
  }
  for (const f of fx.coils) {
    const k = 1 - f.now;
    ctx.globalAlpha = Math.min(1, f.now * 2);
    ctx.strokeStyle = PALETTE.hydraHide;
    ctx.lineWidth = t * 0.3;
    for (let ring = 0; ring < 2; ring++) {
      const y = f.at.y + k * k * DROP * t * (0.8 + 0.25 * ring);
      ctx.beginPath();
      ctx.ellipse(
        f.at.x,
        y,
        t * (0.9 + 0.5 * k - 0.3 * ring),
        t * (0.35 + 0.2 * k),
        k * f.side,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  for (const f of fx.steam) {
    const k = 1 - f.now;
    for (let j = 0; j < 6; j++) {
      const rise = Math.max(0, k * 1.3 - sinHash(j, 3) * 0.3);
      const x = f.at.x + (sinHash(j, 11) - 0.5) * t * (0.6 + rise);
      glow(
        ctx,
        { x, y: f.at.y - rise * t * 2.2 },
        t * (0.3 + 0.5 * rise),
        PALETTE.hydraFire,
        0.5 * f.now,
      );
    }
  }
  ctx.restore();
  const lunge = fx.lunge;
  if (lunge === null) return;
  // Out fast to the hull, held, and drawn back as it fades.
  const k = 1 - lunge.now;
  const reach = k < 0.25 ? 1 - (1 - k / 0.25) ** 3 : Math.max(0, 1 - (k - 0.6) / 0.4);
  if (reach <= 0) return;
  const tip = {
    x: lunge.from.x + (lunge.to.x - lunge.from.x) * reach,
    y: lunge.from.y + (lunge.to.y - lunge.from.y) * reach,
  };
  const neck = {
    from: lunge.from,
    to: tip,
    out: { x: 0, y: t * 0.5 },
    into: { x: 0, y: -t * 0.5 },
    w0: t * 0.45,
    w1: t * 0.4,
  };
  drawNeck(ctx, neck, t, time);
  drawSerpentHead(ctx, tip, Math.atan2(tip.y - lunge.from.y, tip.x - lunge.from.x), t * 1.4, 1, 1);
}
