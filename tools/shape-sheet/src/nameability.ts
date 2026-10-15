import {
  type Beats,
  beats,
  type CreatureSilhouette,
  livingMotion,
  livingSilhouette,
  type Pose,
} from "@neon-spore/content";
import { type CreatureKind, DEFAULT_CONFIG } from "@neon-spore/sim";
import {
  type AxisSamples,
  type GlanceReach,
  measurePosed,
  NO_GLANCE,
} from "./nameability-glance.js";
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

function span(values: number[]): Span {
  // A loop, not a spread: a body turned every way gives more samples than a call takes arguments.
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of values) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return { lo, hi };
}

/** Two closed intervals share at least a point. */
export function overlaps(a: Span, b: Span): boolean {
  return a.lo <= b.hi && b.lo <= a.hi;
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
 * collide. Nothing in the game passes it. `glance` turns the body through
 * every swing and roll a glance of that size gives it (`nameability-glance.ts`).
 */
export function nameability(
  kind: CreatureKind,
  poseAt?: (t: Beats) => Pose,
  glance: GlanceReach = NO_GLANCE,
): Nameability {
  return nameabilityOf(
    kind.toUpperCase(),
    livingSilhouette(kind),
    poseAt ?? livingMotion(kind).poseAt,
    glance,
  );
}

/**
 * The same three axes, measured on a silhouette that is not a shipped kind.
 *
 * `nameability` reads its shape out of `livingSilhouette`, which is the right
 * door for anything in the game and the wrong one for a **candidate**: a
 * second answer to an outline exists as a patch held over that record for the
 * length of one `draw()`, so the one question worth asking about it before a
 * vote — is it still its own word beside its neighbours — could not be asked
 * at all (`candidates.ts`).
 */
export function nameabilityOf(
  name: string,
  shape: CreatureSilhouette,
  pose: (t: Beats) => Pose,
  glance: GlanceReach = NO_GLANCE,
): Nameability {
  const subject = blob(name, shape);
  // The fixed footprint every living body is drawn at, times the one static
  // multiplier content owns: the Runt's `sizeMul`, its whole "tiny".
  const footprint = (REFERENCE_BODY_PX / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1);

  const out: AxisSamples = { aspects: [], lobes: [], sizes: [] };
  for (let c = 0; c < CONTOUR_SAMPLES; c++) {
    const pts = subject.pointsAt(c * CONTOUR_SPACING);
    for (let t = 0; t <= POSE_WINDOW; t += POSE_STEP) {
      measurePosed(pts, pose(beats(t)), glance, footprint, out);
    }
  }
  const { aspects, lobes, sizes } = out;

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
