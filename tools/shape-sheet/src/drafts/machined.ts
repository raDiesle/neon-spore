import { openSmoothPath, type Point } from "@neon-spore/content";
import { linePath, type Subject } from "../contour.js";

/**
 * The two bodies a boss round is allowed to be made of that the sheet could
 * not draw yet.
 *
 * `docs/spec/interludes.md` fixes the material — **slabs and glyphs, never
 * blobs** — and the catalogue already has `slab` and `glyphed`, which is why
 * most of the twelve candidates need no new art at all. These are the two that
 * do. A claw is machinery with a *grip*, which no superellipse has; a cable is
 * a line that crosses itself, which no arm in the catalogue does, because every
 * arm there hangs from a pivot and sweeps.
 *
 * Both are walked corner to corner or drawn as one open stroke. Nothing here
 * goes through `blobRadiusMul`: a round like this that breathed would be the
 * field wearing a costume, and the first frame is where the pair is supposed
 * to know it is not.
 */

export interface ClawOpts {
  /** Length of the shaft above the fingers. */
  stem: number;
  /** Half-width of the shaft, and the thickness of a finger at its root. */
  bar: number;
  /** How far a finger travels from the hub. */
  reach: number;
  /** Seconds for one open-and-shut. */
  period: number;
}

const FINGER_STEPS = 16;

/**
 * One finger's centreline, integrated rather than solved: the direction of
 * travel turns steadily from down-and-out to inward-and-up, so the line curls.
 * A radius per angle cannot say this — a hook's tip sits sideways of its own
 * root, which is exactly the thing one answer per angle forbids.
 */
function centreline(side: number, grip: number, reach: number, hub: Point): Point[] {
  // Starts nearly sideways and swings inward: open, the two tips stand a
  // wreck's width apart; shut, they meet on the axis. The travel is symmetric
  // about zero at `grip` 1, which is what makes "shut" a fact rather than a
  // number that happened to look closed.
  const from = 1.25;
  const to = -0.35 - grip * 0.9;
  const step = reach / FINGER_STEPS;
  const pts: Point[] = [];
  let x = hub.x;
  let y = hub.y;
  for (let i = 0; i <= FINGER_STEPS; i++) {
    pts.push({ x, y });
    const a = from + (to - from) * (i / FINGER_STEPS);
    x += side * Math.sin(a) * step;
    y += Math.cos(a) * step;
  }
  return pts;
}

/** One edge of a thick line: the centreline pushed sideways, tapering to the tip. */
function edge(line: Point[], sign: number, bar: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < line.length; i++) {
    const p = line[i] as Point;
    const q = line[Math.min(i + 1, line.length - 1)] as Point;
    const r = line[Math.max(i - 1, 0)] as Point;
    const dx = q.x - r.x;
    const dy = q.y - r.y;
    const l = Math.hypot(dx, dy) || 1;
    const w = bar * (1 - 0.62 * (i / (line.length - 1)));
    out.push({ x: p.x + (sign * -dy * w) / l, y: p.y + (sign * dx * w) / l });
  }
  return out;
}

function centred(pts: Point[]): Point[] {
  let x0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  for (const p of pts) {
    x0 = Math.min(x0, p.x);
    x1 = Math.max(x1, p.x);
    y0 = Math.min(y0, p.y);
    y1 = Math.max(y1, p.y);
  }
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return pts.map((p) => ({ x: p.x - cx, y: p.y - cy }));
}

/**
 * A salvage claw on a shaft: two fingers that open and shut under a bar.
 *
 * Drawn corner to corner, with no smoothing and no wobble, because the whole
 * value of THE CLAW as a round is that the pilot is working a *machine* over a
 * field of wreckage while the navigator reads the wreckage. A claw with a
 * grown outline would be a creature holding something.
 *
 * The gape is in the contour, not in an own-motion. It has to be: a grip is the
 * one thing this shape says, and an own-motion can only move a body about — it
 * cannot close a hand. What the motion is left to carry is the travel along the
 * rail, which is the pilot's actual verb.
 */
export function claw(name: string, note: string, o: ClawOpts): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const grip = (1 - Math.cos((t / o.period) * Math.PI * 2)) / 2;
      const hub = { x: 0, y: o.stem };
      const left = centreline(-1, grip, o.reach, hub);
      const right = centreline(1, grip, o.reach, hub);
      // Sign +1 is the outside of the left finger and the inside of the right:
      // the normal is taken from the direction of travel, and the two fingers
      // travel in mirrored directions.
      const lOut = edge(left, 1, o.bar);
      const lIn = edge(left, -1, o.bar).slice(2).reverse();
      const rIn = edge(right, 1, o.bar).slice(2);
      const rOut = edge(right, -1, o.bar).reverse();
      // One vertex where the two fingers meet. Without it the two inner edges
      // cross each other under the hub and the crotch draws as a small X,
      // which reads as a break in a shape whose whole message is that it holds.
      const crotch = { x: 0, y: hub.y + o.bar * 1.15 };
      return centred([
        { x: -o.bar, y: 0 },
        { x: -o.bar, y: hub.y },
        ...lOut,
        ...lIn,
        crotch,
        ...rIn,
        ...rOut,
        { x: o.bar, y: hub.y },
        { x: o.bar, y: 0 },
      ]);
    },
    path: linePath,
  };
}

export interface CableOpts {
  /** How far the strand spans from end to end. */
  height: number;
  /** How far it wanders sideways. */
  width: number;
  /** How hard it doubles back on itself, as a fraction of `height`. */
  writhe: number;
  /** Seconds for one full shift of the tangle. */
  period: number;
}

/**
 * One strand of a tangle: an open line with two free ends and at least one
 * crossing of itself.
 *
 * The crossing is the whole form and it is not decoration. THE SPLICE is a
 * round in which the navigator can see where a strand *enters*, the pilot where
 * it *leaves*, and neither can follow it in between — so a line that could be
 * traced by eye would delete the round. `writhe` makes the strand's own descent
 * go backwards somewhere, which is what turns a wandering line into a tangled
 * one.
 *
 * The sideways wander and the backtrack run at 2 and 2.5 turns over the
 * strand's length, and that ratio is the only fiddly number here. It was
 * measured rather than chosen: at every whole ratio the two stay in step, so
 * the strand doubles back exactly where it is already at the edge of its own
 * travel and the loop closes into a cusp instead of a crossing — a tangle that
 * is untangled for part of every cycle. At 2 against 2.5 it crosses itself
 * between one and four times at every moment of a ninety-second sweep.
 *
 * Both ends sit near the vertical axis, top and bottom, so a card is a strand
 * entering one edge of the frame and leaving the other — the two things the two
 * players can each see one of.
 */
export function cable(name: string, note: string, o: CableOpts): Subject {
  const STEPS = 96;
  return {
    name,
    note,
    open: true,
    pointsAt(t) {
      const p = (t / o.period) * Math.PI * 2;
      const pts: Point[] = [];
      for (let i = 0; i <= STEPS; i++) {
        const s = i / STEPS;
        const u = s * Math.PI * 2;
        pts.push({
          x: o.width * (Math.sin(2 * u + p) + 0.45 * Math.sin(4 * u - p * 0.6)),
          y: -o.height / 2 + o.height * s - o.writhe * o.height * Math.sin(2.5 * u + p),
        });
      }
      return pts;
    },
    path: openSmoothPath,
  };
}
