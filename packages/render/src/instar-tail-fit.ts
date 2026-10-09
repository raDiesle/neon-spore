import type { SeenRing } from "@neon-spore/content";
import type { Point } from "./instar-place.js";
import type { Layout } from "./layout.js";

/**
 * **THE INSTAR's resting tail kept on the screen** — the owner, 9 October
 * 2026: *make sure the graphics of boss specifically the tail is not cut from
 * borders of game screen*. Side-on, a tail resting up and to the right of a
 * rear near the edge ran off it; face-on, off the top.
 *
 * The tail is laid, its extent measured — every ring with its girth, and the
 * blades' tips with their fins — and where it crosses an edge its resting fork
 * and the rise toward it are moved back in by what it crossed, and it is laid
 * again, a few times at most. The root stays in the rear. A lash is never
 * moved: its fork is over the marks a thumb is chasing (`instar-tail.ts`), so
 * the move is weighed by how far the tail rests. A rear that is itself off
 * the screen — the body flown out between its two views (`instar-reach.ts`) —
 * has nothing on it to keep, and the tail is not moved; and no move goes
 * further than `REACH` head radii, so a crossing the rest cannot mend, the
 * root's own girth, is not chased across the screen.
 */

export interface TailShape {
  seen: SeenRing[];
  fork: Point;
  blades: { tip: Point; s: 1 | -1 }[];
}

/** How far inside the screen's edge the tail is kept, in head radii. */
const MARGIN = 0.12;
/** How far a blade's fins stand off its tip, in head radii. */
const FINS = 0.35;
/** How many times the tail is laid again, and how much further than it crossed each move goes. */
const TRIES = 4;
const OVERSHOOT = 1.3;
/** The furthest the rest is moved either way, in head radii. */
const REACH = 2;

/** How far the shape crosses the screen's edges: what to move it by to bring it in, in pixels. */
function crossing(l: Layout, r: number, rear: Point, t: TailShape): Point {
  const m = MARGIN * r;
  let x0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  for (const g of t.seen) {
    x0 = Math.min(x0, rear.x + g.c.x - g.r);
    x1 = Math.max(x1, rear.x + g.c.x + g.r);
    y0 = Math.min(y0, rear.y + g.c.y - g.r);
  }
  for (const b of t.blades) {
    x0 = Math.min(x0, b.tip.x - FINS * r);
    x1 = Math.max(x1, b.tip.x + FINS * r);
    y0 = Math.min(y0, b.tip.y - FINS * r);
  }
  const x = x1 > l.width - m ? l.width - m - x1 : x0 < m ? m - x0 : 0;
  return { x, y: y0 < m ? m - y0 : 0 };
}

/** The tail `lay` lays, its rest moved until it is on the screen or the tries run out. */
export function fitTail(
  l: Layout,
  r: number,
  rear: Point,
  tail: number,
  lay: (shift: Point) => TailShape,
): TailShape {
  const shift = { x: 0, y: 0 };
  let t = lay(shift);
  if (tail >= 1 || rear.x < 0 || rear.x > l.width || rear.y < 0 || rear.y > l.height) return t;
  const most = (REACH * r) / (1 - tail);
  const clamp = (v: number) => Math.max(-most, Math.min(most, v));
  for (let i = 0; i < TRIES; i++) {
    const over = crossing(l, r, rear, t);
    if (over.x === 0 && over.y === 0) break;
    shift.x = clamp(shift.x + (over.x * OVERSHOOT) / (1 - tail));
    shift.y = clamp(shift.y + (over.y * OVERSHOOT) / (1 - tail));
    t = lay(shift);
  }
  return t;
}
