import { rootedContour } from "@neon-spore/content";
import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE TRIVET's geometry**: where the stand is, and the paths it is made of.
 *
 * **The stand is SINKER and three needles** (`tools/shape-sheet/src/drafts/`):
 * the hub is SINKER, *a round body held to the field by roots*, at its own
 * numbers — eight roots, of which `rootedContour` grows three on the
 * underside, one straight down and one either side, which is a tripod's three
 * sockets without a number changed; and each leg is one of CALTROP's needles,
 * narrow and pointed, run from a root out to a foot. The needle only:
 * CALTROP's body, four of them standing off a round form, is THE LEECH's
 * (`content/silhouettes-cling.ts`), and three run out as legs is not it. SINKER's own trade, that roots say nothing about where they reach,
 * is what the needles pay: the legs say exactly where each foot comes down.
 *
 * **The feet are fixed by geometry**: the pilot's, the front, splayed to the
 * left; the navigator's, the rear, to the right; and the third, the middle,
 * straight down, never lifted and no part of the health. An outer foot is a
 * plate with its `TRIVET_PADS` sockets in a row, the first nearest the hub.
 *
 * Every path is laid round the hub's middle at the origin; the draw moves
 * the canvas, so the drop and the collapse are transforms. A foot swings about
 * the root its leg leaves, which is the whole of how it plants.
 */

export interface Point {
  x: number;
  y: number;
}

/** A leg: the pilot's front (0), the navigator's rear (1), or the middle (2). */
export type TrivetLeg = 0 | 1 | 2;

/** The row the hub stands at, in tiles below the grid's top. */
const ROW = 2.2;
/** SINKER at its own numbers; its 30-wide body is scaled to `HUB` tiles. */
const HUB_FORM = rootedContour({ rx: 30, ry: 28, roots: 8, reach: 1, drift: 0.2, period: 6 })(0);
const HUB_RX = 30;
const HUB = 0.55;
/** The samples of `HUB_FORM` the three underside roots end at: 135°, 45° and 90° of 64. */
const ROOT_SAMPLE: Record<TrivetLeg, number> = { 0: 24, 1: 8, 2: 16 };
/** How far out along its root a leg leaves the hub, as a share of the root's reach. */
const ROOT_IN = 0.6;
/** Where each planted foot comes down, in tiles from the hub. */
const FOOT: Record<TrivetLeg, Point> = {
  0: { x: -2.5, y: 1.9 },
  1: { x: 2.5, y: 1.9 },
  2: { x: 0, y: 2.1 },
};
/** How far a lifted foot has swung up, in radians about its root. */
const LIFT = 0.62;
/** CALTROP's needle: half-widths at the root and at the foot, in tiles. */
const NEEDLE_BASE = 0.13;
const NEEDLE_TIP = 0.04;
/** A foot's plate, half-length and half-height in tiles, and its sockets' spacing and radius. */
const PLATE_HALF = 0.62;
const PLATE_HALF_H = 0.17;
const SOCKET_GAP = 0.4;
const SOCKET_R = 0.11;
/** The hub's face, the target, as a share of the hub's half-width. */
const FACE = 0.56;

/** The hub's middle: over the middle column, near the top of the field. */
export function trivetCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** How far above its place the stand still is, `arrived` of the way in. */
export function trivetDrop(l: Layout, arrived: number): number {
  return (1 - arrived) * 3 * l.tile;
}

function hubScale(l: Layout): number {
  return (HUB * l.tile) / HUB_RX;
}

/** SINKER's outline, its three underside roots the stand's sockets. */
export function trivetHubPath(l: Layout): Path2D {
  const k = hubScale(l);
  return splinePath(
    HUB_FORM.map((p) => ({ x: p.x * k, y: p.y * k })),
    true,
  );
}

/** The hub's half-width, in pixels. */
export function trivetHubR(l: Layout): number {
  return HUB * l.tile;
}

/** The hub's face at its fullest, in pixels. */
export function trivetFaceR(l: Layout): number {
  return trivetHubR(l) * FACE;
}

/** The root a leg leaves the hub at, with the hub `drop` pixels lower than it stands. */
export function trivetRoot(l: Layout, leg: TrivetLeg, drop: number): Point {
  const p = HUB_FORM[ROOT_SAMPLE[leg]] ?? { x: 0, y: 0 };
  const k = hubScale(l);
  // Partway up the root rather than at its tip, so the needle sinks into the hub.
  return { x: p.x * k * ROOT_IN, y: p.y * k * ROOT_IN + drop };
}

/**
 * Where leg `leg`'s foot is, `lift` of the way swung up (0 planted, 1 up,
 * past 1 splayed further) and `splay` of the way buckled outward, and the
 * angle it has turned through, so the plate can turn with it. Swung about the
 * root it leaves as the hub stands, so a hub pressed down does not drag its
 * feet with it.
 */
export function trivetFoot(
  l: Layout,
  leg: TrivetLeg,
  lift: number,
  splay: number,
): Point & { turn: number } {
  const root = trivetRoot(l, leg, 0);
  const foot = FOOT[leg];
  const dx = foot.x * l.tile - root.x;
  const dy = foot.y * l.tile - root.y;
  // A lifted outer foot turns up and away from the middle; a buckled one flattens outward.
  const side = leg === 0 ? 1 : leg === 1 ? -1 : 0;
  const turn = side * (LIFT * lift + 0.5 * splay);
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  const out = leg === 2 ? 0 : (leg === 0 ? -1 : 1) * splay * 0.4 * l.tile;
  return { x: root.x + dx * c - dy * s + out, y: root.y + dx * s + dy * c, turn };
}

/** CALTROP's needle from `from` to `to`: wide at the root, a point at the foot. */
export function trivetLegPath(l: Layout, from: Point, to: Point): Path2D {
  const len = Math.max(0.001, Math.hypot(to.x - from.x, to.y - from.y));
  const nx = -(to.y - from.y) / len;
  const ny = (to.x - from.x) / len;
  const b = NEEDLE_BASE * l.tile;
  const t = NEEDLE_TIP * l.tile;
  const p = new Path2D();
  p.moveTo(from.x + nx * b, from.y + ny * b);
  p.lineTo(to.x + nx * t, to.y + ny * t);
  p.lineTo(to.x - nx * t, to.y - ny * t);
  p.lineTo(from.x - nx * b, from.y - ny * b);
  p.closePath();
  return p;
}

/** An outer foot's plate, laid flat round the foot at the origin: a capsule, the leg meeting its middle. */
export function trivetPlatePath(l: Layout): Path2D {
  const hx = PLATE_HALF * l.tile;
  const hy = PLATE_HALF_H * l.tile;
  const p = new Path2D();
  p.moveTo(-hx + hy, -hy);
  p.lineTo(hx - hy, -hy);
  p.arc(hx - hy, 0, hy, -Math.PI / 2, Math.PI / 2);
  p.lineTo(-hx + hy, hy);
  p.arc(-hx + hy, 0, hy, Math.PI / 2, (Math.PI * 3) / 2);
  p.closePath();
  return p;
}

/** Socket `k`'s middle on outer foot `side`'s plate, the first nearest the hub. */
export function trivetSocketAt(l: Layout, side: 0 | 1, k: number): Point {
  const inward = side === 0 ? 1 : -1;
  return { x: inward * (1 - k) * SOCKET_GAP * l.tile, y: 0 };
}

/** A socket's radius, in pixels. */
export function trivetSocketR(l: Layout): number {
  return SOCKET_R * l.tile;
}

/** The clamp that locks a foot home: two jaws across the ankle, `shut` of the way closed. */
export function trivetClampPath(l: Layout, shut: number): Path2D {
  const w = (0.12 + 0.2 * (1 - shut)) * l.tile;
  const h = 0.3 * l.tile;
  const p = new Path2D();
  for (const s of [-1, 1]) {
    p.moveTo(s * (w + 0.1 * l.tile), -PLATE_HALF_H * l.tile - h);
    p.lineTo(s * w, -PLATE_HALF_H * l.tile - h);
    p.lineTo(s * w, -PLATE_HALF_H * l.tile);
  }
  return p;
}
