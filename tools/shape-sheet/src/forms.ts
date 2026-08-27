import {
  blobRadiusMul,
  catmullRomToBezierPath,
  openSmoothPath,
  type Point,
} from "@neon-spore/content";
import type { Subject } from "./contour.js";
import { isoLoops, resampleAll } from "./iso.js";

/**
 * Contour forms the game does not have yet.
 *
 * `subjects.ts` can build two kinds of shape: a lobed blob and a faceted
 * crystal, because those are the two the game draws. Several of the ideas in
 * `docs/spec/ideas.md` are not describable as either — THE CHOIR is three
 * bodies that merge, THE WEIGHT hangs off a stalk, THE CONDUCTOR is an arm
 * rather than a body — and a draft drawn as "a blob, but imagine it merging"
 * is not a draft of anything.
 *
 * So these are generators, in the tool rather than in `packages/content`, on
 * the same rule the free contours follow: content is what the game ships, and
 * a form nothing carries is not content yet.
 *
 * Every one of them samples through `blobRadiusMul` wherever it can, so a
 * draft breathes with the same three wobble layers the built shapes do and can
 * be judged against them on equal terms.
 */

const N = 64;

/**
 * A sac: a blob with its mass pulled downward, hanging rather than floating.
 * `bias` 0 is an ordinary blob; 0.5 is a teardrop with a narrow top.
 *
 * Screen y grows downward, so the widening is at `sin(a) > 0` — the bottom.
 */
export function sac(name: string, note: string, bias: number, rx: number, ry: number): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const m = blobRadiusMul(a, 2, 0.1, 0.05, t, 1.7) * (1 + bias * Math.sin(a));
        pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

export interface ClusterOpts {
  /** How many bodies. Two reads as a pair, three as a chorus. */
  bodies: number;
  /** Radius of one body. */
  radius: number;
  /** How far apart they sit at their widest, as a multiple of `radius`. */
  spread: number;
  /** Seconds for one apart-and-back-together cycle. */
  period: number;
  /** How close together they get: 0 is fully merged, 1 never merges. */
  floor: number;
}

/**
 * Several bodies inside one membrane, drifting apart and coming back together.
 *
 * The outline is a metaball field — each body contributes `r²/d²`, and the
 * contour is where the sum crosses 1 — traced by `isoLoops` rather than
 * marched radially from the middle. That is the whole difference: a radial
 * march has one answer per angle and so can only ever return one ring, which
 * is why this used to thin to a waist and stop. Traced on a grid, the bodies
 * separate when the field between them says they have, into as many loops as
 * there are bodies, and merge back the same way. Symbiosis and The Choir both
 * hang their mechanic on that instant being visible.
 *
 * The bodies breathe slightly out of step with each other, which is what keeps
 * a merged cluster from reading as one rigid blob with a dent in it.
 */
export function cluster(name: string, note: string, o: ClusterOpts): Subject {
  const centresAt = (t: number): Point[] => {
    // A raised cosine: apart for most of the cycle, together briefly. The
    // merged instant is the rare one, which is what makes it an event.
    const phase = (1 - Math.cos((t / o.period) * Math.PI * 2)) / 2;
    const apart = o.radius * o.spread * (o.floor + (1 - o.floor) * phase);
    const centres: Point[] = [];
    for (let i = 0; i < o.bodies; i++) {
      const a = (i / o.bodies) * Math.PI * 2 + t * 0.21;
      centres.push({ x: Math.cos(a) * apart, y: Math.sin(a) * apart * 0.7 });
    }
    return centres;
  };

  const loopsAt = (t: number): Point[][] => {
    const centres = centresAt(t);
    const radii = centres.map((_, i) => o.radius * (1 + 0.05 * Math.sin(t * 1.4 + i * 2.3)));
    const field = (x: number, y: number): number => {
      let f = 0;
      for (let i = 0; i < centres.length; i++) {
        const c = centres[i]!;
        const r = radii[i]!;
        f += (r * r) / Math.max((x - c.x) ** 2 + (y - c.y) ** 2, 1);
      }
      return f;
    };
    // A body's own isosurface sits at `r`, so a margin of two radii clears the
    // widest a merged pair ever bulges and costs a grid this size nothing.
    let reach = 0;
    for (const c of centres) reach = Math.max(reach, Math.hypot(c.x, c.y));
    const half = reach + o.radius * 2;
    const box = { x0: -half, x1: half, y0: -half, y1: half };
    return resampleAll(isoLoops(field, box), N);
  };

  return {
    name,
    note,
    open: false,
    loopsAt,
    pointsAt: (t) => loopsAt(t).flat(),
    path: catmullRomToBezierPath,
  };
}

/**
 * An arm: an open, tapering contour hung from a pivot at the top of the frame.
 *
 * Open on purpose — a body has an inside and this does not, which is the whole
 * reason `docs/spec/ideas.md` describes THE CONDUCTOR as a sweep rather than a
 * creature. The taper is drawn as a single stroke; the thickness a real one
 * needs is a stroke width, not a second edge.
 */
export function arm(name: string, note: string, length: number, curve: number): Subject {
  return {
    name,
    open: true,
    note,
    pointsAt(t) {
      const pts: Point[] = [];
      const steps = 28;
      for (let i = 0; i <= steps; i++) {
        const f = i / steps;
        // The bend runs down the arm and lags at the tip, so it whips.
        const bend = Math.sin(t * 0.9 - f * 1.4) * curve * f * f;
        pts.push({ x: Math.sin(bend) * length * f, y: -length / 2 + Math.cos(bend) * length * f });
      }
      return pts;
    },
    path: openSmoothPath,
  };
}

/**
 * A slab: a superellipse, flat-sided and square-shouldered. The one form here
 * that does not read as grown — a made thing, for the ideas that are about a
 * rule rather than an animal.
 */
export function slab(name: string, note: string, rx: number, ry: number, power: number): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        // Superellipse in polar form: the exponent squares off the corners.
        const r = (Math.abs(c) ** power + Math.abs(s) ** power) ** (-1 / power);
        const breath = 1 + 0.02 * Math.sin(t * 0.7);
        pts.push({ x: c * r * rx * breath, y: s * r * ry * breath });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

/**
 * A body whose edge carries a band of notches that travel around it.
 *
 * The pattern is cut into the silhouette rather than drawn inside it, because
 * the outline is all a player has at 26 px — an inner texture is a detail on a
 * phone, and a notched rim is a shape. `march` is how fast the band scrolls;
 * it is the tell for anything whose state is a code rather than a health bar.
 */
export function glyphed(
  name: string,
  note: string,
  rx: number,
  ry: number,
  teeth: number,
  march: number,
): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        // Sharpened so the notches read as cut rather than as a gentle lobing.
        const wave = Math.tanh(Math.sin(teeth * a - t * march) * 2.2);
        const m = blobRadiusMul(a, 1, 0.04, 0.02, t, 4.3) * (1 + 0.11 * wave);
        pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}
