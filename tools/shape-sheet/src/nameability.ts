import { type Beats, beats, livingMotion, livingSilhouette, type Pose } from "@neon-spore/content";
import { THROB_SWELL } from "@neon-spore/render";
import { type CreatureKind, DEFAULT_CONFIG } from "@neon-spore/sim";
import { blob } from "./subjects.js";

/**
 * The three axes a silhouette is told apart on, and the rule that says when
 * two kinds are the same word.
 *
 * `docs/alive.md` designed this gate as one axis — sample each kind's pose
 * across a beat and fail when two aspect ranges overlap — and it was
 * unsatisfiable the day it was written. The report has SLICK near 1.7 and
 * BULB, THROB and RUNT all near 1.0, so three kinds collided before a line of
 * the batch existed. Aspect cannot separate the round three, and the round
 * three are where the vocabulary risk actually lives.
 *
 * So: three axes, and a pair is confusable only when it overlaps on **all
 * three at once**. They are the three things a player says out loud across a
 * voice delay — *the wide one*, *the knobbly one*, *the little one* — and each
 * one is measured through the pose, because the pose is the thing somebody
 * will want to raise once the game is on a phone and that is what this gate
 * exists to refuse.
 */

/**
 * A closed interval. Every axis is a *range*, because a body is not one shape
 * — it is every shape its own motion and its own wobble carry it through, and
 * a kind that only sometimes looks like another kind is already a kind the
 * pair cannot name reliably.
 */
export interface Span {
  lo: number;
  hi: number;
}

export interface Nameability {
  /** Drawn width over drawn height, pose included. *The wide one.* */
  aspect: Span;
  /** Dominant angular harmonic of the drawn contour. *The knobbly one.* */
  lobe: Span;
  /** Geometric-mean drawn diameter, px at the reference body. *The little one.* */
  size: Span;
}

/**
 * The radius `render/creatures.ts` gives every living body — `l.tile * 0.4` —
 * on a 390 CSS px phone at the field's own column count. A radius, because
 * the silhouettes' own `rx`/`ry` are radii and the scale is their ratio.
 *
 * `DEFAULT_CONFIG.cols`, never `AUTHORED_COLS`: waves are authored against
 * seven columns and played on eleven, and a body measured on the authoring
 * grid would come out half again too big on the one sheet built to answer how
 * big it actually reads.
 *
 * Illustrative, and deliberately so. Every comparison below is between two
 * kinds measured through the same constant, so the rule is scale-free and a
 * wider phone moves every row by one factor. The number is here only so the
 * column reads in the units `docs/alive.md` argues in: "the runt draws at
 * about 10 px" is an argument, "the runt draws at 0.29 tiles" is not.
 */
const REFERENCE_BODY_PX = (390 / DEFAULT_CONFIG.cols) * 0.4;

/**
 * The pose window, in beats, and the step across it.
 *
 * Beats, not seconds — `poseAt` takes `Beats` — and a window rather than the
 * single beat the design asked for. One beat is not a window: the slowest pose
 * here is HOLD's `sin(t * 0.375)`, sixteen beats to a cycle, so a one-beat
 * sample would report whichever corner of the drift the scan started in. Long
 * enough to hold every layer's extremes, and found by scanning for the same
 * reason `metrics.ts`'s `WINDOW` is — the layers are not commensurate, so
 * there is nothing to solve.
 */
const POSE_WINDOW = 64;
const POSE_STEP = 0.1;

/**
 * How many moments of the *contour's* wobble each pose is crossed with. The
 * two clocks are independent — `render/creatures.ts` offsets the wobble by
 * `spread * 5.4` seconds and the pose by `poseClock` — so a body meets every
 * combination of the two eventually, and the spacing is deliberately not a
 * neat fraction of any wobble layer.
 */
const CONTOUR_SAMPLES = 12;
const CONTOUR_SPACING = 2.71;

/** Harmonics searched for the lobe count. Nothing living has more than nine. */
const MAX_HARMONIC = 12;

function span(values: number[]): Span {
  return { lo: Math.min(...values), hi: Math.max(...values) };
}

/** Two closed intervals share at least a point. */
export function overlaps(a: Span, b: Span): boolean {
  return a.lo <= b.hi && b.lo <= a.hi;
}

/**
 * The lobe count a contour actually has, as drawn.
 *
 * Not `silhouette.lobes` — that is a number somebody typed, and the whole
 * question is whether it survives being drawn. The radius is read off the
 * posed points and decomposed by angle; the strongest harmonic at or above 2
 * is what the shape reads as. Below 2 is not a lobe count, it is a body
 * sitting off its own centre.
 *
 * This is why the axis answers to the pose at all. A non-uniform scale is a
 * second harmonic added to the profile, and a round body squashed far enough
 * holds more energy in "ellipse" than in "nine bumps" — at which point it has
 * stopped reading as the knobbly one whatever `silhouettes.ts` says. That is
 * the failure `docs/alive.md` refused `BULB.wobble` 0.075 for, arriving
 * through the pose instead of through the contour.
 */
function dominantHarmonic(radii: number[]): number {
  const n = radii.length;
  let best = 2;
  let bestEnergy = -1;
  for (let k = 2; k <= MAX_HARMONIC; k++) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 * k;
      re += radii[i]! * Math.cos(a);
      im += radii[i]! * Math.sin(a);
    }
    const energy = re * re + im * im;
    if (energy > bestEnergy) {
      bestEnergy = energy;
      best = k;
    }
  }
  return best;
}

/**
 * Where a living kind sits on the three axes, across everything its own motion
 * and its own wobble do to it.
 *
 * The contour is sampled through `blob`, so the numbers come out of the same
 * `hullRadiusMul` the sheet draws and the game strokes — a lobe measured here
 * cannot mean something the contour does not.
 *
 * `poseAt` overrides the kind's own motion, which is how the test proves the
 * gate has teeth: it widens one amplitude past its cap and watches a pair
 * collide. Nothing in the game passes it.
 */
export function nameability(kind: CreatureKind, poseAt?: (t: Beats) => Pose): Nameability {
  const shape = livingSilhouette(kind);
  const subject = blob(kind.toUpperCase(), shape);
  const pose = poseAt ?? livingMotion(kind).poseAt;
  const swells = kind === "throb" ? [THROB_SWELL.shut, THROB_SWELL.open] : [1];
  // The fixed footprint every living body is drawn at, times the one static
  // multiplier content owns: the Runt's `sizeMul`, its whole "tiny".
  const footprint = (REFERENCE_BODY_PX / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1);

  const aspects: number[] = [];
  const lobes: number[] = [];
  const sizes: number[] = [];

  for (let c = 0; c < CONTOUR_SAMPLES; c++) {
    const pts = subject.pointsAt(c * CONTOUR_SPACING);
    for (let t = 0; t <= POSE_WINDOW; t += POSE_STEP) {
      const { rot, sx, sy } = pose(beats(t));
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const radii: number[] = [];
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (const p of pts) {
        const px = p.x * sx;
        const py = p.y * sy;
        // A rotation cannot change a radius, so the lobe profile is read
        // before it and the bounding box after it.
        radii.push(Math.hypot(px, py));
        const rx = px * cos - py * sin;
        const ry = px * sin + py * cos;
        if (rx < x0) x0 = rx;
        if (rx > x1) x1 = rx;
        if (ry < y0) y0 = ry;
        if (ry > y1) y1 = ry;
      }
      const w = x1 - x0;
      const h = y1 - y0;
      aspects.push(w / h);
      lobes.push(dominantHarmonic(radii));
      for (const swell of swells) sizes.push(Math.sqrt(w * h) * footprint * swell);
    }
  }

  return { aspect: span(aspects), lobe: span(lobes), size: span(sizes) };
}

/**
 * Two kinds are confusable only when they overlap on **all three** axes.
 *
 * One axis is not a gate. A kind the same width and the same size as another
 * but visibly lumpier is still a different word out loud, and "the little one"
 * separates the Runt from everything however round it stays.
 */
export function confusable(a: Nameability, b: Nameability): boolean {
  return overlaps(a.aspect, b.aspect) && overlaps(a.lobe, b.lobe) && overlaps(a.size, b.size);
}
