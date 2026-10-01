import { limbX } from "@neon-spore/content";

/**
 * **The globe's geometry**: an eye modelled as a ball set in the cowl, and the
 * opening, the lashes and the cilia placed on it by longitude and latitude.
 * `paint.ts` composes the picture; this is only where things land.
 *
 * The ball is an ellipsoid — `rx` across and toward the viewer, `ry` up and
 * down — turning about its vertical axis by `theta`, so its silhouette never
 * changes and everything on it travels. A vertex that goes round the back is
 * folded onto the limb (`limbX`), which is what makes the opening a sliver
 * hugging the edge when the eye looks away, rather than a shape clipped by it.
 */

/** A ball, in field pixels, turned by `theta` (0 faces the pair). */
export interface Globe {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  theta: number;
}

/** A point on the surface, projected. `near` is whether it faces the pair. */
export interface Spot {
  x: number;
  y: number;
  near: boolean;
}

/** Project a longitude and latitude on the ball into the field. */
export function spot(g: Globe, lon: number, lat: number): Spot {
  const a = lon + g.theta;
  const cosA = Math.cos(a);
  return {
    x: g.cx + g.rx * limbX(Math.cos(lat), Math.sin(a), cosA),
    y: g.cy + g.ry * Math.sin(lat),
    near: cosA > 0,
  };
}

/** Half the opening's width, as a longitude either side of its middle. */
export const APERTURE_LON = 0.97;
/** How far the upper and lower lids stand off the middle when wide, as latitudes. */
const LID_UP = 0.62;
const LID_DOWN = 0.38;
/** How far the gap's middle rides down as the lids close: an eye closes downwards. */
const DESCENT = 0.2;
/** Vertices along each lid. */
const SAMPLES = 14;

/** How far a lid stands off the middle at `u` across, `-1..1`: pointed corners, the crown inboard. */
function bump(u: number, lean: number): number {
  return Math.max(0, 1 - u * u) * (1 + lean * u);
}

/** The latitude of the gap's own middle at `u`, as far down as the lids are shut. */
export function gapMiddle(u: number, open: number): number {
  return DESCENT * (1 - open) * Math.max(0, 1 - u * u);
}

/** The upper lid's latitude at `u`. */
export function lidTop(u: number, open: number): number {
  return gapMiddle(u, open) - LID_UP * open * bump(u, -0.18);
}

/** The lower lid's latitude at `u`. */
export function lidBottom(u: number, open: number): number {
  return gapMiddle(u, open) + LID_DOWN * open * bump(u, 0.22);
}

/** The opening, as one closed path on the ball: the upper lid across, the lower lid back. */
export function aperturePath(g: Globe, open: number): Path2D {
  const path = new Path2D();
  for (let i = 0; i <= SAMPLES; i++) {
    const u = -1 + (2 * i) / SAMPLES;
    const s = spot(g, u * APERTURE_LON, lidTop(u, open));
    if (i === 0) path.moveTo(s.x, s.y);
    else path.lineTo(s.x, s.y);
  }
  for (let i = SAMPLES - 1; i > 0; i--) {
    const u = -1 + (2 * i) / SAMPLES;
    const s = spot(g, u * APERTURE_LON, lidBottom(u, open));
    path.lineTo(s.x, s.y);
  }
  path.closePath();
  return path;
}

/**
 * Hairs along one lid, each a root and a tip both placed on the ball, so a
 * lash foreshortens and swings toward the vertical as it nears the limb
 * rather than being squeezed with a picture. A hair whose root has gone round
 * the back is not drawn. `reach` is the hair's length as a latitude, signed:
 * negative stands off the top lid, positive combs down off the bottom one.
 */
export function hairPath(
  g: Globe,
  count: number,
  lid: (u: number) => number,
  reach: (i: number) => number,
  flick: (i: number) => number,
): Path2D {
  const path = new Path2D();
  for (let i = 0; i < count; i++) {
    const u = -0.92 + (1.84 * (i + 0.5)) / count;
    const lon = u * APERTURE_LON;
    const lat = lid(u);
    const root = spot(g, lon, lat);
    if (!root.near) continue;
    // Out from the middle as well as off the lid, so the fringe fans.
    const tip = spot(g, lon + u * 0.14 + flick(i), lat + reach(i));
    path.moveTo(root.x, root.y);
    path.lineTo(tip.x, tip.y);
  }
  return path;
}

/** The ball's own outline, which the turn never changes. */
export function globePath(g: Globe, grow = 1): Path2D {
  const path = new Path2D();
  path.ellipse(g.cx, g.cy, g.rx * grow, g.ry * grow, 0, 0, Math.PI * 2);
  return path;
}
