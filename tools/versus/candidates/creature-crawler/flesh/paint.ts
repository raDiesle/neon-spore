import type { CrawlerLinkDraw } from "../../../../../packages/render/src/crawler-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { contracted, crease, edged, hash, SHADOW, volume } from "../kit.js";

/**
 * FLESH — meat with blood in it: dark veins branching under the skin in a
 * pattern no two rings share, a vessel down the back that a heartbeat runs
 * along from tail to head, soft blotches, and a breathing pore on every
 * flank, so the row of rings reads as one animal's side.
 */

/** Beats between two heartbeats, and how much later each ring nearer the head
 * takes its share of one: the beat runs forward along the back. */
const HEART_BEATS = 2;
const HEART_LAG = 0.18;
/** Branches off the flank vessel on each ring, alternately up and down. */
const BRANCHES = 4;

/**
 * One vein and what branches off it: a tapering stroke that bends as it
 * goes, splitting in two at its end until `depth` runs out. Every bend and
 * every split angle comes from `seed`, so the tree is the same each frame.
 */
function vein(
  ctx: CanvasRenderingContext2D,
  seed: number,
  x: number,
  y: number,
  angle: number,
  len: number,
  width: number,
  depth: number,
): void {
  const bend = (hash(seed, 1) - 0.5) * 0.9;
  const ex = x + Math.cos(angle + bend) * len;
  const ey = y + Math.sin(angle + bend) * len;
  const cx = x + Math.cos(angle) * len * 0.6;
  const cy = y + Math.sin(angle) * len * 0.6;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(cx, cy, ex, ey);
  ctx.stroke();
  if (depth === 0) return;
  const spread = 0.45 + hash(seed, 2) * 0.35;
  const next = angle + bend;
  vein(ctx, seed * 3 + 1, ex, ey, next - spread, len * 0.62, width * 0.62, depth - 1);
  vein(ctx, seed * 3 + 2, ex, ey, next + spread, len * 0.55, width * 0.62, depth - 1);
}

export function fleshSlime(d: CrawlerLinkDraw): void {
  const { ctx, body, order, beats } = d;
  const { ax, ay } = contracted(d);
  ctx.save();
  ctx.clip(body);
  volume(ctx, ax, ay, 0.5);

  // Blotches: soft-edged, every ring its own.
  for (let i = 0; i < 4; i++) {
    const x = ax * (hash(order, 20 + i) * 1.5 - 0.8);
    const y = ay * (hash(order, 30 + i) * 1.1 - 0.7);
    const r = ax * (0.12 + hash(order, 40 + i) * 0.14);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(SHADOW, 0.3));
    g.addColorStop(1, rgba(SHADOW, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Veins under the skin, dark and thin.
  // A vessel along the flank at the same height on every ring, so the rings'
  // vessels join into one, and branches leaving it up and down — on the
  // trailing half of the ring, the half the ring in front does not cover.
  ctx.strokeStyle = rgba(SHADOW, 0.5);
  ctx.lineCap = "round";
  const vy = ay * 0.12;
  const sway = (hash(order, 14) - 0.5) * ay * 0.24;
  ctx.lineWidth = ay * 0.11;
  ctx.beginPath();
  ctx.moveTo(-ax * 1.3, vy);
  ctx.bezierCurveTo(-ax * 0.4, vy + sway, ax * 0.4, vy - sway, ax * 1.3, vy);
  ctx.stroke();
  for (let i = 0; i < BRANCHES; i++) {
    const seed = order * 13 + i * 5 + 7;
    const x = -d.dir * ax * (0.1 + (i + hash(seed, 3) * 0.7) * 0.24);
    const up = i % 2 === 0 ? -1 : 1;
    const angle = up * Math.PI * 0.5 - d.dir * up * (0.3 + hash(seed, 4) * 0.5);
    vein(ctx, seed, x, vy, angle, ay * (up < 0 ? 0.55 : 0.4), ay * 0.08, 2);
  }

  // The vessel down the back, and the heartbeat travelling along it: a swell
  // of light that reaches the tail first and the head last.
  const t = ((((beats - order * HEART_LAG) / HEART_BEATS) % 1) + 1) % 1;
  const beat = Math.exp(-t * 9);
  const by = -ay * 0.62;
  ctx.strokeStyle = rgba(SHADOW, 0.55);
  ctx.lineWidth = ay * 0.14;
  ctx.beginPath();
  ctx.moveTo(-ax * 1.3, by);
  ctx.quadraticCurveTo(0, by - ay * 0.08, ax * 1.3, by);
  ctx.stroke();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(PALETTE.text, 0.15 + 0.55 * beat);
  ctx.lineWidth = ay * (0.07 + 0.12 * beat);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";

  crease(ctx, d, ax, ay, 0.65);

  // The breathing pore: a slit low on the flank with a pale lip, small and
  // narrow so a row of them reads as pores and not as a row of eyes.
  const sx = -d.dir * ax * (0.2 + hash(order, 60) * 0.2);
  const sy = ay * 0.42;
  ctx.fillStyle = rgba(PALETTE.text, 0.45);
  ctx.beginPath();
  ctx.ellipse(sx, sy, ax * 0.07, ay * 0.09, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  ctx.ellipse(sx, sy, ax * 0.05, ay * 0.03, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Moist but not wet: a broad soft sheen on the back.
  const sheen = ctx.createLinearGradient(0, -ay * 1.05, 0, -ay * 0.3);
  sheen.addColorStop(0, rgba(PALETTE.text, 0.3));
  sheen.addColorStop(1, rgba(PALETTE.text, 0));
  ctx.fillStyle = sheen;
  ctx.fillRect(-ax * 1.2, -ay * 1.3, ax * 2.4, ay);
  ctx.restore();
}

/**
 * A hard head capsule over the soft body: the front gone dark and polished,
 * a cluster of simple eyes, and two jaws at the front that close on the
 * squeeze and open as it lets go.
 */
export function fleshFace(d: CrawlerLinkDraw): void {
  const { ctx, body, dir, squeeze } = d;
  const { ax, ay } = contracted(d);
  ctx.save();
  ctx.clip(body);
  const cap = ctx.createLinearGradient(-dir * ax * 0.2, 0, dir * ax * 0.6, 0);
  cap.addColorStop(0, rgba(SHADOW, 0));
  cap.addColorStop(1, rgba(SHADOW, 0.6));
  ctx.fillStyle = cap;
  ctx.fillRect(-ax * 1.2, -ay * 1.2, ax * 2.4, ay * 2.4);
  ctx.fillStyle = rgba(PALETTE.text, 0.6);
  ctx.beginPath();
  ctx.ellipse(dir * ax * 0.15, -ay * 0.6, ax * 0.22, ay * 0.07, dir * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.text, 0.9);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(
      dir * ax * (0.3 + i * 0.12),
      -ay * (0.3 - i * 0.04),
      ax * 0.05,
      ay * 0.06,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  // The jaws: two dark blades meeting at the front, apart on the release.
  const gape = ay * (0.04 + 0.14 * (1 - Math.max(0, squeeze)));
  ctx.fillStyle = PALETTE.background;
  for (const side of [-1, 1]) {
    const y = ay * 0.2 + side * gape;
    ctx.beginPath();
    ctx.moveTo(dir * ax * 0.45, y - ay * 0.12);
    ctx.quadraticCurveTo(
      dir * ax * 0.95,
      y - side * ay * 0.02,
      dir * ax * 0.85,
      y + side * ay * 0.14,
    );
    ctx.lineTo(dir * ax * 0.45, y + ay * 0.1);
    ctx.closePath();
    edged(ctx, ay * 0.04, PALETTE.background);
    ctx.fill();
  }
  ctx.restore();
}
