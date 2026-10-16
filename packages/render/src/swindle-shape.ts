import { blobRadiusMul } from "@neon-spore/content";
import type { DealerBox } from "./swindle-place.js";

/**
 * **THE SWINDLE's outlines: THE HOOD** (`tools/shape-sheet/src/drafts/
 * tower-defence.ts`) — a body under an arc that is not attached to it — split
 * in two. Its body is hers, hung wide over the field; its arc is **a hood
 * over every pod she holds**, standing clear of the pod and touching nothing,
 * the cup of a shell game. A thin strand of her runs down to each hood's
 * crown, so the hoods read as hers.
 *
 * The card's own question was whether a body still reads once its arc is
 * gone; here that is every drop: the hood flies up off the pod
 * (`swindle-fx.ts`) and the pod beneath falls bare.
 */

/** THE HOOD's body: lobes, depth and wobble, and its seed. */
const LOBES = 3;
const DEPTH = 0.07;
const WOBBLE = 0.04;
const SEED = 9.2;
/** THE HOOD's arc, in pod radii and radians: how far it stands clear of the
 * pod, how thick it is, and how much of a circle it covers. */
const SPAN = 1.55;
const THICK = 0.45;
const SWEEP = 2.5;
/** Points round her body, and along a hood. */
const N = 72;
const ARC_N = 18;

export interface Point {
  x: number;
  y: number;
}

/** A point of her, turned by her lean about her middle. */
function turned(b: DealerBox, x: number, y: number): Point {
  const c = Math.cos(b.lean);
  const s = Math.sin(b.lean);
  const dx = x - b.x;
  const dy = y - b.y;
  return { x: b.x + dx * c - dy * s, y: b.y + dx * s + dy * c };
}

/** Her body: THE HOOD's, stretched wide and wobbling on its own clock. */
export function swindleOutline(b: DealerBox, time: number): Point[] {
  const rx = b.rx * (1 - 0.06 * b.rear);
  const ry = b.ry * (1 + 0.14 * b.rear);
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = blobRadiusMul(a, LOBES, DEPTH, WOBBLE, time * 0.7, SEED);
    pts.push(turned(b, b.x + Math.cos(a) * rx * m, b.y + Math.sin(a) * ry * m));
  }
  return pts;
}

/** Where a strand leaves her belly toward `x`. */
export function swindleStrandRoot(b: DealerBox, x: number): Point {
  const u = Math.max(-0.8, Math.min(0.8, (x - b.x) / b.rx));
  return turned(b, b.x + u * b.rx, b.y + Math.sqrt(1 - u * u) * b.ry * 0.85);
}

/**
 * The hood over a pod at (`x`, `y`) of radius `r`: THE HOOD's arc, a piece
 * with a thickness, concentric with the pod and riding a little on a slower
 * clock than it, so the two read as separate objects. Out along the top and
 * back along the underside.
 */
export function swindleHood(x: number, y: number, r: number, time: number, seed: number): Point[] {
  const ride = 1 + Math.sin(time * 0.42 + seed) * 0.05;
  const outer = r * SPAN * ride;
  const inner = outer - r * THICK;
  const half = SWEEP / 2;
  const pts: Point[] = [];
  for (let i = 0; i <= ARC_N; i++) {
    const a = -Math.PI / 2 - half + (i / ARC_N) * SWEEP;
    pts.push({ x: x + Math.cos(a) * outer, y: y + Math.sin(a) * outer });
  }
  for (let i = ARC_N; i >= 0; i--) {
    const a = -Math.PI / 2 - half + (i / ARC_N) * SWEEP;
    pts.push({ x: x + Math.cos(a) * inner, y: y + Math.sin(a) * inner });
  }
  return pts;
}

/** The top of a hood over a pod at `y` of radius `r`: where its strand ends. */
export function swindleHoodCrown(y: number, r: number): number {
  return y - r * SPAN;
}
