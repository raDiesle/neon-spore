import type { Point } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import type { Circle, Layout } from "./layout.js";

/**
 * **The way THE BALLOON's handles are carried**: out from the body and bending
 * down, an arc rather than a line across.
 *
 * The owner, 14 October 2026: *make it more a curve to some more down — this
 * resolves if the balloon is near the borders of the screen and increases the
 * distance to pull it*. A straight pull outward ran off the glass from the
 * two outer columns on each side (`balloonTautMilli`'s own comment did the
 * sum), so a balloon in a wall column could not be pulled by the seat on that
 * side at all. Down is where the screen has room.
 *
 * **One arc, always the same length.** The simulation hears a distance along
 * it — `fromMilli`, thousandths of a tile, signed by side as before — and cuts
 * it to taut (`sim/balloon-pull.ts`), so the rule did not change: only which
 * way a thumb goes to cover that distance. The arc is the device's, resolved
 * where the finger is, like every displacement before it.
 *
 * **And it bends further where the wall is near.** It leaves the rest
 * `DIP` below level and turns to straight down by its end; when that would
 * carry the knob past the edge of the glass, it leaves steeper instead —
 * found here by halving — so the full pull is always on the screen, down to
 * straight down beside a balloon in the wall column.
 */
export interface BalloonArc {
  /** Where the bend is centred, and its radius, in field pixels. */
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  /** The angle round that centre the rest stands at, in screen radians. */
  readonly start: number;
  /** -1 for the pilot's handle on the left, 1 for the navigator's. */
  readonly side: -1 | 1;
  /** The rest itself, so a handle nobody has carried is exactly there. */
  readonly x: number;
  readonly y: number;
}

/** How far below level the pull leaves the rest when nothing is in its way. */
const DIP = Math.PI / 12;
/** The steepest it ever leaves at: a hair off straight down, so the bend
 * always has a centre. */
const STEEP = Math.PI / 2 - 0.01;

/** How far across an arc of this length goes, leaving `dip` below level and
 * ending straight down. */
function across(length: number, dip: number): number {
  return (length * (1 - Math.sin(dip))) / (Math.PI / 2 - dip);
}

/** The arc one handle is carried along, from where it rests. */
export function balloonArc(l: Layout, cfg: SimConfig, rest: Circle, side: -1 | 1): BalloonArc {
  const length = (cfg.balloonTautMilli * l.tile) / 1000;
  const room = side === 1 ? l.width - rest.r - rest.x : rest.x - rest.r;
  let dip = DIP;
  if (across(length, dip) > room) {
    // Steeper goes less far across, all the way to nothing, so the first
    // that fits is found by halving the interval.
    let lo = DIP;
    let hi = STEEP;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (across(length, mid) > room) lo = mid;
      else hi = mid;
    }
    dip = hi;
  }
  const r = length / (Math.PI / 2 - dip);
  // The centre is inward and below the rest, square to the way it leaves.
  const cx = rest.x - side * r * Math.sin(dip);
  const cy = rest.y + r * Math.cos(dip);
  const start = Math.atan2(rest.y - cy, rest.x - cx);
  return { cx, cy, r, start, side, x: rest.x, y: rest.y };
}

/** The point `along` field pixels out on the arc, and the way it is heading
 * there — outward and down. */
export function balloonArcPoint(
  arc: BalloonArc,
  along: number,
): { x: number; y: number; dx: number; dy: number } {
  const a = arc.start + (arc.side * along) / arc.r;
  // From the rest rather than the centre, so nought along is the rest to the
  // last bit and not the rest less a rounding.
  return {
    x: arc.x + arc.r * (Math.cos(a) - Math.cos(arc.start)),
    y: arc.y + arc.r * (Math.sin(a) - Math.sin(arc.start)),
    dx: -arc.side * Math.sin(a),
    dy: arc.side * Math.cos(a),
  };
}

/** The whole of the travel as a polyline, for its channel (`pull-track.ts`). */
export function balloonArcPts(arc: BalloonArc, length: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= ARC_STEPS; i++) {
    const { x, y } = balloonArcPoint(arc, (length * i) / ARC_STEPS);
    out.push({ x, y });
  }
  return out;
}

const ARC_STEPS = 12;
