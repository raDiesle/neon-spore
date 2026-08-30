import { blobRadiusMul, catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { Subject } from "../contour.js";

/**
 * A body wearing balls on stalks: a thin neck out of the rim, ending in a cap
 * wider than the neck that carries it.
 *
 * **Why this cannot be `studded`.** That form samples one radius per angle,
 * which is the right machinery for a knob, a spine or a hair and cannot
 * describe this one at all. A club is wider at its tip than at its waist, so
 * over the angular range the cap subtends there are two radii — the near side
 * of the ball and the far one — and a radius function keeps only the far. What
 * comes back is a cone: the neck vanishes, the cap becomes a lobe, and the body
 * reads as a sea urchin. That is exactly what the first conversion of the
 * Galaxy Defense boss produced, and no amount of `blunt` could fix it, because
 * blunting rounds a tip and the defect was the waist.
 *
 * So the outline is **walked**, on the reasoning `walked.ts` already sets out:
 * some shapes are a rule about an edge rather than a function of angle. The
 * walk leaves the rim at one side of a neck, runs out to the cap, goes almost
 * the whole way round it — everything the neck does not hide — and comes back
 * down the other side.
 *
 * **The clubs vary, and are not random.** `vary` spreads reach and cap size
 * around the ring by a fixed pattern derived from the index, so a body is the
 * same on every reload and two bodies with different `seed`s are not the same
 * body. A ring of identical clubs reads as a cog; the source's do not match
 * each other, and that mismatch is most of why it reads as grown.
 */
export interface ClubbedOpts {
  rx: number;
  ry: number;
  /** How many clubs stand round the rim. */
  clubs: number;
  /**
   * How far past the rim a cap's centre sits, as a fraction of the body's
   * radius **at that angle**.
   *
   * Measured against the local radius rather than an averaged one, which the
   * first draft did and which broke every club on any body that is not a
   * circle: on an ellipse the average is smaller than the long radius, so half
   * the caps landed inside the rim and the walk folded over itself.
   */
  reach: number;
  /** Cap radius, as a fraction of the body radius at that angle. */
  cap: number;
  /** Neck half-width, as a fraction of the cap radius. Under 1 or it is a lobe. */
  neck: number;
  /** How much reach and cap size differ club to club, 0..1. */
  vary?: number;
  /** Lobing of the body under the clubs. */
  lobes?: number;
  depth?: number;
  seed?: number;
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
 * the same way round, which reads as a body that has been combed. Three points
 * up the stalk give the curve something to be straight along.
 */
const NECK_STEPS = 3;

export function clubbed(name: string, note: string, o: ClubbedOpts): Subject {
  const vary = o.vary ?? 0.18;
  const seed = o.seed ?? 3.7;
  const lobes = o.lobes ?? 4;
  const depth = o.depth ?? 0.05;

  /**
   * Two fixed offsets per club, so the ring is uneven and never redrawn.
   *
   * The clamp is not a taste. A cap whose centre sits nearer the rim than its
   * own radius reaches back *inside* the body, and the walk — which goes all
   * the way round the cap — then crosses the rim twice and comes out as a barb
   * hanging off a broken outline. `reach` and `cap` vary independently, so
   * without this every few clubs on every body would tear. At the floor the
   * ball sits exactly on the rim with no stalk showing, which is the look the
   * source has most of; a longer `reach` is what lifts one off.
   */
  function jitter(i: number): { reach: number; cap: number } {
    const a = Math.sin(i * 2.399 + seed);
    const b = Math.sin(i * 4.113 + seed * 1.7);
    const cap = o.cap * (1 + b * vary * 0.9);
    return { reach: Math.max(o.reach * (1 + a * vary), cap), cap };
  }

  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      const step = (Math.PI * 2) / o.clubs;

      /** The body's own radius at one angle, lobed and breathing. */
      const bodyAt = (a: number): Point => {
        const m = blobRadiusMul(a, lobes, depth, 0.025, t, seed);
        return { x: Math.cos(a) * o.rx * m, y: Math.sin(a) * o.ry * m };
      };

      for (let i = 0; i < o.clubs; i++) {
        const axis = i * step - Math.PI / 2;
        const j = jitter(i);
        // Each club breathes on its own slightly longer period, so the rim is
        // never a ring that pulses together — `studded.ts`'s reasoning, and the
        // same arithmetic, because it is the same claim about a rim.
        const own = 5 + (i % 5) * 0.6;
        const breath = 0.9 + 0.1 * Math.sin((t / own) * Math.PI * 2 + i * 1.3);

        // The rim under this club, and everything sized against it.
        const seat = bodyAt(axis);
        const local = Math.hypot(seat.x, seat.y);
        const cr = j.cap * local * breath;
        const w = Math.min(cr * o.neck, cr * 0.92);

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
        // Almost the whole cap: everything the neck does not cover, walked in
        // the same direction as the body so the contour never doubles back.
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
        for (let k = 0; k <= CAP_STEPS; k++) {
          pts.push(on(start + (sweep * k) / CAP_STEPS));
        }
        // Back down the far side. The rim point itself is left to the next
        // club's body walk, which starts at exactly `axis + atBody`.
        const down = on(start + sweep);
        const land = bodyAt(axis + atBody);
        for (let k = 1; k < NECK_STEPS; k++) {
          const f = k / NECK_STEPS;
          pts.push({ x: down.x + (land.x - down.x) * f, y: down.y + (land.y - down.y) * f });
        }
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}
