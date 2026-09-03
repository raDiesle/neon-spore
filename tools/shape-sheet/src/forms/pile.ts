import type { Point } from "@neon-spore/content";
import { sinHash } from "@neon-spore/render";
import { linePath, type Subject } from "../contour.js";
import { isoLoops, resampleAll } from "../iso.js";

/**
 * A pile of faceted units, traced the way `cluster` traces round ones.
 *
 * Filed beside it rather than in it: the two share the machinery — a scalar
 * field walked on a grid by `isoLoops` — and disagree about everything the
 * field is made of. `cluster` sums round metaballs and blooms; this sums
 * polygons and creases. That disagreement is the shape, so it is worth a file.
 */

export interface PileOpts {
  /** How many units. Seven or so: enough to be a pile, few enough to count. */
  units: number;
  /** Circumradius of the median unit. Each one varies around it. */
  radius: number;
  /** Facets per unit. Five and six read as rock; many more reads as round. */
  sides: number;
  /** Which arrangement of sizes and jitter — the pile's seed, not a creature's. */
  seed: number;
  /** One unit dragged clear, in radii. Absent while the pile is stacked. */
  pull?: { unit: number; dx: number; dy: number };
}

interface Unit {
  x: number;
  y: number;
  /** Circumradius — corner to centre. Only the bounding box needs it. */
  r: number;
  /** Inradius — facet to centre, which is what the field is written in. */
  inner: number;
  /** Outward facet normals, precomputed once a frame rather than per cell. */
  nx: number[];
  ny: number[];
}

/** Points a traced pile keeps. Dense, because `linePath` draws every corner. */
const FACET_POINTS = 192;

/**
 * The widest course at the bottom and one on top — the arrangement that reads
 * as *stacked* rather than as a heap, which is the whole job of the shape.
 *
 * Seven comes out three, three and one, so the courses line up vertically and
 * a unit's neighbour above is directly above it. That is worth having: it
 * makes the vertical spacing a distance between two known units rather than a
 * diagonal between whichever two happen to be nearest.
 */
function courses(units: number): number[] {
  const rows: number[] = [];
  let left = units;
  let width = Math.max(2, Math.round(units / 2.4));
  while (left > 0) {
    const n = Math.min(width, left);
    rows.push(n);
    left -= n;
    if (left < width) width = left;
  }
  return rows;
}

/**
 * How far two neighbouring units are driven into each other, as a fraction of
 * the reach they would need in order to just touch. It is the seam depth, and
 * the seam is the whole shape: at zero the pile falls apart, and much past a
 * fifth the rocks swallow each other and it draws one lumpy boulder — which is
 * what the first two attempts here did.
 *
 * Sideways is where the counting happens, so it is bitten less than the
 * courses are. Nothing else in this form is a matter of taste; these two are.
 */
const BITE_ACROSS = 0.16;
const BITE_UP = 0.2;

function unitsAt(o: PileOpts, t: number): Unit[] {
  const rows = courses(o.units);
  const inner = (r: number) => r * Math.cos(Math.PI / o.sides);
  const radii: number[] = [];
  for (let i = 0; i < o.units; i++) {
    radii.push(o.radius * (0.82 + 0.36 * sinHash(o.seed, i, 3)));
  }

  // Spacing is derived from the units' own reach rather than laid on a grid,
  // so an overlap is guaranteed by construction instead of by a spacing that
  // happens to be tight enough for the sizes this seed drew. The field below
  // is very nearly a maximum, which makes "overlapping" and "joined" the same
  // word — so this is the difference between a pile and a pile with a rock
  // quietly adrift at some moment nobody sampled.
  const first: number[] = [];
  let at = 0;
  for (const n of rows) {
    first.push(at);
    at += n;
  }
  const rowY: number[] = [0];
  for (let r = 1; r < rows.length; r++) {
    // The smallest unit in each course, so every aligned pair overlaps and not
    // merely the average one.
    const below = Math.min(
      ...radii.slice(first[r - 1], (first[r - 1] as number) + (rows[r - 1] as number)),
    );
    const above = Math.min(...radii.slice(first[r], (first[r] as number) + (rows[r] as number)));
    rowY.push((rowY[r - 1] as number) - (inner(below) + inner(above)) * (1 - BITE_UP));
  }
  const lift = ((rowY[0] as number) + (rowY[rows.length - 1] as number)) / 2;

  const out: Unit[] = [];
  for (let r = 0; r < rows.length; r++) {
    const n = rows[r] as number;
    const base = first[r] as number;
    const xs: number[] = [0];
    for (let j = 1; j < n; j++) {
      const gap =
        (inner(radii[base + j - 1] as number) + inner(radii[base + j] as number)) *
        (1 - BITE_ACROSS);
      xs.push((xs[j - 1] as number) + gap);
    }
    const centre = ((xs[0] as number) + (xs[n - 1] as number)) / 2;
    for (let j = 0; j < n; j++) {
      const i = base + j;
      const radius = radii[i] as number;
      // Screen y grows downward, so course 0 — the widest — sits at the bottom.
      const x = (xs[j] as number) - centre + (sinHash(o.seed, i, 1) - 0.5) * o.radius * 0.1;
      const y = (rowY[r] as number) - lift + (sinHash(o.seed, i, 2) - 0.5) * o.radius * 0.08;
      // A pile settles, it does not breathe: a small slow shift per unit, out
      // of step with its neighbours, so the seams work against each other
      // instead of the whole thing pulsing like one body.
      const drift = { x: Math.sin(t * 1.7 + i * 2.1), y: Math.cos(t * 1.3 + i * 1.7) };
      const pull = o.pull?.unit === i ? o.pull : null;
      const spin = sinHash(o.seed, i, 4) * Math.PI * 2 + Math.sin(t * 0.4 + i) * 0.05;
      const step = (Math.PI * 2) / o.sides;
      const nx: number[] = [];
      const ny: number[] = [];
      for (let k = 0; k < o.sides; k++) {
        // A facet's outward normal sits half a step round from a corner.
        const a = spin + step / 2 + k * step;
        nx.push(Math.cos(a));
        ny.push(Math.sin(a));
      }
      out.push({
        x: x + drift.x * o.radius * 0.016 + (pull ? pull.dx * o.radius : 0),
        y: y + drift.y * o.radius * 0.016 + (pull ? pull.dy * o.radius : 0),
        r: radius,
        inner: inner(radius),
        nx,
        ny,
      });
    }
  }
  return out;
}

/**
 * A pile of faceted units held in one outline: `cluster`'s trick over rocks
 * instead of over bodies.
 *
 * Same machinery, one substitution. `cluster` sums `r²/d²` around round
 * centres, so its contour is a metaball and everything it draws is a bloom.
 * Here each unit contributes its own *polygon* raised to `SHARP`, so the sum
 * behaves almost like a maximum: a unit's boundary is its facets, and where
 * two units overlap the outline creases instead of bulging. The seams survive
 * into the silhouette, which is what lets the eye count the units — and
 * counting them is the fight, since each one is a rock waiting to be pulled.
 *
 * Traced by `isoLoops` for the reason `cluster` is: a unit dragged clear has
 * to become its own loop, and a radial march has one answer per angle.
 */
export function pile(name: string, note: string, o: PileOpts): Subject {
  const loopsAt = (t: number): Point[][] => {
    const units = unitsAt(o, t);
    const field = (x: number, y: number): number => {
      let f = 0;
      for (const u of units) {
        const dx = x - u.x;
        const dy = y - u.y;
        // A regular polygon is the intersection of its facet half-planes, so
        // the ratio the field wants — how far out this point is, as a
        // fraction of the polygon's own reach in that direction — is the
        // largest of the facet dot products, with no angle taken at all. It
        // is exactly the radial function, and it costs seven multiplies
        // instead of an `atan2` on every unit of every cell of the grid.
        let m = -Infinity;
        for (let k = 0; k < u.nx.length; k++) {
          const v = dx * (u.nx[k] as number) + dy * (u.ny[k] as number);
          if (v > m) m = v;
        }
        // Clamped well inside the unit: unclamped, the centre is a division
        // by zero raised to the twentieth, which is not a number.
        const q = u.inner / Math.max(m, u.inner * 0.05);
        // Twentieth power, unrolled. A metaball uses two, which is what makes
        // `cluster` bulge smoothly where two bodies meet. Six was the first
        // guess here and it drew a lumpy boulder: high enough to dent the
        // outline, nowhere near high enough to keep a facet straight. At
        // twenty the sum is close enough to a plain maximum that the union is
        // very nearly the union of the polygons themselves — straight edges,
        // and a sharp reflex corner everywhere two rocks cross. That corner is
        // the seam, and the seams are how the pile is counted.
        //
        // Unrolled rather than called: this runs some hundred thousand times a
        // frame and `**` shows up in the profile at that rate.
        const q2 = q * q;
        const q4 = q2 * q2;
        const q8 = q4 * q4;
        f += q8 * q8 * q4;
      }
      return f;
    };
    let x0 = 0;
    let x1 = 0;
    let y0 = 0;
    let y1 = 0;
    for (const u of units) {
      x0 = Math.min(x0, u.x - u.r);
      x1 = Math.max(x1, u.x + u.r);
      y0 = Math.min(y0, u.y - u.r);
      y1 = Math.max(y1, u.y + u.r);
    }
    const pad = o.radius * 0.5;
    const box = { x0: x0 - pad, x1: x1 + pad, y0: y0 - pad, y1: y1 + pad };
    // Finer than the default grid: a seam is a notch a fraction of a unit
    // wide, and a grid that steps over it draws the pile as one boulder.
    return resampleAll(isoLoops(field, box, 1, 112), FACET_POINTS);
  };

  return {
    name,
    note,
    open: false,
    loopsAt,
    pointsAt: (t) => loopsAt(t).flat(),
    path: linePath,
  };
}
