import { GALL_POINTS, type GallState, gallSeatAt, type SimConfig } from "@neon-spore/sim";
import { gallPointAt, gallRootAt, gallRootR, gallSize } from "./gall-shape.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The pinch on THE GALL** — the hands lane that makes the nodule answer two
 * fingers at all (§11.55, `bosses-choreographed.md` §38).
 *
 * Its own page for `vise-grip.ts`' reason: the seam a finger is answered on
 * is the one `drawGall` puts on the screen this frame, at the same row and
 * the same four points, and all this file adds is *which* point a press is
 * on. The pair is THE VISE's too — whoever owns the pointers makes it
 * (`pinch-pair.ts`) and the gap is the space between the fingertips
 * (`pinch.ts`) — and the point the first finger went down on goes out as the
 * pinch's `id`.
 *
 * **A point is pinched in its share of the seam, not on the nodule.** The
 * nodule is under two tiles wide and a pinch is two fingertips landing apart,
 * so a press is taken anywhere on the seam's row, half a tile more than the
 * nodule's height either way, and named for the point it is nearest. **Every
 * point on this seat's half takes one**, the gall on it or not: the
 * simulation hears a pinch on bare seam and does nothing with it
 * (`sim/gall-hand.ts`), which is the whole of *find it*, and a pinch left
 * where the gall was stays on that point when the gall jumps. A press nearest
 * a point on the other seat's half falls through to whatever is behind it, as
 * the simulation would refuse it anyway.
 *
 * **The gall takes a pinch while the nodule stands**, from its rise out of
 * the seam until the third close pulls it under; the root is shot, never
 * pinched.
 */

/** Half a tile of row above and below the nodule, so a fingertip at its top is not refused on a pixel. */
const MARGIN = 0.5;

/** Whether the nodule is there to be pinched: until the root is bared, and never once the seam is flat. */
export function gallTakesPinch(s: GallState): boolean {
  return !s.bared && s.phase !== "flat";
}

/** Point `point` as a circle: the nodule's round where it sits there, which is where the ghost thumb stands. */
export function gallPointCircle(l: Layout, cfg: SimConfig, point: number): Circle {
  const at = gallPointAt(l, cfg, point);
  return { x: at.x, y: at.y, r: gallSize(l).rx };
}

/** The bared root as a circle, where a shot is asked for once the third close pulls the gall under. */
export function gallRootCircle(l: Layout, cfg: SimConfig): Circle {
  const at = gallRootAt(l, cfg);
  return { x: at.x, y: at.y, r: gallRootR(l) };
}

/** The point nearest a press along the seam, on this layout — mirrored under THE FLIP with the drawing. */
function nearestPoint(l: Layout, cfg: SimConfig, x: number): number {
  let best = 0;
  for (let p = 1; p < GALL_POINTS; p++) {
    const d = Math.abs(gallPointAt(l, cfg, p).x - x);
    if (d < Math.abs(gallPointAt(l, cfg, best).x - x)) best = p;
  }
  return best;
}

/**
 * A press on this seat's half of the seam: one finger of a pinch on the point
 * it is nearest, held and **saying nothing** — a finger alone is not a pinch,
 * and the gap goes out once a second finger is down (`pinch.ts`).
 * `bossOf(field, "gall")` is `null` on every wave without it.
 */
export function gallPinchUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "gall");
  if (s === null || !gallTakesPinch(s)) return null;
  const cfg = field.cfg;
  const point = nearestPoint(l, cfg, x);
  const at = gallPointAt(l, cfg, point);
  if (Math.abs(y - at.y) > gallSize(l).ry + MARGIN * l.tile) return null;
  if (x < l.gridLeft || x > l.gridLeft + l.gridWidth) return null;
  const seat = field.seat;
  if (gallSeatAt(point) !== seat) return null;
  return {
    player: seat,
    command: null,
    hold: {
      kind: "drag",
      target: "gallPinch",
      player: seat,
      originX: x,
      originY: y,
      id: point,
      pinch: true,
    },
  };
}
