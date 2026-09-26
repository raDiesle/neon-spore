import type { InstarMark, SimConfig } from "@neon-spore/sim";
import type { Figure } from "./instar-shape.js";
import type { Layout } from "./layout.js";

/**
 * **THE INSTAR's figure, in pixels.** The figure (`instar-shape.ts`) is
 * places in thousandths of the field; this turns one of them — a place, a
 * length, the head, the far end of the body, a mark and its radius — into
 * where it is drawn on this screen's layout. Cut off the figure's file when
 * that reached its line limit: the arithmetic of a pose and the arithmetic of
 * a screen are asked for by different callers, and most drawers want only
 * this half.
 */

export interface Point {
  x: number;
  y: number;
}

/** A place in thousandths of the field, in pixels. */
export function instarAt(l: Layout, xMilli: number, yMilli: number): Point {
  return {
    x: l.gridLeft + (xMilli * l.gridWidth) / 1000,
    y: l.gridTop + (yMilli * l.gridHeight) / 1000,
  };
}

/**
 * **Where THE INSTAR's body goes away to**: the far end of it, the root of
 * the tail. Seen face-on the body runs back and up into the dark above the
 * head, and side-on it is the end of the back. `slow-intake-aim.ts` stops
 * the slow's light along the line from here to the head, so the light stands
 * round the whole body rather than crossing it.
 */
export function instarFarEnd(l: Layout, f: Figure): Point {
  return instarAt(l, f.rearX, f.rearY);
}

/** A length in thousandths of the field's width, in pixels. */
export function instarLen(l: Layout, milli: number): number {
  return (milli * l.gridWidth) / 1000;
}

/** Where the head is drawn and how big, in pixels: the lunge thrusts it a
 * quarter larger at the ship. */
export function instarHeadAt(l: Layout, f: Figure): { head: Point; r: number } {
  return { head: instarAt(l, f.headX, f.headY), r: instarLen(l, f.headR) * (1 + 0.25 * f.reach) };
}

/**
 * Where a mark sits, in pixels — the script's own place for it, swept as far
 * as the window has run (`along`, `instarThreat`; `sweepMilli`), carried by
 * the frame's swing (`instar-sway.ts`).
 *
 * **The offset and the sweep are asked for and never defaulted.** A caller
 * that forgot either would draw a ring where the body used to hang, or find a
 * thumb on one, and both failures are quiet: the ring is still a ring and the
 * press is still a press. Naming them at every call site is what makes a
 * caller that has not asked where the ring went this frame say so out loud.
 */
export function instarMarkPoint(
  l: Layout,
  mark: InstarMark,
  sway: { xMilli: number; yMilli: number },
  along: number,
): Point {
  const x = mark.xMilli + (mark.sweepMilli ?? 0) * along;
  return instarAt(l, x + sway.xMilli, mark.yMilli + sway.yMilli);
}

/** A mark's radius in pixels: the handle's, the one size a thumb is asked for. */
export function instarMarkRadius(l: Layout, cfg: SimConfig): number {
  return (l.tile * cfg.handleRadiusMilli) / 1000;
}
