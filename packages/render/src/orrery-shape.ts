import {
  type OrreryState,
  orreryCoreCol,
  orreryDir,
  orreryGapSlot,
  orreryOrbit,
  orreryReach,
  type SimConfig,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **Where THE ORRERY's three orbits are on the screen**, and nothing about how
 * they are painted.
 *
 * Its own file for the reason `throat-shape.ts` is one: the arithmetic that
 * turns a slot of an orbit into a pixel is asked for by the drawing, by the
 * shaft of light down the middle of it, and by the circle a thumb takes hold
 * of — three callers, one answer, and a second copy of it would be an organ
 * drawn where a finger is not.
 *
 * **The orbits are flattened, and that is the whole of the composition.** A
 * real orrery is a tilted model seen at a shallow angle, so its rings are wide
 * ellipses rather than circles — and here that is not decoration but the only
 * way the picture can be honest about the one thing the rules care about.
 * `orreryReach` already says a ring spans most of the field's *width* (five
 * columns either side for the outer), and the space above row 0 is a tile
 * deep. A circle of that width could not be drawn; a circle squeezed into that
 * height would put the near side of a ring and the far side within a few
 * pixels of each other, and the near side is the only side a shot can reach.
 * Flattened to `ORRERY_FLATTEN`, the outer ring's bottom and top are three
 * rows apart, which is what makes *three out, coming back* a thing an eye can
 * follow (`sim/orrery-gap.ts`).
 *
 * **Slot 0 is the bottom**, nearest the hull, which is the sim's own
 * convention and the only slot a shot passes through. Slots count round toward
 * the right-hand side first, so the column this file puts a gap in agrees with
 * the column `orreryGapCol` says a rock comes down.
 *
 * **Columns in, pixels out, through `fieldX`.** THE ORRERY is a body on the
 * field rather than a mark on the band, so a turned seat sees it mirrored
 * (`field-flip.ts`) — and because the core stands in the middle column, which
 * is the column the fold is about, mirroring it is exactly mirroring the side
 * each gap is on. Which is the point: on a flipped screen the pilot's *three
 * out to the right* is the navigator's three out to the left, and they have to
 * find that out by talking.
 */

/** The row the core hangs in, and the centre every orbit is drawn about. */
export const ORRERY_ROW = 1.15;

/**
 * A ring's vertical radius as a share of its horizontal one — the tilt.
 *
 * 0.3 rather than 1 for the reason in the header, and rather than the 0.1 a
 * literal *hangs above the field* would force: the outer ring's near side then
 * dips a row and a half into the top of the field, which is where the pair is
 * looking anyway, and its far side is a row and a half above the core. Three
 * rows is enough to read a near arc from a far one at 26 px with nothing but
 * position; brightness and draw order are then saying it a second time.
 */
export const ORRERY_FLATTEN = 0.3;

/**
 * How much of a beat a ring takes to arrive at its next organ: a little under
 * half, then it sits.
 *
 * **A rhythm rather than a speed**, which is the design's own word for what
 * the beaded arcs are for. A ring gliding evenly from one organ to the next
 * would give the pair three speeds to compare, and nobody can compare three
 * speeds while talking; a ring that snaps and then waits gives them three
 * *rhythms*, and the difference between eight beats round and six is then
 * something you can hear in your own counting.
 */
const STEP_PHASE = 0.45;

/** A ring's horizontal radius, in columns — the sim's own reach. */
export function orreryRx(cfg: SimConfig, ring: number): number {
  return orreryReach(cfg, ring);
}

/** And its vertical radius, in rows. Tiles are square, so this is the tilt and
 * nothing else. */
export function orreryRy(cfg: SimConfig, ring: number): number {
  return orreryRx(cfg, ring) * ORRERY_FLATTEN;
}

/**
 * Where a ring's gap stands **within this frame** rather than on this beat: the
 * slot it is arriving at, less however much of the step it has not made yet.
 *
 * Fractional on purpose, and it is the one number in this file that is not a
 * fact the rules hold. Nothing is decided by it — a shot is judged against
 * `orreryRingOpen` on the beat — so a ring caught halfway between two organs
 * is a picture of a ring that is about to be open, which is exactly what the
 * beat before an alignment looks like.
 */
export function orreryAt(
  cfg: SimConfig,
  b: OrreryState,
  ring: number,
  beat: number,
  beatPhase: number,
): number {
  const slot = orreryGapSlot(cfg, b, ring, beat);
  // `smoothstep` rather than the phase itself: the organ leaves its socket
  // gently, crosses fast and settles, where a linear arrival reads as a
  // machine skipping (`ease.ts`).
  const eased = smoothstep(beatPhase / STEP_PHASE);
  return slot - orreryDir(ring) * (1 - eased);
}

/** Where the core is. */
export function orreryCorePoint(l: Layout, cfg: SimConfig): { x: number; y: number } {
  return { x: fieldX(l, orreryCoreCol(cfg)), y: tileCY(l, ORRERY_ROW) };
}

/**
 * The screen point of a slot of a ring — whole or fractional, gap or organ.
 *
 * Sine across and cosine down, so slot 0 is the bottom and slot `orbit / 2` is
 * the top, which is the sim's convention read straight off
 * (`orreryGapSlot`'s own comment).
 */
export function orreryPoint(
  l: Layout,
  cfg: SimConfig,
  ring: number,
  at: number,
): { x: number; y: number } {
  const orbit = Math.max(1, orreryOrbit(cfg, ring));
  const th = (2 * Math.PI * at) / orbit;
  return {
    x: fieldX(l, orreryCoreCol(cfg) + orreryRx(cfg, ring) * Math.sin(th)),
    y: tileCY(l, ORRERY_ROW + orreryRy(cfg, ring) * Math.cos(th)),
  };
}

/** The whole of a ring's orbit as a path, for the thin line the organs sit on. */
export function orreryOrbitPath(l: Layout, cfg: SimConfig, ring: number): Path2D {
  const core = orreryCorePoint(l, cfg);
  const path = new Path2D();
  path.ellipse(
    core.x,
    core.y,
    orreryRx(cfg, ring) * l.tile,
    orreryRy(cfg, ring) * l.tile,
    0,
    0,
    Math.PI * 2,
  );
  return path;
}

/** How big an organ is drawn, in pixels. The outer ring's are no bigger than
 * the inner's: an organ is an organ, and the rings are told apart by how far
 * out they are and how often they move. */
export function orreryOrganR(l: Layout): number {
  return l.tile * 0.17;
}
