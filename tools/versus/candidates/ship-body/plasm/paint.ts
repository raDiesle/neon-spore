import { blobPath } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { SheenPass } from "../../../../../packages/render/src/hull-sheen.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { dither } from "../../../../../packages/render/src/sheen.js";

/**
 * PLASM's skin and chamber: the ship is a **single cell**.
 *
 * Nothing on it is a surface feature. The membrane is a thin double line, and
 * everything that says *alive* is behind it: a nucleus, organelles drifting on
 * their own slow courses, granules. The chamber is the same cytoplasm further
 * in — bigger vacuoles, each one a lens of fluid — so the panel and the hull
 * are one cell seen at two depths.
 *
 * A concept card, shot once: rough by design, and polished only if chosen.
 */

/** Organelles under the membrane. */
const ORGANELLES = 7;

function organelles(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  for (let i = 0; i < ORGANELLES; i++) {
    const u = (0.08 + i * 0.14 + time * (0.006 + i * 0.002)) % 1;
    const x = l.gridLeft + u * l.gridWidth;
    const sink = 0.5 + 0.5 * Math.sin(time * 0.3 + i * 1.9);
    const y = skinY(x) + l.tile * (0.45 + 0.9 * sink);
    const r = l.tile * (0.22 + hash01(i * 7 + 1) * 0.3);
    const path = new Path2D(blobPath(x, y, r, r * 0.8, 4, 0.12, 0.08, time * 0.2, i * 11 + 3, 20));
    ctx.fillStyle = rgba(skin.body[1], 0.34);
    ctx.fill(path);
    ctx.strokeStyle = rgba(skin.body[0], 0.3);
    ctx.lineWidth = Math.max(0.6, l.tile * 0.025);
    ctx.stroke(path);
    halo(ctx, x - r * 0.3, y - r * 0.3, r * 0.5, skin.edge, 0.14);
  }
}

/** The nucleus: one large, dim body low in the hull, drifting across the
 * width over a minute. */
function nucleus(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  const x = l.gridLeft + l.gridWidth * (0.5 + 0.28 * Math.sin(time * 0.05));
  const y = skinY(x) + l.tile * 1.15;
  const r = l.tile * 0.7;
  ctx.fillStyle = rgba(skin.body[2], 0.5);
  ctx.fill(new Path2D(blobPath(x, y, r * 1.2, r * 0.75, 3, 0.06, 0.04, time * 0.1, 5, 24)));
  ctx.fillStyle = rgba(skin.body[0], 0.16);
  ctx.fill(
    new Path2D(blobPath(x - r * 0.2, y - r * 0.15, r * 0.4, r * 0.3, 3, 0.1, 0.04, 0, 9, 16)),
  );
}

/** The membrane as a double line: the outer edge and a dimmer one a little
 * inside it, which is what a cell wall looks like at this scale. */
function wall(s: SheenPass): void {
  const { ctx, l, body, skin } = s;
  ctx.save();
  ctx.translate(0, l.tile * 0.14);
  ctx.strokeStyle = rgba(skin.edge, 0.22);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.04);
  ctx.stroke(body);
  ctx.restore();
}

export function cytoplasm(s: SheenPass): void {
  nucleus(s);
  organelles(s);
  wall(s);
  dither(s.ctx, s.filled);
}

/** The chamber: the same cytoplasm deeper in — vacuoles as lenses of fluid. */
export function vacuoles(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const base = g.createLinearGradient(0, 0, 0, h);
  skin.ground.forEach((c, i) => {
    base.addColorStop(i / 3, c);
  });
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const count = Math.round(Math.min(26, (w * h) / 16000));
  for (let i = 0; i < count; i++) {
    const x = hash01(i * 7 + 11) * w;
    const y = hash01(i * 13 + 29) ** 0.8 * h;
    const r = (0.05 + hash01(i * 19 + 3) * 0.11) * w;
    const lens = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    lens.addColorStop(0, rgba(skin.flesh[0], 0.05));
    lens.addColorStop(0.75, rgba(skin.flesh[1], 0.08));
    lens.addColorStop(1, rgba(skin.flesh[0], 0.26));
    g.fillStyle = lens;
    g.fill(new Path2D(blobPath(x, y, r, r * 0.92, 4, 0.1, 0.06, 0, i * 3 + 1, 20)));
  }
  const floor = skin.ground[3];
  const v = g.createLinearGradient(0, h * 0.5, 0, h);
  v.addColorStop(0, rgba(floor, 0));
  v.addColorStop(1, rgba(floor, 0.7));
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
}
