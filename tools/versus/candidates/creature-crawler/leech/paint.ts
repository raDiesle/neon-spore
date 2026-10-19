import type { CrawlerLinkDraw } from "../../../../../packages/render/src/crawler-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { contracted, crease, edged, hash, SHADOW, volume } from "../kit.js";

/**
 * LEECH — soaked: a hard glint along the back broken into panes the way a
 * wet thing throws back a window, two dark stripes wandering down the whole
 * animal with pale flecks between them, a cold rim of slime along the belly,
 * and a sucker for a mouth.
 */

/** One stripe across the ring, wandering in height and width by `order` so
 * the stripes down the animal are a living pattern rather than ruled lines.
 * The ends sit at the same height on every ring so neighbours join up. */
function stripe(
  ctx: CanvasRenderingContext2D,
  order: number,
  y: number,
  w: number,
  ax: number,
  ay: number,
): void {
  const salt = Math.round(y * 100);
  const a = (hash(order, 90 + salt) - 0.5) * ay * 0.22;
  const b = (hash(order, 95 + salt) - 0.5) * ay * 0.22;
  const ww = ay * w * (0.7 + hash(order, 99 + salt) * 0.6);
  ctx.beginPath();
  ctx.moveTo(-ax * 1.3, ay * y - ay * w * 0.5);
  ctx.bezierCurveTo(
    -ax * 0.4,
    ay * y + a - ww * 0.5,
    ax * 0.4,
    ay * y + b - ww * 0.5,
    ax * 1.3,
    ay * y - ay * w * 0.5,
  );
  ctx.lineTo(ax * 1.3, ay * y + ay * w * 0.5);
  ctx.bezierCurveTo(
    ax * 0.4,
    ay * y + b + ww * 0.5,
    -ax * 0.4,
    ay * y + a + ww * 0.5,
    -ax * 1.3,
    ay * y + ay * w * 0.5,
  );
  ctx.closePath();
  ctx.fill();
}

export function leechSlime(d: CrawlerLinkDraw): void {
  const { ctx, body, squeeze, order, dir } = d;
  const { ax, ay } = contracted(d);
  ctx.save();
  ctx.clip(body);
  volume(ctx, ax, ay, 0.65);

  ctx.fillStyle = rgba(SHADOW, 0.6);
  stripe(ctx, order, -0.42, 0.24, ax, ay);
  stripe(ctx, order, 0.2, 0.3, ax, ay);
  // Flecks between the stripes, sizes and places every ring its own.
  ctx.fillStyle = rgba(PALETTE.text, 0.5);
  for (let i = 0; i < 3; i++) {
    const x = ax * (hash(order, 80 + i) * 1.3 - 0.7);
    const r = 0.04 + hash(order, 84 + i) * 0.05;
    ctx.beginPath();
    ctx.ellipse(
      x,
      -ay * (0.1 + hash(order, 87 + i) * 0.08),
      ax * r,
      ay * r * 1.6,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  crease(ctx, d, ax, ay, 0.7);

  // The wet: a hard-edged glint along the back in three panes, sliding as
  // the squeeze bends the skin under it, and the slime's cold rim of light
  // along the belly where it catches the hull's glow.
  ctx.globalCompositeOperation = "lighter";
  const slide = -dir * squeeze * ax * 0.1;
  ctx.fillStyle = rgba(PALETTE.text, 0.8);
  for (let i = 0; i < 3; i++) {
    const x = -dir * ax * (0.55 - i * 0.3) + slide;
    ctx.beginPath();
    ctx.ellipse(
      x,
      -ay * (0.7 - 0.04 * i),
      ax * (0.12 - 0.02 * i),
      ay * 0.075,
      -dir * 0.08,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  const rim = ctx.createLinearGradient(0, ay * 0.45, 0, ay * 1.0);
  rim.addColorStop(0, rgba(PALETTE.text, 0));
  rim.addColorStop(1, rgba(PALETTE.text, 0.4));
  ctx.fillStyle = rim;
  ctx.fillRect(-ax * 1.2, ay * 0.45, ax * 2.4, ay * 0.7);
  ctx.restore();
}

/**
 * A leech's front is a sucker: a dark cup on the underside of the tip that
 * opens and closes on the squeeze, under a little arc of eyespots.
 */
export function leechFace(d: CrawlerLinkDraw): void {
  const { ctx, body, dir, squeeze } = d;
  const { ax, ay } = contracted(d);
  ctx.save();
  ctx.clip(body);
  const open = 0.55 + 0.45 * (1 - Math.max(0, squeeze));
  const mx = dir * ax * 0.6;
  const my = ay * 0.25;
  const lip = ctx.createRadialGradient(mx, my, ax * 0.1, mx, my, ax * 0.42);
  lip.addColorStop(0, rgba(SHADOW, 0.7));
  lip.addColorStop(1, rgba(SHADOW, 0));
  ctx.fillStyle = lip;
  ctx.fillRect(mx - ax * 0.45, my - ax * 0.45, ax * 0.9, ax * 0.9);
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  ctx.ellipse(mx, my, ax * 0.16 * open, ay * 0.2 * open, dir * 0.4, 0, Math.PI * 2);
  edged(ctx, ay * 0.06, rgba(SHADOW, 0.9));
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = PALETTE.background;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(
      dir * ax * (0.0 + i * 0.15),
      -ay * (0.5 - i * 0.07),
      ax * 0.05,
      ay * 0.05,
      0,
      0,
      Math.PI * 2,
    );
    edged(ctx, ay * 0.03, PALETTE.background);
    ctx.fill();
  }
}
