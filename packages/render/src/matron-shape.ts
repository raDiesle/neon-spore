import { blobRadiusMul } from "@neon-spore/content";
import type { MotherBox } from "./matron-place.js";

/**
 * **THE MATRON's outline**: HULL · TRADED (`tools/shape-sheet/src/drafts/ship.ts`)
 * hung upside down — a skin with lobes standing out of it, each lobe carrying
 * something and giving it over — on a body with the wobble of a slime.
 *
 * The card was a span of the ship's membrane with two lobes trading what they
 * carry. Hung over the field it is her belly, and **a lobe reaches down out of
 * it to every pod she holds**, its tip under the pod: shot loose, the pod
 * falls and the lobe springs back up into her (`matron-fx.ts`); swallowed, it
 * is one lobe fewer. So what is left of the clutch is counted off her lobes,
 * and what is left of her off the eggs inside (`matron-draw.ts`).
 *
 * The body is one closed contour and each lobe another; `matron-draw.ts` rims
 * them as one, so where a lobe leaves the belly there is no seam.
 */

/** Her wobble's lobes, depth and size, and its seed. */
const LOBES = 5;
const DEPTH = 0.05;
const WOBBLE = 0.05;
const SEED = 3.1;
/** The belly's flattening: the power `sin` is raised to under her. */
const BELLY_POW = 0.6;
/** Points round her outline, and along each side of a lobe. */
const N = 96;
const ALONG = 10;

export interface Point {
  x: number;
  y: number;
}

/** A point of her, turned by her lean about her middle. */
function turned(b: MotherBox, x: number, y: number): Point {
  const c = Math.cos(b.lean);
  const s = Math.sin(b.lean);
  const dx = x - b.x;
  const dy = y - b.y;
  return { x: b.x + dx * c - dy * s, y: b.y + dx * s + dy * c };
}

/** Her outline: round over the crown, flattened under the belly. */
export function matronOutline(b: MotherBox, time: number): Point[] {
  const pts: Point[] = [];
  // Rearing back she stands taller and narrower.
  const rx = b.rx * (1 - 0.06 * b.rear);
  const ry = b.ry * (1 + 0.12 * b.rear);
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = blobRadiusMul(a, LOBES, DEPTH, WOBBLE, time * 0.6, SEED);
    const sin = Math.sin(a);
    const y = sin > 0 ? sin ** BELLY_POW : sin;
    pts.push(turned(b, b.x + Math.cos(a) * rx * m, b.y + y * ry * m));
  }
  return pts;
}

/** Where a lobe leaves her belly toward `x`: inside her, so the root is hidden. */
export function matronLobeRoot(b: MotherBox, x: number): Point {
  const u = Math.max(-0.7, Math.min(0.7, (x - b.x) / b.rx));
  const y = (1 - u * u) ** (BELLY_POW / 2);
  return turned(b, b.x + u * b.rx, b.y + y * b.ry * 0.82);
}

/**
 * A lobe from `root` to `tip`: a tapering tongue of her along a curve that
 * sways, `wide` across at the root and a third of that at the tip, rounded
 * there under the pod.
 */
export function matronLobe(root: Point, tip: Point, wide: number, sway: number): Point[] {
  const ctrl = { x: root.x + (tip.x - root.x) * 0.25 + sway, y: (root.y + tip.y) / 2 };
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= ALONG; i++) {
    const t = i / ALONG;
    const u = 1 - t;
    const x = u * u * root.x + 2 * u * t * ctrl.x + t * t * tip.x;
    const y = u * u * root.y + 2 * u * t * ctrl.y + t * t * tip.y;
    const dx = 2 * u * (ctrl.x - root.x) + 2 * t * (tip.x - ctrl.x);
    const dy = 2 * u * (ctrl.y - root.y) + 2 * t * (tip.y - ctrl.y);
    const len = Math.hypot(dx, dy) || 1;
    const half = (wide / 2) * (1 - 0.65 * t);
    left.push({ x: x - (dy / len) * half, y: y + (dx / len) * half });
    right.push({ x: x + (dy / len) * half, y: y - (dx / len) * half });
  }
  // Round the tip: a little cap past its end, under the pod.
  const end = left.length - 1;
  const l = left[end] ?? tip;
  const r = right[end] ?? tip;
  const cap = { x: tip.x + (tip.x - ctrl.x) * 0.08, y: tip.y + wide * 0.18 };
  return [...left.slice(0, end), l, cap, r, ...right.slice(0, end).reverse()];
}
