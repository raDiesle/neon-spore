import { sinHash } from "./hash.js";
import type { MothPose } from "./moth-place.js";

/**
 * **THE MOTH's outlines**: four wings and a belly of plates, in pixels, off
 * the pose (`moth-place.ts`) — and nothing kept.
 *
 * **The shape is THE CASE and THE TITHE · EDGE**, two drafts combined
 * (`tools/shape-sheet/src/drafts/armoured.ts`, `collected.ts`). Each wing is
 * THE CASE's half-shell swung out from the body: its flank, fat a third of
 * the way along and drawn out to a point, with its facets standing as the
 * scallops of the wing's trailing edge. The belly is THE TITHE's plated slab
 * stood on end and tapered: a plate for every belly hit still owed.
 *
 * **Its health is the outline**: a wing loses a scallop, from the tip in, for
 * every spot shot off it — the fore wings carry the spots two columns out
 * and lose three, the hind wings the ones one column out and lose two — so
 * by the last level it flies on tatters, and its belly loses a plate a hit.
 *
 * Seen from below, as the pair sees it from the hull: the hind wings lie over
 * the fore ones.
 */

export interface Pt {
  x: number;
  y: number;
}

/** A wing as cut, in tiles from the body's middle, right side, unflapped. */
interface WingCut {
  root: Pt;
  tip: Pt;
  /** Half-shell width toward the trailing edge at its widest, in tiles. */
  wide: number;
  /** Scallops down the trailing edge — THE CASE's facets. */
  facets: number;
  /** Where along it the wing is widest, 0 root to 1 tip. */
  fat: number;
}

/** The fore wing: long, broad out toward its tip, over the spots two columns out. */
export const FORE: WingCut = {
  root: { x: 0.25, y: -0.55 },
  tip: { x: 2.95, y: -1.25 },
  wide: 1.8,
  facets: 5,
  fat: 0.68,
};
/** The hind wing: short and round, low, over the spots one column out. */
export const HIND: WingCut = {
  root: { x: 0.2, y: -0.15 },
  tip: { x: 1.75, y: 0.4 },
  wide: 0.95,
  facets: 4,
  fat: 0.4,
};

/**
 * THE CASE's flank, moved to fatten where the wing says: rising fast from a
 * narrow root to its widest at `fat`, then drawn out to the tip.
 */
function flank(f: number, fat: number): number {
  if (f < fat) return 0.18 + 0.82 * Math.sin((f / fat) * (Math.PI / 2));
  return 1 - 0.7 * ((f - fat) / (1 - fat)) ** 1.3;
}

/**
 * The wing in tiles from the body, before the beat: its leading edge out to
 * the tip and its scalloped trailing edge back, torn short by `tears`.
 */
function wingTiles(cut: WingCut, tears: number): Pt[] {
  const ax = cut.tip.x - cut.root.x;
  const ay = cut.tip.y - cut.root.y;
  const len = Math.hypot(ax, ay);
  // The trailing side's normal: down and back from the leading edge.
  const nx = -ay / len;
  const ny = ax / len;
  const torn = Math.min(cut.facets - 1, tears);
  const end = 1 - (torn / cut.facets) * 0.62;
  const n = 26;
  const lead: Pt[] = [];
  const trail: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const f = (i / n) * end;
    const bx = cut.root.x + ax * f;
    const by = cut.root.y + ay * f;
    const bow = 0.12 * Math.sin(f * Math.PI);
    lead.push({ x: bx - nx * bow, y: by - ny * bow });
    const scallop = 0.86 + 0.14 * Math.abs(Math.sin(f * Math.PI * cut.facets));
    const w = cut.wide * flank(f, cut.fat) * scallop;
    trail.push({ x: bx + nx * w, y: by + ny * w });
  }
  if (torn === 0) return [...lead, ...trail.reverse()];
  // The torn end: a ragged edge across from the leading edge to the trailing.
  const a = lead[n] as Pt;
  const b = trail[n] as Pt;
  const rag: Pt[] = [];
  for (let k = 1; k < 6; k++) {
    const u = k / 6;
    const bite = (k % 2 === 0 ? 0.08 : 0.22) + 0.1 * sinHash(k + tears * 7);
    rag.push({
      x: a.x + (b.x - a.x) * u - (ax / len) * bite,
      y: a.y + (b.y - a.y) * u - (ay / len) * bite,
    });
  }
  return [...lead, ...rag, ...trail.reverse()];
}

/**
 * The pale zigzag band a moth's wing carries across it, in tiles: from the
 * leading edge to the trailing one, `at` of the way out from the root.
 */
export function wingBand(cut: WingCut, at: number): Pt[] {
  const ax = cut.tip.x - cut.root.x;
  const ay = cut.tip.y - cut.root.y;
  const len = Math.hypot(ax, ay);
  const nx = -ay / len;
  const ny = ax / len;
  const w = cut.wide * flank(at, cut.fat) * 0.9;
  const out: Pt[] = [];
  for (let k = 0; k <= 8; k++) {
    const u = k / 8;
    // Bowed out toward the tip in the middle, and zigzagged.
    const f = at + 0.05 * Math.sin(u * Math.PI) + (k % 2 === 0 ? 0.015 : -0.015);
    out.push({ x: cut.root.x + ax * f + nx * w * u, y: cut.root.y + ay * f + ny * w * u });
  }
  return out;
}

/**
 * A point of the right-hand wings, in tiles, carried to the screen through
 * the pose: the beat raising the tips and narrowing the span, the rest folding
 * them up over the back, mirrored for the left with `side` -1.
 */
export function wingPoint(p: MothPose, tile: number, side: 1 | -1, q: Pt): Pt {
  const lift = Math.sin(p.flap) * 0.35 + p.fold * 0.55 + p.spent * -0.25;
  const span = Math.cos(p.flap) * (1 - 0.88 * p.fold);
  return {
    x: p.x + side * q.x * span * tile,
    y: p.y + (q.y - Math.abs(q.x) * lift) * tile,
  };
}

/** One wing's outline on the screen. */
export function wingOutline(
  p: MothPose,
  tile: number,
  cut: WingCut,
  side: 1 | -1,
  tears: number,
): Pt[] {
  return wingTiles(cut, tears).map((q) => wingPoint(p, tile, side, q));
}

/** One belly plate, THE TITHE's: its middle and half-sizes in pixels. */
export interface Plate {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

/**
 * The belly: `count` plates hung under the thorax, widest at the top,
 * tapering to the tail — and longer, each plate standing further from the
 * next, as it tips back to show it (`pitch`).
 */
export function bellyPlates(p: MothPose, tile: number, count: number): Plate[] {
  const out: Plate[] = [];
  const gap = tile * (0.2 + 0.08 * p.pitch);
  for (let i = 0; i < count; i++) {
    const k = count <= 1 ? 0 : i / (count - 1);
    out.push({
      x: p.x,
      y: p.y + tile * 0.32 + i * gap,
      rx: tile * (0.27 - 0.12 * k) * (1 + 0.12 * p.pitch),
      ry: tile * (0.12 + 0.03 * p.pitch),
    });
  }
  return out;
}
