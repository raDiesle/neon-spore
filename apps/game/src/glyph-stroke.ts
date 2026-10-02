import { GLYPHS } from "@neon-spore/sim";

/**
 * **A stroke on the glass, judged as one of the five signs** — the half of
 * THE MIMIC's DRAWN GLYPH that runs on the drawing phone
 * (`docs/spec/bosses-choreographed.md` §42, `sim/glyphs.ts`).
 *
 * The simulation is told the fact and never the stroke, the way it is told a
 * shake and never the accelerometer (`shake.ts`): which of the five a thumb
 * drew is decided here, where floats and milliseconds are allowed, and only
 * the index crosses the wire.
 *
 * The match is a template matcher of the `$1` family, kept small. The stroke
 * is resampled to `POINTS` evenly spaced points, set in a box about its middle
 * and scaled so its longer side is one, and then compared point for point
 * with every way each of the five could have been drawn: either direction,
 * mirrored either way, and — for the two closed signs, the ring and the
 * triangle — begun at any point round it. The nearest wins, unless
 * it is further than `GLYPH_FAR` from every one of them, or the stroke is too
 * short to be a sign at all; then nothing is sent, and a thumb that missed is
 * a thumb that tries again inside the window rather than a wrong sign worn.
 *
 * The short side is scaled with the long one down to `FLAT` of it and no
 * further, so a line stays a line instead of being blown up into a box —
 * a stroke straight across the pad is far from all five, not a zigzag.
 *
 * **The templates are the picture of each sign**: whoever draws the sign on
 * the skin (THE MIMIC's look) draws these five, so the shape a pair agrees a
 * word for is the shape this file is listening for.
 */

export interface StrokePoint {
  x: number;
  y: number;
}

/** Points a stroke is resampled to before it is compared. */
const POINTS = 32;
/** The flattest a stroke's box is let be, as its short side over its long. */
const FLAT = 0.3;
/** Mean distance, in boxes, beyond which a stroke is no sign at all. */
export const GLYPH_FAR = 0.2;
/** The shortest stroke that can be a sign, in CSS pixels along its length. */
export const GLYPH_MIN_STROKE = 40;

/** A closed sign's starting places, the ring's and the triangle's: every point round it. */
const STARTS = POINTS - 1;

/** Each of the five as it is drawn, in a box from 0 to 1 with y down. */
const SHAPES: Record<(typeof GLYPHS)[number], { at: StrokePoint[]; closed: boolean }> = {
  ring: {
    at: Array.from({ length: 33 }, (_, i) => {
      const a = (i / 32) * Math.PI * 2 - Math.PI / 2;
      return { x: 0.5 + 0.5 * Math.cos(a), y: 0.5 + 0.5 * Math.sin(a) };
    }),
    closed: true,
  },
  triangle: {
    at: [
      { x: 0.5, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0.5, y: 0 },
    ],
    closed: true,
  },
  // Down and up twice, all straight: a W, four strokes with sharp corners.
  zigzag: {
    at: [
      { x: 0, y: 0 },
      { x: 0.25, y: 1 },
      { x: 0.5, y: 0 },
      { x: 0.75, y: 1 },
      { x: 1, y: 0 },
    ],
    closed: false,
  },
  // One whole period of a sine, lying down: up, over, down, under and back.
  wave: {
    at: Array.from({ length: 25 }, (_, i) => ({
      x: i / 24,
      y: 0.5 - 0.5 * Math.sin((i / 24) * Math.PI * 2),
    })),
    closed: false,
  },
  // A J: straight down the right-hand side, then a half turn up the left.
  hook: {
    at: [
      { x: 1, y: 0 },
      ...Array.from({ length: 13 }, (_, i) => {
        const a = (i / 12) * Math.PI;
        return { x: 0.5 + 0.5 * Math.cos(a), y: 0.6 + 0.4 * Math.sin(a) };
      }),
    ],
    closed: false,
  },
};

/** How far along a polyline it runs, end to end. */
export function strokeLength(at: readonly StrokePoint[]): number {
  let length = 0;
  for (let i = 1; i < at.length; i++) {
    const a = at[i - 1] as StrokePoint;
    const b = at[i] as StrokePoint;
    length += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return length;
}

/** `n` points evenly spaced along the polyline, its two ends included. */
function resample(at: readonly StrokePoint[], n: number): StrokePoint[] {
  const first = at[0] as StrokePoint;
  const total = strokeLength(at);
  if (total === 0) return Array.from({ length: n }, () => ({ ...first }));
  const gap = total / (n - 1);
  const out: StrokePoint[] = [{ ...first }];
  // How far along the polyline the next point is still owed.
  let owed = gap;
  for (let i = 1; i < at.length; i++) {
    const a = at[i - 1] as StrokePoint;
    const b = at[i] as StrokePoint;
    const span = Math.hypot(b.x - a.x, b.y - a.y);
    let along = 0;
    while (span - along >= owed && out.length < n) {
      along += owed;
      const t = along / span;
      out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
      owed = gap;
    }
    owed -= span - along;
  }
  const last = at[at.length - 1] as StrokePoint;
  while (out.length < n) out.push({ ...last });
  return out;
}

/** Set in a box about its middle, its long side one and its short no flatter than `FLAT`. */
function boxed(at: readonly StrokePoint[]): StrokePoint[] {
  const xs = at.map((p) => p.x);
  const ys = at.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const long = Math.max(x1 - x0, y1 - y0) || 1;
  const sx = Math.max(x1 - x0, long * FLAT);
  const sy = Math.max(y1 - y0, long * FLAT);
  const [cx, cy] = [(x0 + x1) / 2, (y0 + y1) / 2];
  return at.map((p) => ({ x: (p.x - cx) / sx, y: (p.y - cy) / sy }));
}

/** The stroke as it is compared: resampled, then boxed. */
function normal(at: readonly StrokePoint[]): StrokePoint[] {
  return boxed(resample(at, POINTS));
}

/** Every way one sign may be drawn, each already normal. */
function variants(shape: { at: StrokePoint[]; closed: boolean }): StrokePoint[][] {
  const out: StrokePoint[][] = [];
  const base = resample(shape.at, POINTS);
  const starts = shape.closed ? STARTS : 1;
  for (let s = 0; s < starts; s++) {
    // A closed sign's points run round once: the last is the first again, so a
    // later start is the ring turned on, with the seam moved.
    const shift = s;
    const turned = shape.closed
      ? [...base.slice(shift, POINTS - 1), ...base.slice(0, shift + 1)]
      : base;
    for (const fx of [1, -1]) {
      for (const fy of [1, -1]) {
        const flipped = turned.map((p) => ({ x: fx * p.x, y: fy * p.y }));
        out.push(boxed(flipped), boxed([...flipped].reverse()));
      }
    }
  }
  return out;
}

const TEMPLATES: StrokePoint[][][] = GLYPHS.map((g) => variants(SHAPES[g]));

function meanDistance(a: readonly StrokePoint[], b: readonly StrokePoint[]): number {
  let sum = 0;
  for (let i = 0; i < POINTS; i++) {
    const p = a[i] as StrokePoint;
    const q = b[i] as StrokePoint;
    sum += Math.hypot(p.x - q.x, p.y - q.y);
  }
  return sum / POINTS;
}

/** How far a stroke is from each of the five, nearest way round, in `GLYPHS` order. */
export function glyphDistances(stroke: readonly StrokePoint[]): number[] {
  const at = normal(stroke);
  return TEMPLATES.map((ways) => Math.min(...ways.map((way) => meanDistance(at, way))));
}

/**
 * **The sign a stroke is, as its index into `GLYPHS`, or -1 for none**: a
 * stroke shorter than `GLYPH_MIN_STROKE` — a tap is one point — or one further
 * than `GLYPH_FAR` from all five.
 */
export function recogniseGlyph(stroke: readonly StrokePoint[]): number {
  if (stroke.length < 2 || strokeLength(stroke) < GLYPH_MIN_STROKE) return -1;
  const far = glyphDistances(stroke);
  let best = -1;
  for (let g = 0; g < far.length; g++) {
    if ((far[g] ?? Infinity) <= GLYPH_FAR && (best < 0 || (far[g] ?? 0) < (far[best] ?? 0)))
      best = g;
  }
  return best;
}
