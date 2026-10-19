import type { CrawlerLinkDraw } from "../../../../../packages/render/src/crawler-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { contracted, crease, edged, hash, inkOf, litThrough, SHADOW, volume } from "../kit.js";

/**
 * LARVA — a real fly maggot, seen through: the gut running the length of it
 * with mouthfuls moving down it, a silver breathing tube down its flank, the
 * rings dark where they tuck under each other and glowing where the thin
 * trailing edge lets light through, under a wet skin.
 */

/** The gut's colour: what it has been eating, dark and warm. */
const GUT = "#1A0C10";
/** Points along each edge of the gut — enough that the swellings are round. */
const GUT_SAMPLES = 14;

export function larvaSlime(d: CrawlerLinkDraw): void {
  const { ctx, body, squeeze, order, dir } = d;
  const { ax, ay } = contracted(d);
  const ink = inkOf(ctx);
  ctx.save();
  ctx.clip(body);
  volume(ctx, ax, ay, 0.45);
  litThrough(ctx, d, ink, ax, ay, 0.55);

  // The gut: one dark tract at the same height and width at both ends of
  // every ring, so the tracts join into a single gut down the animal, swollen
  // where a mouthful is — in places no two rings share — and the mouthfuls
  // pushed back by the squeeze, which is food being moved.
  const gy = ay * 0.05;
  const push = -dir * ax * 0.2 * squeeze;
  const bumps = [0, 1].map((i) => ({
    x: push + ax * (hash(order, 2 + i) * 1.2 - 0.6),
    w: ay * (0.12 + hash(order, 4 + i) * 0.22),
  }));
  const half = (x: number) =>
    ay * 0.09 + bumps.reduce((t, m) => t + m.w * Math.exp(-(((x - m.x) / (ax * 0.28)) ** 2)), 0);
  const xs = Array.from(
    { length: GUT_SAMPLES },
    (_, i) => ax * (-1.3 + (2.6 * i) / (GUT_SAMPLES - 1)),
  );
  const sway = (x: number) => gy + Math.sin((x / ax) * 2.1 + order) * ay * 0.06;
  ctx.beginPath();
  for (const x of xs) ctx.lineTo(x, sway(x) - half(x));
  for (let i = xs.length - 1; i >= 0; i--) {
    const x = xs[i] as number;
    ctx.lineTo(x, sway(x) + half(x));
  }
  ctx.closePath();
  ctx.fillStyle = rgba(GUT, 0.62);
  ctx.fill();

  // A breathing tube down the upper flank, the silver thread a maggot's skin
  // shows, wandering a little and sending a twig down into its ring.
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(PALETTE.text, 0.42);
  ctx.lineWidth = Math.max(0.8, ay * 0.06);
  ctx.lineCap = "round";
  const ty = -ay * 0.46;
  const wob = (hash(order, 8) - 0.5) * ay * 0.16;
  ctx.beginPath();
  ctx.moveTo(-ax * 1.3, ty);
  ctx.bezierCurveTo(-ax * 0.3, ty + wob, ax * 0.3, ty - wob, ax * 1.3, ty);
  const tx = ax * (hash(order, 9) - 0.6) * 0.9;
  ctx.moveTo(tx, ty);
  ctx.quadraticCurveTo(tx + ax * 0.12, ty + ay * 0.2, tx + ax * 0.05, ty + ay * 0.42);
  ctx.moveTo(tx + ax * 0.09, ty + ay * 0.2);
  ctx.lineTo(tx + ax * 0.22, ty + ay * 0.3);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";

  crease(ctx, d, ax, ay, 0.6);

  // Wet: a long sharp streak along the back where the skin is tight, and a
  // pin light that sits somewhere different on every ring.
  ctx.fillStyle = rgba(PALETTE.text, 0.55);
  ctx.beginPath();
  ctx.ellipse(-dir * ax * 0.2, -ay * 0.7, ax * 0.42, ay * 0.06, dir * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.text, 0.85);
  ctx.beginPath();
  ctx.ellipse(
    -dir * ax * (0.2 + hash(order, 10) * 0.4),
    -ay * 0.36,
    ax * 0.035,
    ay * 0.07,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

/**
 * A maggot has no eyes worth the name. What it has is the black hook it eats
 * with, seen through the clear skin of its head on a dark frame, raking out
 * and back on the squeeze.
 */
export function larvaFace(d: CrawlerLinkDraw): void {
  const { ctx, body, dir, squeeze } = d;
  const { ax, ay } = contracted(d);
  ctx.save();
  ctx.clip(body);
  const reach = ax * (0.3 + 0.14 * (squeeze + 1));
  // The frame the hook hangs from: two dark rods inside the head, converging
  // on the mouth.
  ctx.beginPath();
  ctx.moveTo(-dir * ax * 0.3, -ay * 0.3);
  ctx.quadraticCurveTo(dir * ax * 0.05, -ay * 0.16, dir * reach, ay * 0.04);
  ctx.moveTo(-dir * ax * 0.3, ay * 0.24);
  ctx.quadraticCurveTo(dir * ax * 0.05, ay * 0.16, dir * reach, ay * 0.08);
  ctx.strokeStyle = rgba(SHADOW, 0.7);
  ctx.lineCap = "round";
  ctx.lineWidth = ay * 0.07;
  ctx.stroke();
  // The hook, black and curling down at the front.
  ctx.beginPath();
  ctx.moveTo(dir * reach, ay * 0.06);
  ctx.quadraticCurveTo(dir * (reach + ax * 0.3), -ay * 0.02, dir * (reach + ax * 0.24), ay * 0.36);
  edged(ctx, ay * 0.12, PALETTE.background);
  ctx.restore();
}
