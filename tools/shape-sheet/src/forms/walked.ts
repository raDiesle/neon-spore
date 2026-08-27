import { openSmoothPath, type Point } from "@neon-spore/content";
import { linePath, type Subject } from "../contour.js";

/**
 * The forms whose outline is walked point by point rather than sampled once
 * per angle. A radius function cannot describe either of these: an arm has no
 * inside to have a radius of, and a rim of square plates is not a function of
 * angle at all — it is a rule about one edge.
 */

/**
 * An arm: an open, tapering contour hung from a pivot at the top of the frame.
 *
 * Open on purpose — a body has an inside and this does not, which is the whole
 * reason `docs/spec/ideas.md` describes THE CONDUCTOR as a sweep rather than a
 * creature. The taper is drawn as a single stroke; the thickness a real one
 * needs is a stroke width, not a second edge.
 *
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

export interface PlatedOpts {
  /** Half-width. Seven columns of an eleven-column field, at 390 px, is 124. */
  rx: number;
  /** Half-height of the slab itself, before the plates hang below it. */
  ry: number;
  /** Plates along the underside — one per column the body spans. */
  plates: number;
  /** How far a dormant plate hangs below the slab. */
  drop: number;
  /** Which plate is live at `t = 0`. */
  live: number;
  /** Seconds one plate stays live. The encounter's cycle, drawn. */
  dwell: number;
}

/** How much further the live plate reaches than a dormant one. */
const LIVE_REACH = 2.6;

/**
 * A slab that is mostly edge, with a row of plates under it and exactly one of
 * them live.
 *
 * The problem this form exists to solve is that "lit" is a colour, and a
 * silhouette has no colours. At 26 px on a phone the outline is the whole
 * message, so the live plate cannot glow — it has to *reach*: it hangs two and
 * a half times as far as its neighbours, which makes "which part of a long
 * thing is live" a question about a shape rather than about a tint.
 *
 * Two things follow, and both are the encounter rather than decoration. The
 * live plate is the only part of the outline that moves, so on the motion
 * sheet the eye is taken to it without being pointed at it. And it steps along
 * the underside every `dwell` seconds, so the picture carries the cycle: the
 * body never changes and the demand never stops moving.
 *
 * Drawn corner to corner. A made thing with rounded plates is a grown thing,
 * and the whole reading depends on the pair believing this was built.
 */
export function plated(name: string, note: string, o: PlatedOpts): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const live = (o.live + Math.floor(t / o.dwell)) % o.plates;
      // Bevelled on top, square below: the shoulders say made, and the
      // underside stays a hard edge because that is the side that is a rule.
      const ch = Math.min(o.rx, o.ry) * 0.34;
      const pts: Point[] = [
        { x: -o.rx + ch, y: -o.ry },
        { x: o.rx - ch, y: -o.ry },
        { x: o.rx, y: -o.ry + ch },
      ];
      const w = (o.rx * 2) / o.plates;
      const pad = w * 0.19;
      for (let i = o.plates - 1; i >= 0; i--) {
        const xR = -o.rx + (i + 1) * w;
        const xL = -o.rx + i * w;
        const lit = i === live;
        const reach = lit ? LIVE_REACH + 0.12 * Math.sin(t * 4.1) : 1;
        const y = o.ry + o.drop * reach;
        pts.push({ x: xR, y: o.ry });
        pts.push({ x: xR - pad, y: o.ry });
        pts.push({ x: xR - pad, y });
        pts.push({ x: xL + pad, y });
        pts.push({ x: xL + pad, y: o.ry });
      }
      pts.push({ x: -o.rx, y: o.ry });
      pts.push({ x: -o.rx, y: -o.ry + ch });
      return pts;
    },
    path: linePath,
  };
}

export interface VaneOpts {
  /** How far the arm reaches from its pivot. */
  length: number;
  /** How hard the bend whips at the tip. */
  curve: number;
  /** Radius of the pivot the arm hangs from. */
  hub: number;
  /** Where in the swing the still is taken, in seconds of lead. */
  phase: number;
}

/**
 * An arm on a pivot that is drawn: the same sweep as `arm`, plus the bearing
 * it turns on.
 *
 * The pivot is not decoration and it is not a bigger version of the arm. THE
 * VANE's whole encounter is that its pivot is exposed at one end of the sweep
 * and nowhere else, so a picture without the pivot in it is a picture of the
 * part of the boss that cannot be hit. That is also the only thing separating
 * this from THE CONDUCTOR, which was the first thing tried and did not work:
 * a phase offset moves the arm to the far end of its travel and the arm is
 * already *at* an end at `t = 0`, so the two cards came out mirror images and
 * a mirror image is not a second idea.
 *
 * One open stroke: around the bearing, then out along the arm. Still no
 * inside — a vane is a mechanism that turns when something pushes it, and the
 * moment it encloses an area it starts reading as a body with a weapon.
 */
export function vane(name: string, note: string, o: VaneOpts): Subject {
  const RIM = 14;
  return {
    name,
    open: true,
    note,
    pointsAt(t) {
      const pts: Point[] = [];
      const pivot = { x: 0, y: -o.length / 2 };
      // The ring starts and finishes where the arm leaves — straight down, at
      // `t = 0` — so the stroke runs round the bearing and then away down the
      // arm. Starting it anywhere else leaves a chord across the bearing on
      // the way back to the centre, which reads as a bite taken out of it.
      const LEAVE = Math.PI / 2;
      for (let i = 0; i <= RIM; i++) {
        const a = LEAVE + (i / RIM) * Math.PI * 2;
        pts.push({ x: pivot.x + Math.cos(a) * o.hub, y: pivot.y + Math.sin(a) * o.hub });
      }
      const steps = 28;
      // Picked up at the rim rather than at the centre, for the same reason.
      const from = o.hub / o.length;
      for (let i = 0; i <= steps; i++) {
        const f = from + (i / steps) * (1 - from);
        const bend = Math.sin((t + o.phase) * 0.9 - f * 1.4) * o.curve * f * f;
        pts.push({
          x: pivot.x + Math.sin(bend) * o.length * f,
          y: pivot.y + Math.cos(bend) * o.length * f,
        });
      }
      return pts;
    },
    path: openSmoothPath,
  };
}
