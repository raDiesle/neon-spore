import { blobPath, openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { SheenPass } from "../../../../../packages/render/src/hull-sheen.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { dither } from "../../../../../packages/render/src/sheen.js";

/**
 * REEF's skin and chamber: the ship is a **colony**.
 *
 * The hull is a crust of polyps — small tubes standing in the contour, each
 * with an open mouth and a lit rim — with spores rising off them. The chamber
 * is the root mass the colony grows from: dense, knotted, and glowing where a
 * spore has lodged. The cannon and the shield are the colony's two biggest
 * polyps, and they were there already.
 *
 * A concept card, shot once: rough by design, and polished only if chosen.
 */

const POLYPS = 30;

function polyps(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  let cups = "";
  let mouths = "";
  for (let i = 0; i < POLYPS; i++) {
    const x = l.gridLeft + l.gridWidth * ((i + 0.5) / POLYPS + (hash01(i * 17 + 5) - 0.5) * 0.02);
    const h = l.tile * (0.14 + hash01(i * 23 + 7) * 0.22);
    const r = l.tile * (0.05 + hash01(i * 29 + 9) * 0.05);
    const top = skinY(x) + l.tile * 0.05;
    const sway = Math.sin(time * 0.7 + i * 1.1) * r * 0.5;
    const pts: Point[] = [
      { x: x - r, y: top + h },
      { x: x - r * 1.3 + sway, y: top + h * 0.4 },
      { x: x - r * 0.9 + sway, y: top },
      { x: x + r * 0.9 + sway, y: top },
      { x: x + r * 1.3 + sway, y: top + h * 0.4 },
      { x: x + r, y: top + h },
    ];
    cups += `${openSmoothPath(pts)} Z `;
    const mx = x + sway;
    mouths += `M ${(mx + r * 0.7).toFixed(2)} ${top.toFixed(2)} a ${(r * 0.7).toFixed(2)} ${(
      r * 0.35
    ).toFixed(2)} 0 1 0 ${(-r * 1.4).toFixed(2)} 0 a ${(r * 0.7).toFixed(2)} ${(r * 0.35).toFixed(
      2,
    )} 0 1 0 ${(r * 1.4).toFixed(2)} 0 `;
  }
  ctx.fillStyle = rgba(skin.body[1], 0.55);
  ctx.fill(new Path2D(cups));
  ctx.strokeStyle = rgba(skin.body[0], 0.35);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.024);
  ctx.stroke(new Path2D(cups));
  ctx.fillStyle = rgba(skin.body[3], 0.7);
  ctx.fill(new Path2D(mouths));
  ctx.strokeStyle = rgba(skin.edge, 0.4);
  ctx.stroke(new Path2D(mouths));
}

/** Spores: small lights rising off the crust and fading. */
function spores(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  for (let i = 0; i < 12; i++) {
    const u = (time * 0.09 + hash01(i * 31 + 3)) % 1;
    const x = l.gridLeft + l.gridWidth * hash01(i * 37 + 7) + Math.sin(u * 7 + i) * l.tile * 0.2;
    const y = skinY(x) + l.tile * (1.3 - u * 1.2);
    halo(ctx, x, y, l.tile * 0.14, skin.edge, 0.4 * (1 - u));
  }
}

export function crust(s: SheenPass): void {
  polyps(s);
  spores(s);
  dither(s.ctx, s.filled);
}

/** The chamber: the root mass, and spores lodged in it. */
export function roots(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const base = g.createLinearGradient(0, 0, 0, h);
  skin.ground.forEach((c, i) => {
    base.addColorStop(i / 3, c);
  });
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  let mass = "";
  const count = Math.round(Math.min(220, (w * h) / 2600));
  for (let i = 0; i < count; i++) {
    const x = hash01(i * 7 + 11) * w;
    const y = hash01(i * 13 + 29) * h;
    const r = (0.01 + hash01(i * 19 + 3) * 0.035) * w;
    mass += blobPath(x, y, r, r * 0.8, 5, 0.18, 0.1, 0, i * 3 + 1, 12);
  }
  g.fillStyle = rgba(skin.flesh[1], 0.16);
  g.fill(new Path2D(mass));
  g.strokeStyle = rgba(skin.flesh[0], 0.12);
  g.lineWidth = Math.max(0.6, w / 500);
  g.stroke(new Path2D(mass));
  for (let i = 0; i < 14; i++) {
    const x = hash01(i * 41 + 5) * w;
    const y = hash01(i * 43 + 9) * h;
    const r = (0.02 + hash01(i * 47 + 1) * 0.03) * w;
    const glow = g.createRadialGradient(x, y, 0, x, y, r * 3);
    glow.addColorStop(0, rgba(skin.rim, 0.22));
    glow.addColorStop(1, rgba(skin.rim, 0));
    g.fillStyle = glow;
    g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  }
  const floor = skin.ground[3];
  const v = g.createLinearGradient(0, h * 0.5, 0, h);
  v.addColorStop(0, rgba(floor, 0));
  v.addColorStop(1, rgba(floor, 0.7));
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
}
