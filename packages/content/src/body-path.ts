import { blobRadiusMul, catmullRomToBezierPath, type Point } from "./shapes.js";
import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * The contour of one living body, and the one call every site that draws one
 * makes.
 *
 * Every body on the field used to be `blobPath(0, 0, shape.rx, shape.ry, …)`
 * written out at each of the eight places that draw a creature — the field,
 * the strips, the control glyphs, the dart's previewed path, a rind shedding a
 * layer, a veil tearing. That was one shape family and one call, so the
 * repetition cost nothing. It stopped being one family the day THE THROB grew
 * a rim of clubs: eight copies of "a body is a blob" is eight places that draw
 * a throb as a plain ball, and seven of them are exactly the small pictures a
 * player checks a body's name against.
 *
 * So the family lives here. `livingPath` asks the silhouette what it is and
 * nothing else has to know (`packages/sim/test/purity.test.ts` carries the row).
 */

/**
 * A rim of balls on stalks, as `CreatureSilhouette.clubs`.
 *
 * Claimed out of the shape catalogue: `tools/shape-sheet/src/forms/clubbed.ts`
 * drew THE POMMEL with this walk while it was a picture with no behaviour, and
 * `docs/asset-catalogue.md` says what claiming one means — the parameters move
 * into `packages/content` and the tool reads the same copy. So the sheet and
 * the field walk one outline, and THE POMMEL and THE THROB are two tunings of
 * it rather than two shapes that resemble each other.
 */
export interface ClubbedRim {
  /** How many clubs stand round the rim. */
  clubs: number;
  /**
   * How far past the rim a cap's centre sits, as a fraction of the body's
   * radius **at that angle**. Against the local radius and not an average:
   * on an ellipse the average is under the long radius, so half the caps would
   * land inside the rim and the walk would fold over itself.
   */
  reach: number;
  /** Cap radius, as a fraction of the body radius at that angle. */
  cap: number;
  /** Neck half-width, as a fraction of the cap radius. Under 1 or it is a lobe. */
  neck: number;
  /** How much reach and cap size differ club to club, 0..1. */
  vary?: number;
}

/** Samples along the body between two clubs. */
const BODY_STEPS = 7;
/** Samples around one cap. Few enough to be cheap, many enough to be round. */
const CAP_STEPS = 22;
/**
 * Samples along one side of a neck.
 *
 * Not decoration. Catmull-Rom sets a point's tangent from its neighbours, so a
 * rim point whose only neighbours are another rim point and a cap point half a
 * body away leaves along the *rim's* direction — and every stalk came out bent
 * the same way round, which reads as a body that has been combed.
 */
const NECK_STEPS = 3;

/**
 * Two fixed offsets per club, so the ring is uneven and never redrawn.
 *
 * The clamp is not a taste. A cap whose centre sits nearer the rim than its own
 * radius reaches back *inside* the body, and the walk — which goes all the way
 * round the cap — then crosses the rim twice and comes out as a barb hanging
 * off a broken outline. `reach` and `cap` vary independently, so without this
 * every few clubs on every body would tear.
 */
function jitter(rim: ClubbedRim, seed: number, i: number): { reach: number; cap: number } {
  const vary = rim.vary ?? 0.18;
  const a = Math.sin(i * 2.399 + seed);
  const b = Math.sin(i * 4.113 + seed * 1.7);
  const cap = rim.cap * (1 + b * vary * 0.9);
  return { reach: Math.max(rim.reach * (1 + a * vary), cap), cap };
}

/**
 * The outline of a body wearing clubs, **walked** rather than sampled by angle.
 *
 * A radius function keeps one radius per angle and a club has two — the near
 * side of the ball and the far one — so the neck is the one part it cannot
 * hold: the stalks vanish, the caps flatten into lobes, and the body reads as a
 * sea urchin. That is the defect that retired THE BURR, and it is under the
 * waist rather than under the tip, so no amount of rounding reaches it.
 *
 * The walk leaves the rim at one side of a neck, runs out to the cap, goes
 * almost the whole way round it — everything the neck does not hide — and comes
 * back down the other side.
 */
export function clubbedPoints(shape: CreatureSilhouette, rim: ClubbedRim, t: number): Point[] {
  const pts: Point[] = [];
  const step = (Math.PI * 2) / rim.clubs;

  /** The body's own radius at one angle, lobed and breathing. */
  const bodyAt = (a: number): Point => {
    const m = blobRadiusMul(a, shape.lobes, shape.depth, shape.wobble, t, shape.seed);
    return { x: Math.cos(a) * shape.rx * m, y: Math.sin(a) * shape.ry * m };
  };

  for (let i = 0; i < rim.clubs; i++) {
    const axis = i * step - Math.PI / 2;
    const j = jitter(rim, shape.seed, i);
    // Each club breathes on its own slightly longer period, so the rim is never
    // a ring that pulses together — and every period here is several seconds
    // against a beat of well under one, so nothing about this can be read as
    // the body saying *now*.
    const own = 5 + (i % 5) * 0.6;
    const breath = 0.9 + 0.1 * Math.sin((t / own) * Math.PI * 2 + i * 1.3);

    // The rim under this club, and everything sized against it.
    const seat = bodyAt(axis);
    const local = Math.hypot(seat.x, seat.y);
    const cr = j.cap * local * breath;
    const w = Math.min(cr * rim.neck, cr * 0.92);

    // Where the neck leaves the rim, and where it meets the cap. Both are
    // half-angles of the same half-width, read against different radii.
    const atBody = Math.asin(Math.min(0.9, w / local));
    const atCap = Math.asin(w / cr);

    // The body, from the previous club's far side to this one's near side.
    const from = axis - step + atBody;
    const to = axis - atBody;
    for (let k = 0; k <= BODY_STEPS; k++) {
      pts.push(bodyAt(from + ((to - from) * k) / BODY_STEPS));
    }

    const out = 1 + j.reach * breath;
    const cx = seat.x * out;
    const cy = seat.y * out;
    // Almost the whole cap: everything the neck does not cover, walked in the
    // same direction as the body so the contour never doubles back.
    const start = axis - Math.PI + atCap;
    const sweep = Math.PI * 2 - 2 * atCap;
    const on = (phi: number): Point => ({
      x: cx + Math.cos(phi) * cr,
      y: cy + Math.sin(phi) * cr,
    });

    const up = pts[pts.length - 1] as Point;
    const foot = on(start);
    for (let k = 1; k < NECK_STEPS; k++) {
      const f = k / NECK_STEPS;
      pts.push({ x: up.x + (foot.x - up.x) * f, y: up.y + (foot.y - up.y) * f });
    }
    for (let k = 0; k <= CAP_STEPS; k++) pts.push(on(start + (sweep * k) / CAP_STEPS));
    // Back down the far side. The rim point itself is left to the next club's
    // body walk, which starts at exactly `axis + atBody`.
    const down = on(start + sweep);
    const land = bodyAt(axis + atBody);
    for (let k = 1; k < NECK_STEPS; k++) {
      const f = k / NECK_STEPS;
      pts.push({ x: down.x + (land.x - down.x) * f, y: down.y + (land.y - down.y) * f });
    }
  }
  return pts;
}

/**
 * The points of one living body's contour at time `t`, centred on the origin
 * and at the silhouette's own `rx`/`ry` — `sizeMul` is deliberately not applied,
 * because every draw site folds it into a scale it is setting anyway.
 *
 * `n` is how many samples a plain blob takes and is ignored by a clubbed rim,
 * which is walked rather than sampled: how many points a club needs is a fact
 * about the club, not about the caller.
 */
export function livingPoints(shape: CreatureSilhouette, t: number, n = 40): Point[] {
  if (shape.clubs) return clubbedPoints(shape, shape.clubs, t);
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = blobRadiusMul(a, shape.lobes, shape.depth, shape.wobble, t, shape.seed);
    pts.push({ x: Math.cos(a) * shape.rx * m, y: Math.sin(a) * shape.ry * m });
  }
  return pts;
}

/**
 * How many features an eye counts round this body's rim — the number the pair
 * would say out loud, and the number `tools/shape-sheet`'s lobe axis measures.
 *
 * Its clubs where it wears them, and its lobes otherwise. A clubbed body's
 * `lobes` describes the *core*, which is under the rim and invisible: the throb
 * is authored with three of them and nobody will ever count three of anything
 * on it. Read through here rather than off `lobes`, or a gate meant to hold two
 * bodies apart is checking a number that is not on the screen.
 */
export function rimCount(shape: CreatureSilhouette): number {
  return shape.clubs?.clubs ?? shape.lobes;
}

/** The same contour as an SVG path string, which is what a canvas wants. */
export function livingPath(shape: CreatureSilhouette, t: number, n = 40): string {
  return catmullRomToBezierPath(livingPoints(shape, t, n));
}
