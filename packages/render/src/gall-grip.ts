import { GALL_POINTS, type GallState, gallSeatAt, type SimConfig } from "@neon-spore/sim";
import { GALL_STANDS, gallPointAt, gallSize } from "./gall-shape.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **A hand on THE GALL** — the hands lane that makes the alien answer a
 * finger at all (§11.55, `bosses-choreographed.md` §38).
 *
 * Its own page for `vise-grip.ts`' reason: the alien a finger is answered on
 * is the one `drawGall` puts on the screen this frame, at the same row and
 * the same four points, and all this file adds is *which* point a hand is
 * on. **One finger, or one mouse button.** It goes out the moment it lands,
 * the point as its `id`, and the lift carries how far the hand went
 * (`touch.ts`): hardly at all is a tap, dragged up is a pull
 * (`sim/gall-hand.ts`).
 *
 * **A point is taken in its share of the seam, not only on the body**: from
 * the top of the alien standing on it to a little under the seam, named for
 * the point it is nearest. **Every point on this seat's half takes one**, the
 * alien on it or not, so the simulation can say *empty* aloud. A hand
 * nearest a point on the other seat's half falls through to whatever is
 * behind it, and on the desk to the other seat (`desk-grab.ts`).
 *
 * **It takes a hand while the alien sits**: not in the air, and never once
 * it is dead.
 */

/** Half a tile of row past the alien's top and under the seam, so a fingertip at an edge is not refused on a pixel. */
const MARGIN = 0.5;
/** How far above the seam the alien's top stands, in its own half-heights. */
const TOP = 2;

/** Whether the alien is there to be tapped: on a point, not in the air, and not dead. */
export function gallTakesPress(s: GallState): boolean {
  return s.phase !== "leap" && s.phase !== "flat";
}

/** Point `point` as a circle: the alien's round where it sits there, which is where the ghost thumb stands. */
export function gallPointCircle(l: Layout, cfg: SimConfig, point: number): Circle {
  const at = gallPointAt(l, cfg, point);
  const { rx, ry } = gallSize(l);
  return { x: at.x, y: at.y - ry * GALL_STANDS, r: rx };
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
 * A hand on this seat's half of the seam, on the point it is nearest, sent
 * as it lands and judged at the lift. `bossOf(field, "gall")` is `null` on
 * every wave without it.
 */
export function gallPressUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "gall");
  if (s === null || !gallTakesPress(s)) return null;
  const cfg = field.cfg;
  const point = nearestPoint(l, cfg, x);
  const at = gallPointAt(l, cfg, point);
  const { ry } = gallSize(l);
  if (y < at.y - TOP * ry - MARGIN * l.tile || y > at.y + ry + MARGIN * l.tile) return null;
  if (x < l.gridLeft || x > l.gridLeft + l.gridWidth) return null;
  const seat = field.seat;
  if (gallSeatAt(point) !== seat) return null;
  return {
    player: seat,
    command: {
      kind: "drag",
      target: "gallPress",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: point,
    },
    hold: {
      kind: "drag",
      target: "gallPress",
      player: seat,
      originX: x,
      originY: y,
      id: point,
    },
  };
}
