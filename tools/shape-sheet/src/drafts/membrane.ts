import { bumpAdd, openSmoothPath, type Point } from "@neon-spore/content";
import { smoothstep } from "@neon-spore/render";
import type { Subject } from "../contour.js";
import { hull, hullArc } from "../hull-subjects.js";

/**
 * A window on the ship's own skin, with one column of it changed.
 *
 * Four of the ideas that still had no picture turn out to be the same drawing
 * problem: **the ship has to say something about a column**. A breach is a
 * column that gave way, a patch is the same column held shut, THE OTHER HAND is
 * a column where the partner's thumb is down, and a handover is two columns
 * trading what they carry. None of them is a body — every one is a mark on the
 * membrane — so they get one generator and four features rather than four
 * outlines that would have to be compared across four sets of parameters.
 *
 * It sits in `drafts/` rather than in `forms/` because a lane running beside
 * this one owns that directory this evening. If these survive review the file
 * belongs there, under the seam `radial` and `walked` already draw: an edge
 * treatment rather than a body.
 *
 * The base points come from `hullArc`, not from a second copy of the hull's
 * proportions — the card has to be measurable against HULL · PASSIVE on the
 * same page, and a shape sheet whose ship is 4 % taller than the ship is a
 * sheet answering a question nobody asked. `COLUMN` is derived the same way,
 * off the width the drawn hull actually has.
 */

function width(pts: Point[]): number {
  let x0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  for (const p of pts) {
    if (p.x < x0) x0 = p.x;
    if (p.x > x1) x1 = p.x;
  }
  return x1 - x0;
}

/**
 * One column, in the same pixels the sheet draws the hull in.
 *
 * Measured off `hull(false)` and divided by the eleven columns of the field,
 * because every feature here is *one column wide* and that is the whole claim.
 * A number typed in here instead would be a second opinion about how wide a
 * column is, and the first thing to drift the day the illustrative hull is
 * re-proportioned.
 */
export const COLUMN = width(hull(false).pointsAt(0)) / 11;

/** How far the membrane is displaced at `dx` px from the feature's centre. */
export type Feature = (dx: number, t: number) => number;

export interface SpanOpts {
  /** Half the span drawn, as a fraction of the hull's own arc. */
  halfArc: number;
  /** Where the feature sits, in columns from the middle of the span. */
  at: number;
  /** What the feature does to the surface. Positive is up, away from the field. */
  lift: Feature;
  /** Half-width of a hole cut clean through the skin, in px. Omit for none. */
  gap?: number;
}

/**
 * A span of hull with one feature on it.
 *
 * `gap` is the one option that changes what kind of thing the card is rather
 * than what it looks like: with a gap the subject stops being one stroke and
 * becomes two, which is what "the column opened" means. Everything else here
 * moves the surface and leaves it whole.
 */
export function membrane(name: string, note: string, o: SpanOpts): Subject {
  const base = hullArc(name, note, o.halfArc);
  const centre = o.at * COLUMN;
  const gap = o.gap ?? 0;
  const loopsAt = (t: number): Point[][] => {
    const pts = base.pointsAt(t).map((p) => ({ x: p.x, y: p.y - o.lift(p.x - centre, t) }));
    if (gap <= 0) return [pts];
    return [pts.filter((p) => p.x - centre <= -gap), pts.filter((p) => p.x - centre >= gap)];
  };
  return {
    name,
    note,
    open: true,
    loopsAt,
    pointsAt: (t) => loopsAt(t).flat(),
    path: openSmoothPath,
  };
}

/**
 * Two lips curled up where the skin gave way, tallest at the tear itself.
 *
 * The curl is what separates a breach from a bite. A hole with clean edges
 * reads as a shape the ship was built with — a hatch, a port — and the idea is
 * that a column *stopped holding*, which is a thing that happened rather than a
 * thing that is.
 */
export function lips(height: number, reach: number): Feature {
  return (dx) => {
    const d = Math.abs(dx) - COLUMN / 2;
    if (d < 0 || d > reach) return 0;
    const u = 1 - d / reach;
    return height * u * u;
  };
}

/**
 * A flat-topped welt over one column: a seam pulled shut and held there.
 *
 * Square-shouldered on purpose. The shield is a swelling with long shoulders
 * that grows out of the membrane, and everything the ship does *by itself*
 * looks like that; a hand held on a scar is not the ship doing something, so
 * the welt gets a plateau half a column wide and shoulders a fifth of one. If
 * the two still read alike at 26 px then the hull cannot carry a patch and the
 * idea needs a mark somewhere else.
 */
export function welt(height: number): Feature {
  return (dx) => bumpAdd(dx, height, COLUMN * 0.5, COLUMN * 0.2);
}

/**
 * A lobe that stands while the partner's thumb is down and goes out when it
 * lifts — held for a little over half the cycle, with eased edges so the
 * transition is a movement rather than a cut.
 *
 * Phased so the still is taken with the lobe up: the card has to be judged
 * against HULL · ARMED, and a card caught at rest is a picture of the hull.
 */
export function held(height: number, period: number): Feature {
  return (dx, t) => {
    const p = (((t + period * 0.25) % period) + period) % period;
    const f = p / period;
    const down = smoothstep(f / 0.08) - smoothstep((f - 0.55) / 0.08);
    return bumpAdd(dx, height * down, COLUMN * 0.5, COLUMN * 0.25);
  };
}

/**
 * Two lobes a fixed distance apart whose heights are each other's complement:
 * what one gains the other loses, and they cross exactly halfway.
 *
 * The trade is in the contour rather than in an own-motion because the hull
 * does not move — that is the game's central rule, and a ship that rocked to
 * announce a handover would be saying it in the one register the field has
 * reserved for the shield.
 */
export function traded(height: number, apart: number, period: number): Feature {
  return (dx, t) => {
    const a = (1 + Math.sin((t / period) * Math.PI * 2 + 1.2)) / 2;
    return (
      bumpAdd(dx + apart, height * a, COLUMN * 0.4, COLUMN * 0.3) +
      bumpAdd(dx - apart, height * (1 - a), COLUMN * 0.4, COLUMN * 0.3)
    );
  };
}
