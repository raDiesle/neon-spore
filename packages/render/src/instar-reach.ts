import type { SeenRing } from "@neon-spore/content";
import type { Flight } from "./instar-flight.js";
import { instarAt, instarFarEnd, instarLen, type Point } from "./instar-place.js";
import type { Figure } from "./instar-shape.js";
import type { Layout } from "./layout.js";

/**
 * **How far each of THE INSTAR's views reaches, and whether any of it is on
 * the field.** The flight carries the body out past the edge and back in
 * (`instar-flight.ts`), and its turn between the two views mostly happens out
 * there — the one stretch of the script where both views are drawn whole
 * (`instarHandover`). A view that lands entirely off the canvas is not drawn,
 * which changes no pixel and spares most of a turn's frames.
 *
 * Each box is the view's own geometry, grown by how far its paint was measured
 * to reach past it (`test/instar-reach.test.ts`, which draws both views over a
 * walk of the whole script into real pixels and holds every margin here), and
 * then by a seventh again.
 *
 * The face-on view is bounded by its seen rings, not by the figure: turned
 * round, its body swings out toward the lens, and how far it goes is the
 * turn's to say (`seeFrontBody`), a head radius or six past any place the
 * figure names.
 */

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** How far the face-on view's paint reaches past its head and its rings, in head radii. */
export const FRONT_REACH = 2;
/** How far the side-on view's paint reaches past the figure's places, thousandths of the field's width. */
export const PROFILE_REACH = { left: 360, right: 420, up: 640, down: 180 } as const;
/** The measured margins are grown by this before a view is left undrawn. */
const SAFETY = 1.15;

function around(points: readonly Point[]): Box {
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  for (const p of points) {
    b.x0 = Math.min(b.x0, p.x);
    b.y0 = Math.min(b.y0, p.y);
    b.x1 = Math.max(b.x1, p.x);
    b.y1 = Math.max(b.y1, p.y);
  }
  return b;
}

/** The face-on view's geometry: the head, and each ring of the body as seen, before any margin. */
export function frontCore(head: Point, neck: Point, seen: readonly SeenRing[]): Box {
  const b = around([head]);
  for (const s of seen) {
    const x = neck.x + s.c.x;
    const y = neck.y + s.c.y;
    b.x0 = Math.min(b.x0, x - s.r);
    b.x1 = Math.max(b.x1, x + s.r);
    b.y0 = Math.min(b.y0, y - s.r);
    b.y1 = Math.max(b.y1, y + s.r);
  }
  return b;
}

/** The face-on view's reach, in the body's own pixels. */
export function frontReach(head: Point, r: number, neck: Point, seen: readonly SeenRing[]): Box {
  const b = frontCore(head, neck, seen);
  const m = FRONT_REACH * SAFETY * r;
  return { x0: b.x0 - m, y0: b.y0 - m, x1: b.x1 + m, y1: b.y1 + m };
}

/** The side-on view's geometry: the figure's own places, before any margin. */
export function profileCore(l: Layout, f: Figure): Box {
  return around([
    instarAt(l, f.headX, f.headY),
    instarFarEnd(l, f),
    instarAt(l, f.eggsX, f.eggsY),
    instarAt(l, f.nestX, f.nestY),
    instarAt(l, f.tailX, f.tailY),
  ]);
}

/** The side-on view's reach, in the body's own pixels. */
export function profileReach(l: Layout, f: Figure): Box {
  const b = profileCore(l, f);
  const m = (k: number) => instarLen(l, k * SAFETY);
  return {
    x0: b.x0 - m(PROFILE_REACH.left),
    y0: b.y0 - m(PROFILE_REACH.up),
    x1: b.x1 + m(PROFILE_REACH.right),
    y1: b.y1 + m(PROFILE_REACH.down),
  };
}

/**
 * Whether any of `box`, in the body's own pixels, lands on the canvas once the
 * flight has carried it (`instar-draw.ts`'s transform) and the frame's shake
 * has moved it by `shake`, with half a tile of slack round the canvas for a
 * glow's last pixel.
 */
export function onField(l: Layout, box: Box, flight: Flight, shake: Point): boolean {
  const c = instarAt(l, 500, 380);
  const dx = c.x + (flight.dxMilli * l.gridWidth) / 1000 + shake.x;
  const dy = c.y + (flight.dyMilli * l.gridHeight) / 1000 + shake.y;
  const k = flight.scale;
  const pad = 0.5 * l.tile;
  return (
    dx + (box.x1 - c.x) * k > -pad &&
    dx + (box.x0 - c.x) * k < l.width + pad &&
    dy + (box.y1 - c.y) * k > -pad &&
    dy + (box.y0 - c.y) * k < l.height + pad
  );
}
