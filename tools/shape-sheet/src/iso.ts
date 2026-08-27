import type { Point } from "@neon-spore/content";
import type { Bounds } from "./metrics.js";

/**
 * The outline of a field, as however many closed loops it actually has.
 *
 * The cluster forms used to be marched radially from the centroid: at each
 * angle, the distance where the field crosses the threshold. That is cheap and
 * it is exact while the shape stays star-shaped about its middle — and it can
 * only ever return *one* outline, because one angle has one answer. So a
 * cluster could thin to a waist and never part, which is precisely the moment
 * Symbiosis and The Choir are built on: both hang their whole mechanic on
 * bodies visibly separating, and neither could be judged from a picture that
 * cannot show it.
 *
 * Marching squares has no such assumption. It walks a grid, finds where the
 * field crosses the threshold on each cell edge, and joins the crossings into
 * loops — one while the bodies are merged, several the instant they are not,
 * with the parting happening on its own rather than being drawn in.
 */

/** A scalar field. Above `iso` is inside. */
export type Field = (x: number, y: number) => number;

/** Grid cells per side. 64 puts a cell at roughly a twelfth of a body radius. */
const RES = 64;

interface Edge {
  from: Point;
  to: Point;
}

/** Where the field crosses `iso` between two corners, linearly. */
function cross(
  ax: number,
  ay: number,
  av: number,
  bx: number,
  by: number,
  bv: number,
  iso: number,
) {
  const d = bv - av;
  const f = Math.abs(d) < 1e-9 ? 0.5 : (iso - av) / d;
  const c = Math.min(1, Math.max(0, f));
  return { x: ax + (bx - ax) * c, y: ay + (by - ay) * c };
}

/** A key two neighbouring cells agree on, so their segments join. */
function key(p: Point): string {
  return `${Math.round(p.x * 512)}:${Math.round(p.y * 512)}`;
}

/**
 * The sixteen corner patterns, as directed segments with the inside on the
 * left.
 *
 * Direction is not decoration here: the loops are built by walking end to
 * start, so a segment pointing the wrong way is a dead end, and a ring that
 * dead-ends comes out as several fragments plus the slivers between them.
 * Which is why a pattern and its complement — one corner in, versus one corner
 * out — are listed separately and reversed, rather than sharing a line because
 * they cut the cell along the same line.
 *
 * Two patterns are genuinely ambiguous: opposite corners in, opposite corners
 * out describes both a waist and two bodies passing. The cell's centre is
 * sampled to decide, which is the one place a metaball has to be asked what it
 * means rather than told.
 */
function segments(code: number, e: Point[], centreInside: boolean): Edge[] {
  const [top, right, bottom, left] = e as [Point, Point, Point, Point];
  switch (code) {
    case 1:
      return [{ from: left, to: top }];
    case 14:
      return [{ from: top, to: left }];
    case 2:
      return [{ from: top, to: right }];
    case 13:
      return [{ from: right, to: top }];
    case 3:
      return [{ from: left, to: right }];
    case 12:
      return [{ from: right, to: left }];
    case 4:
      return [{ from: right, to: bottom }];
    case 11:
      return [{ from: bottom, to: right }];
    case 6:
      return [{ from: top, to: bottom }];
    case 9:
      return [{ from: bottom, to: top }];
    case 7:
      return [{ from: left, to: bottom }];
    case 8:
      return [{ from: bottom, to: left }];
    case 5:
      return centreInside
        ? [
            { from: right, to: top },
            { from: left, to: bottom },
          ]
        : [
            { from: left, to: top },
            { from: right, to: bottom },
          ];
    case 10:
      return centreInside
        ? [
            { from: top, to: left },
            { from: bottom, to: right },
          ]
        : [
            { from: top, to: right },
            { from: bottom, to: left },
          ];
    default:
      return [];
  }
}

/** Chain segments end-to-start into closed rings. */
function chain(edges: Edge[]): Point[][] {
  const byStart = new Map<string, Edge[]>();
  for (const e of edges) {
    const k = key(e.from);
    const at = byStart.get(k);
    if (at) at.push(e);
    else byStart.set(k, [e]);
  }
  const loops: Point[][] = [];
  const used = new Set<Edge>();
  for (const start of edges) {
    if (used.has(start)) continue;
    const loop: Point[] = [start.from];
    let e: Edge | undefined = start;
    // Bounded by the segment count: a ring cannot be longer than the grid.
    while (e && !used.has(e)) {
      used.add(e);
      loop.push(e.to);
      e = byStart.get(key(e.to))?.find((n) => !used.has(n));
    }
    if (loop.length > 3) loops.push(loop);
  }
  return loops;
}

/** Every closed loop of `field` at `iso`, inside `box`. */
export function isoLoops(field: Field, box: Bounds, iso = 1, res = RES): Point[][] {
  const dx = (box.x1 - box.x0) / res;
  const dy = (box.y1 - box.y0) / res;
  const v: number[] = new Array((res + 1) * (res + 1));
  for (let j = 0; j <= res; j++) {
    for (let i = 0; i <= res; i++) {
      v[j * (res + 1) + i] = field(box.x0 + i * dx, box.y0 + j * dy);
    }
  }

  const edges: Edge[] = [];
  for (let j = 0; j < res; j++) {
    for (let i = 0; i < res; i++) {
      const x0 = box.x0 + i * dx;
      const y0 = box.y0 + j * dy;
      const x1 = x0 + dx;
      const y1 = y0 + dy;
      const a = v[j * (res + 1) + i]!;
      const b = v[j * (res + 1) + i + 1]!;
      const c = v[(j + 1) * (res + 1) + i + 1]!;
      const d = v[(j + 1) * (res + 1) + i]!;
      const code = (a > iso ? 1 : 0) | (b > iso ? 2 : 0) | (c > iso ? 4 : 0) | (d > iso ? 8 : 0);
      if (code === 0 || code === 15) continue;
      const e: Point[] = [
        cross(x0, y0, a, x1, y0, b, iso),
        cross(x1, y0, b, x1, y1, c, iso),
        cross(x1, y1, c, x0, y1, d, iso),
        cross(x0, y1, d, x0, y0, a, iso),
      ];
      const centre = code === 5 || code === 10 ? field(x0 + dx / 2, y0 + dy / 2) > iso : false;
      edges.push(...segments(code, e, centre));
    }
  }
  return chain(edges);
}

/** Perimeter of a closed polyline. */
function perimeter(loop: Point[]): number {
  let l = 0;
  for (let i = 0; i < loop.length; i++) {
    const p = loop[i]!;
    const q = loop[(i + 1) % loop.length]!;
    l += Math.hypot(q.x - p.x, q.y - p.y);
  }
  return l;
}

/** A closed loop redrawn with `n` points evenly spaced along its length. */
export function resample(loop: Point[], n: number): Point[] {
  const total = perimeter(loop);
  if (total < 1e-6 || n < 3) return loop;
  const step = total / n;
  const out: Point[] = [];
  let seg = 0;
  let before = 0;
  for (let k = 0; k < n; k++) {
    const want = k * step;
    while (seg < loop.length - 1) {
      const p = loop[seg]!;
      const q = loop[seg + 1]!;
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      if (before + len >= want) break;
      before += len;
      seg++;
    }
    const p = loop[seg]!;
    const q = loop[(seg + 1) % loop.length]!;
    const len = Math.hypot(q.x - p.x, q.y - p.y);
    const f = len < 1e-9 ? 0 : Math.min(1, Math.max(0, (want - before) / len));
    out.push({ x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f });
  }
  return out;
}

/**
 * Spread `n` points across several loops by length, so a subject that comes
 * apart still samples to the same number of points it did while it was one
 * body. Anything that indexes a contour by position — the travel metric, an
 * onion-skinned frame — compares t against t = 0 point by point, and a count
 * that changes when a shape parts would make that comparison meaningless
 * exactly when the shape got interesting.
 */
export function resampleAll(loops: Point[][], n: number, min = 10): Point[][] {
  if (loops.length === 0) return loops;
  const lengths = loops.map(perimeter);
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  const counts = lengths.map((l) => Math.max(min, Math.floor((l / total) * n)));
  const spare = n - counts.reduce((a, b) => a + b, 0);
  // The remainder goes to the biggest loop, which is the one it shows on.
  let biggest = 0;
  for (let i = 1; i < lengths.length; i++) if (lengths[i]! > lengths[biggest]!) biggest = i;
  counts[biggest] = Math.max(min, counts[biggest]! + spare);
  return loops.map((loop, i) => resample(loop, counts[i]!));
}
