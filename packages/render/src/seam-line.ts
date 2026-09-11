import type { Layout } from "./layout.js";

/**
 * WHERE THE MEMBRANE MAY SWING — the numbers, and nothing that draws.
 *
 * These four lived in `band-seam.ts`, which reads `BAND_JOIN` to know the
 * roof's shape, and the roof GLAND ships (`gland-join.ts`) reads them back to
 * know how far it may climb. That was a cycle — `band-join` → `gland-join` →
 * `band-seam` → `band-join` — and `band-join.ts` calls `saggingRoof` at
 * module evaluation, so whichever page happened to reach `gland-join` first
 * found `saggingRoof` on a namespace that was still `null`. The game reaches
 * `band-join` first and never saw it; the director's VERSUS page reaches
 * `gland-join` first and could not open a single candidate (11 September
 * 2026). Geometry that both sides read belongs below both of them, importing
 * nothing that draws. `band-seam.ts` re-exports these, so every caller that
 * asked it for them still may.
 */

/** How far the membrane swings either side of `bandTop`. */
export function seamRise(l: Layout): number {
  return Math.max(5, Math.min(l.tile * 0.62, l.bandHeight * 0.12));
}

/**
 * How far the membrane may climb onto the hull, as a share of `seamRise`. The
 * rest of its swing hangs *down* into the chamber, which is where the shape
 * has to come from: the hull's belly is one tile deep and a membrane that took
 * most of it would be eating the ship to decorate the panel.
 */
export const CLIMB = 0.3;

/**
 * The membrane as two paths: the line itself, and the chamber it closes off.
 *
 * Both come out of one sampling, so the rim can never be drawn a pixel away
 * from the edge of what it encloses.
 */
export function seamTop(l: Layout): number {
  return l.bandTop - seamRise(l) * CLIMB;
}

/** The deepest the membrane hangs — the flesh above it is the ship's, not the
 * chamber's, and is filled before anything is clipped (`drawSeamFlesh`). */
export function seamBottom(l: Layout): number {
  return l.bandTop + seamRise(l) * (1 - CLIMB);
}

/**
 * HOW FAR DOWN THE SHIP GOES — and it is not `bandTop`.
 *
 * It was, and that produced the one straight edge nothing else about this ship
 * has: the membrane was cut off flat at the top of the panel, so the hull's
 * fill, its ramp and its key light all stopped in mid-air along a ruled line
 * with the seam's lit rim a few pixels under it. Two horizontals, read exactly
 * as drawn — the ship, and then another line separating the controls.
 *
 * So the ship ends where its skin does. `seamBottom` is the lowest the
 * membrane hangs, which is the bottom of the belly, and the panel is drawn
 * over whatever of the ship lies below the membrane — so the visible edge is
 * the contour rather than a rectangle's bottom.
 *
 * It buys the maw the room it never had as well. At full intake the cannon
 * lobe inverts most of a tile below the hull line and the throat is drawn in
 * the bottom of that dent; against `bandTop` both were sliced flat.
 * `test/swallow-bounds.test.ts` holds this bound rather than the old one, and
 * the rule it exists for is unchanged: the ship still may not draw into the
 * chamber where the buttons are, only into its own skin.
 */
export function hullBottom(l: Layout): number {
  return seamBottom(l);
}
