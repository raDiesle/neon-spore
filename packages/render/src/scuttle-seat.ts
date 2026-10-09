import type { Layout } from "./layout.js";
import { paintLobe, paintWound } from "./scuttle-seat-lobed.js";
import type { Point } from "./scuttle-shape.js";

/**
 * THE SCUTTLE's parts where they sit in the frame: a part seated, and the
 * socket one has left.
 *
 * Each part is a lobe of the one body, leaving a wound when it goes
 * (`scuttle-seat-lobed.ts`) — VERSUS `scuttle:seat`, `lobed`, taken 9
 * October 2026 in place of a plate seated in a socket. A part hanging on
 * its thread is still a plate (`scuttle-draw.ts`), and where a bolt stops
 * on the frame is `scuttle-stop.ts`.
 */

/** One part's place in the frame, as the slab is drawn this frame. */
export interface SeatDraw {
  ctx: CanvasRenderingContext2D;
  l: Layout;
  /** The socket's centre, the wind-up's rise and shiver in it. */
  c: Point;
  /** Which socket, for anything that wants each to differ. */
  i: number;
  fade: number;
  time: number;
}

export interface SeatLook {
  /** A part in its socket. */
  seated: (d: SeatDraw) => void;
  /** The socket a part has left, or is leaving. */
  open: (d: SeatDraw) => void;
}

export const SEAT_LOOK: SeatLook = {
  seated: paintLobe,
  open: paintWound,
};
