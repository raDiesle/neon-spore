import { blobPath, openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";

/**
 * GULLET's chamber: the panel is the **throat**.
 *
 * The shipped tissue is the inside of a bell — cells, veins, a wet film, lit
 * from the seam. A throat is a tube seen down its length: rings of muscle,
 * each one a ridge with a shadow under it, closer together and darker the
 * further down they are; a channel down the middle where the tube narrows; and
 * glands in the walls between the rings. It is baked once per size and seat
 * like the sheet it replaces, so all of it is a pure function of `hash01`.
 */

/** How many rings the tube shows, and how much closer each is than the last —
 * the perspective of looking down a tube. */
const RINGS = 8;
const CLOSER = 0.84;

/** How far a ring sags at the sides, as a share of the sheet's width: the
 * rings are seen from above the tube's axis, so their far sides curve down. */
const SAG = 0.16;

/** The rings' ridges and the shadows under them, in pixels at `w = 400`. */
const RIDGE = 2.2;
const SHADOW = 9;

function ground(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, skin.ground[0]);
  grad.addColorStop(0.3, skin.ground[1]);
  grad.addColorStop(0.7, skin.ground[2]);
  grad.addColorStop(1, skin.ground[3]);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
}

/** Where ring `i` crosses the middle of the sheet: each gap is `CLOSER` of the
 * one above, so the rings crowd toward the bottom the way a tube's do. */
function ringY(i: number, h: number): number {
  let y = h * 0.04;
  let gap = h * 0.19;
  for (let k = 0; k < i; k++) {
    y += gap;
    gap *= CLOSER;
  }
  return y;
}

/** One ring across the sheet, sagging at the sides and never quite regular. */
function ring(i: number, w: number, h: number): Point[] {
  const y = ringY(i, h);
  const pts: Point[] = [];
  const steps = 26;
  for (let s = 0; s <= steps; s++) {
    const u = s / steps;
    const side = (2 * u - 1) ** 2;
    pts.push({
      x: w * u,
      y:
        y +
        side * w * SAG * (0.7 + i * 0.05) +
        Math.sin(u * 9.3 + i * 1.7) * h * 0.012 +
        (hash01(i * 41 + s * 7) - 0.5) * h * 0.006,
    });
  }
  return pts;
}

/**
 * The rings. Each is drawn as a shadow under a ridge: a wide dark stroke, then
 * a thin bright one along the same curve a little above it. The shadow is what
 * says the ridge stands out of the wall; the ridge alone is a line on it.
 */
function rings(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const k = Math.max(1, w / 400);
  g.lineCap = "round";
  for (let i = 0; i < RINGS; i++) {
    const depth = i / (RINGS - 1);
    const curve = openSmoothPath(ring(i, w, h));
    const shadow = new Path2D(curve);
    g.strokeStyle = rgba(skin.ground[3], 0.42 + depth * 0.3);
    g.lineWidth = SHADOW * k * (1 - depth * 0.45);
    g.save();
    g.translate(0, SHADOW * k * 0.55 * (1 - depth * 0.45));
    g.stroke(shadow);
    g.restore();
    g.strokeStyle = rgba(mixHex(skin.flesh[0], skin.rim, 0.3), 0.5 * (1 - depth * 0.7));
    g.lineWidth = RIDGE * k;
    g.stroke(shadow);
  }
}

/** The channel: the tube narrows toward the bottom of the picture, so the
 * middle goes dark faster than the walls either side. */
function channel(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const grad = g.createRadialGradient(w / 2, h * 0.92, w * 0.04, w / 2, h * 0.92, w * 0.62);
  grad.addColorStop(0, rgba(skin.ground[3], 0.78));
  grad.addColorStop(0.5, rgba(skin.ground[3], 0.3));
  grad.addColorStop(1, rgba(skin.ground[3], 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
}

/**
 * The glands: small swollen bodies in the wall between the rings, brighter
 * than the wall and each with a wet point of light on it. Fewer and smaller
 * with depth, like everything else down the tube.
 */
function glands(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const count = Math.round(Math.min(50, (w * h) / 11000));
  let body = "";
  let wet = "";
  for (let i = 0; i < count; i++) {
    const depth = hash01(i * 13 + 29) ** 1.4;
    const x = hash01(i * 7 + 11) * w;
    const y = depth * h;
    const r = (0.012 + hash01(i * 19 + 3) * 0.03) * w * (1 - depth * 0.5);
    body += blobPath(x, y, r, r * 0.86, 3, 0.08, 0.05, 0, i * 5 + 1, 14);
    wet += `M ${(x - r * 0.3).toFixed(2)} ${(y - r * 0.35).toFixed(2)} a ${(r * 0.18).toFixed(2)} ${(
      r * 0.13
    ).toFixed(2)} 0 1 0 0.1 0 `;
  }
  g.fillStyle = rgba(skin.flesh[1], 0.13);
  g.fill(new Path2D(body));
  g.fillStyle = rgba(skin.rim, 0.07);
  g.fill(new Path2D(wet));
}

/** The corners fall away, so the tube has walls rather than edges. */
function walls(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const floor = skin.ground[3];
  const sides = g.createLinearGradient(0, 0, w, 0);
  sides.addColorStop(0, rgba(floor, 0.7));
  sides.addColorStop(0.16, rgba(floor, 0));
  sides.addColorStop(0.84, rgba(floor, 0));
  sides.addColorStop(1, rgba(floor, 0.7));
  g.fillStyle = sides;
  g.fillRect(0, 0, w, h);
}

/** The painter, as `BAND_GROUND.paint` takes it. */
export function throat(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  ground(g, w, h, skin);
  glands(g, w, h, skin);
  rings(g, w, h, skin);
  channel(g, w, h, skin);
  walls(g, w, h, skin);
}
