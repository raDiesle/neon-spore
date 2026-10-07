import type { Point } from "@neon-spore/content";
import { grindstoneR } from "./grindstone-shape.js";
import type { Layout } from "./layout.js";

/**
 * **THE GRINDSTONE's caliper**: THE HOOD standing over the wheel, split at its
 * crown into two jaws on one bolt, one to a seat, each swinging in until its
 * tip bears on the stone (`grindstone-shape.ts` has the wheel, and the reason
 * for both shapes).
 *
 * Cut off the wheel's file when that one reached 221 lines, along the seam it
 * already had. Laid round the axle at the origin, as the wheel is, and as it
 * would hang shut: the draw turns each jaw about the bolt.
 */

/** THE HOOD at its own numbers: the arc's reach round the crown, and its thickness, in wheel radii. */
const HOOD_SWEEP = 2.5;
const HOOD_THICK = 0.22;
/** The caliper's radius, slack and bitten, in wheel radii; how far a slack jaw is swung out, in radians. */
const SPAN_SLACK = 1.3;
const SPAN_SHUT = 1.06;
const SWING = 0.35;
/** The gap either side of the crown bolt the jaws part at, in radians. */
const PART = 0.07;
/** A jaw pad's radius, and how far apart its two pads sit along the arc, in radians. */
const PAD_R = 0.11;
const PAD_GAP = 0.24;
const ARC_N = 14;

/** The caliper's two radii, `shut` of the way bitten: the arc's outer edge and its inner. */
function hoodRadii(l: Layout, shut: number): { outer: number; inner: number } {
  const r = grindstoneR(l);
  const outer = r * (SPAN_SLACK + (SPAN_SHUT - SPAN_SLACK) * shut);
  return { outer, inner: outer - r * HOOD_THICK };
}

/** How far the caliper stands out from the axle, `shut` of the way bitten: the whole body's reach. */
export function grindstoneReach(l: Layout, shut: number): number {
  return hoodRadii(l, shut).outer;
}

/** The bolt the jaws hang from: the crown of the caliper. */
export function grindstoneBolt(l: Layout, shut: number): Point {
  const { outer, inner } = hoodRadii(l, shut);
  return { x: 0, y: -(outer + inner) / 2 };
}

/** How far jaw `side` is swung out about the bolt, in canvas radians, `shut` of the way bitten. */
export function grindstoneJawTurn(side: 0 | 1, shut: number): number {
  return (side === 0 ? 1 : -1) * SWING * (1 - shut);
}

/** Jaw `side`'s own angle along the arc: from its crown end out to its tip. */
function jawAngle(side: 0 | 1, f: number): number {
  const reach = HOOD_SWEEP / 2 - PART;
  return -Math.PI / 2 + (side === 0 ? -1 : 1) * (PART + reach * f);
}

/** Jaw `side`, laid as it would hang shut; the draw turns it about the bolt. */
export function grindstoneJawPath(l: Layout, side: 0 | 1, shut: number): Path2D {
  const { outer, inner } = hoodRadii(l, shut);
  const pts: Point[] = [];
  // Out along the top, back along the underside: a piece with a thickness, THE HOOD's own.
  for (let i = 0; i <= ARC_N; i++) {
    const a = jawAngle(side, i / ARC_N);
    pts.push({ x: Math.cos(a) * outer, y: Math.sin(a) * outer });
  }
  for (let i = ARC_N; i >= 0; i--) {
    const a = jawAngle(side, i / ARC_N);
    pts.push({ x: Math.cos(a) * inner, y: Math.sin(a) * inner });
  }
  const p = new Path2D();
  const [first, ...rest] = pts;
  if (first === undefined) return p;
  p.moveTo(first.x, first.y);
  for (const q of rest) p.lineTo(q.x, q.y);
  p.closePath();
  return p;
}

/** Pad `k` of jaw `side`, on the underside by its tip, the first nearest the tip; laid as the jaw hangs shut. */
export function grindstonePadAt(l: Layout, side: 0 | 1, k: number, shut: number): Point {
  const { inner } = hoodRadii(l, shut);
  const reach = HOOD_SWEEP / 2 - PART;
  const a = jawAngle(side, 1 - (0.08 + k * PAD_GAP) / reach);
  const r = inner - PAD_R * l.tile * 0.4;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

/**
 * Pad `k` of jaw `side` where it stands, `shut` of the way bitten: laid on the
 * jaw, then swung with it about the bolt. The verdict ring and the hit test both
 * call this, so the ring is drawn where a thumb is taken.
 */
export function grindstonePadPlaced(l: Layout, side: 0 | 1, k: number, shut: number): Point {
  return turnedAbout(
    grindstonePadAt(l, side, k, shut),
    grindstoneBolt(l, shut),
    grindstoneJawTurn(side, shut),
  );
}

/** A jaw pad's radius, in pixels. */
export function grindstonePadR(l: Layout): number {
  return PAD_R * l.tile;
}

/** Point `p` turned `turn` radians about `about`. */
export function turnedAbout(p: Point, about: Point, turn: number): Point {
  const c = Math.cos(turn);
  const n = Math.sin(turn);
  const dx = p.x - about.x;
  const dy = p.y - about.y;
  return { x: about.x + dx * c - dy * n, y: about.y + dx * n + dy * c };
}
