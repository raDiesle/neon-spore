import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { scuttlePlatePath } from "./scuttle-outline.js";
import { paintPlate, paintSocket } from "./scuttle-plate.js";
import { type Point, SOCKET_HALF_H } from "./scuttle-shape.js";

/**
 * THE SCUTTLE's parts where they sit in the frame: a part seated, and the
 * socket one has left.
 *
 * The design has each part a piece of the one body, leaving a wound when it
 * goes; the game seats a plate in a socket on a grid (`scuttle-draw.ts`).
 * Lifted out on 8 October 2026 so a body-and-wound look could be offered in
 * VERSUS (`scuttle:seat`) without the field changing until the owner
 * chooses; these are the drawings the game already made. A part hanging on
 * its thread is not drawn through here, and neither is where a bolt stops
 * on the frame (`scuttle-stop.ts`).
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
  seated: ({ ctx, l, c, fade }) =>
    paintPlate(
      ctx,
      scuttlePlatePath(l, c, fade),
      c,
      l.tile,
      SOCKET_HALF_H,
      PALETTE.rock,
      0.55,
      fade,
    ),
  open: ({ ctx, l, c, fade }) =>
    paintSocket(ctx, scuttlePlatePath(l, c, fade), c.x, c.y, l.tile, fade),
};
