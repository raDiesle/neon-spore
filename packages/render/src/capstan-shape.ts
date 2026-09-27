import type { Point } from "@neon-spore/content";
import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE CAPSTAN's geometry**: where the drum stands, and what it is made of.
 *
 * **The body is two drafts combined** (`tools/shape-sheet/src/drafts/`):
 * GATE's square-shouldered bar (`creatures.ts`, the superellipse at 62 × 20,
 * power 4) laid across the field as a drum on its side, and a BEARING RING
 * (`systems.ts`, a notched rim of twelve teeth) for each of its two end
 * faces — the grated band the pair wears bright. A made thing, not grown,
 * which is what a winch drum is.
 *
 * **The turn is a yaw**: the cradle rocks the drum so one end comes round
 * toward the pair and the other goes behind it. The bar narrows as it turns
 * (`capstanBodyPath`'s `squeeze`) and the near face opens from a sliver to
 * most of a disc (`capstanFaceWidth`), so which face is bared reads at a
 * glance, and a centred drum shows both as slivers, neither bared.
 *
 * Under it a **cradle**, a saddle with a horn either side on one post, the
 * whole thing pivoting on the post's foot. Every path is laid round the
 * drum's middle at the origin; the draw moves the canvas, so the drop in,
 * the rock and the rattle are transforms.
 */

/** The row the drum's middle stands at, in tiles below the grid's top. */
const ROW = 3.2;
/** GATE at its own numbers, its half-width scaled to `HALF_W` tiles. */
const GATE = { rx: 62, ry: 20, power: 4 };
const HALF_W = 2.6;
/** BEARING RING's teeth, and how deep they cut, as a share of the face. */
const TEETH = 12;
const TOOTH = 0.11;
/** How wide a face is as a sliver, and fully turned, as a share of the drum's half-height. */
const SLIVER = 0.14;
const TURNED = 0.86;
/** How narrow the bar gets fully turned, as a share of its length. */
const SQUEEZE = 0.72;
/** The cradle: how far below the drum's middle its saddle bottoms out, and its post, in tiles. */
const SADDLE = 1.3;
const POST = 0.45;
/** The cap over the core, and the core, in tiles. */
const CAP = 0.46;
const CORE = 0.34;
/** How far the drum drops in from arriving, in tiles. */
const DROP = 2;
/** Points round one outline. */
const N = 40;

/** The drum's middle: over the middle column, near the top of the field. */
export function capstanCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** The drum's middle where it stands this frame, dropped in `arrived` of the way. */
export function capstanAt(l: Layout, cfg: SimConfig, arrived: number): Point {
  const home = capstanCentre(l, cfg);
  return { x: home.x, y: home.y - (1 - arrived) * DROP * l.tile };
}

/** The drum's half-length and half-height, in pixels. */
export function capstanSize(l: Layout): { rx: number; ry: number } {
  const k = (HALF_W * l.tile) / GATE.rx;
  return { rx: GATE.rx * k, ry: GATE.ry * k };
}

/** How far below the drum's middle the cradle pivots: the foot of its post, in pixels. */
export function capstanPivot(l: Layout): number {
  return (SADDLE + POST) * l.tile;
}

/** How much of its length the bar shows, turned `turn` of the way (either way round). */
export function capstanSqueeze(turn: number): number {
  return 1 - (1 - SQUEEZE) * Math.min(1, Math.abs(turn));
}

/** GATE's bar, `squeeze` of its length: the drum seen side-on. */
export function capstanBodyPath(l: Layout, squeeze: number): Path2D {
  const { rx, ry } = capstanSize(l);
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const r = (Math.abs(c) ** GATE.power + Math.abs(s) ** GATE.power) ** (-1 / GATE.power);
    pts.push({ x: c * r * rx * squeeze, y: s * r * ry });
  }
  return splinePath(pts, true);
}

/**
 * Face `side`'s half-width, in pixels, with the drum turned `turn` — minus
 * toward the left face, plus toward the right: most of a disc on the side it
 * is turned to, a sliver centred, and gone on the side it is turned from.
 */
export function capstanFaceWidth(l: Layout, side: 0 | 1, turn: number): number {
  const { ry } = capstanSize(l);
  const toward = side === 0 ? -turn : turn;
  const u = Math.max(-1, Math.min(1, toward));
  if (u >= 0) return ry * (SLIVER + (TURNED - SLIVER) * u);
  return ry * SLIVER * (1 + u);
}

/** Where face `side`'s middle sits: the end of the bar, `squeeze` of its length out. */
export function capstanFaceAt(l: Layout, side: 0 | 1, squeeze: number): Point {
  const { rx } = capstanSize(l);
  return { x: (side === 0 ? -1 : 1) * rx * squeeze * 0.94, y: 0 };
}

/**
 * A BEARING RING, `w` pixels wide: the face's notched rim round its middle,
 * its teeth turned `spin` radians — the draw turns them one tooth a reversal
 * worn, so the band is seen to go round under the thumb.
 */
export function capstanFacePath(l: Layout, w: number, spin: number): Path2D {
  const { ry } = capstanSize(l);
  const h = ry * 0.96;
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = 1 + TOOTH * Math.tanh(Math.sin(TEETH * a - spin) * 2.2);
    pts.push({ x: Math.cos(a) * w * m, y: Math.sin(a) * h * m });
  }
  return splinePath(pts, true);
}

/** The ring the band's marks sit on inside a face, as a share of the face. */
export const CAPSTAN_BAND = 0.62;

/** Mark `i` of `n` round a face `w` wide: its inner and outer ends. */
export function capstanBandTick(
  l: Layout,
  w: number,
  i: number,
  n: number,
): { a: Point; b: Point } {
  const { ry } = capstanSize(l);
  const t = (i / n) * Math.PI * 2 - Math.PI / 2;
  const c = Math.cos(t);
  const s = Math.sin(t);
  const r0 = CAPSTAN_BAND * 0.7;
  const r1 = CAPSTAN_BAND * 1.12;
  return {
    a: { x: c * w * r0, y: s * ry * r0 },
    b: { x: c * w * r1, y: s * ry * r1 },
  };
}

/**
 * The cradle, round the drum's middle: a saddle whose bottom sits `SADDLE`
 * tiles down and whose two horns rise either side to the drum's waist, and
 * the post it stands on.
 */
export function capstanCradlePath(l: Layout): Path2D {
  const { rx, ry } = capstanSize(l);
  const w = rx * 0.82;
  const t = 0.2 * l.tile;
  const bottom = SADDLE * l.tile;
  const p = new Path2D();
  p.moveTo(-w, -ry * 0.05);
  p.quadraticCurveTo(0, bottom * 2 - ry * 0.05, w, -ry * 0.05);
  p.lineTo(w - t, -ry * 0.05);
  p.quadraticCurveTo(0, bottom * 2 - ry * 0.05 - 2.4 * t, -w + t, -ry * 0.05);
  p.closePath();
  const post = POST * l.tile;
  const pw = 0.09 * l.tile;
  p.rect(-pw, bottom - t * 0.5, pw * 2, post + t * 0.5);
  p.rect(-pw * 3, bottom + post - pw, pw * 6, pw * 1.4);
  return p;
}

/** Horn `side`'s tip, where the lean's mark sits: nought the left, one the right. */
export function capstanHornAt(l: Layout, side: 0 | 1): Point {
  const { rx, ry } = capstanSize(l);
  const w = rx * 0.82 - 0.1 * l.tile;
  return { x: side === 0 ? -w : w, y: -ry * 0.05 - 0.22 * l.tile };
}

/** The cap's radius, which covers the core, and the core's at its fullest, in pixels. */
export function capstanCapR(l: Layout): number {
  return CAP * l.tile;
}

export function capstanCoreR(l: Layout): number {
  return CORE * l.tile;
}
