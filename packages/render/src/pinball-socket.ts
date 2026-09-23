import type { PinballState } from "@neon-spore/sim";
import type { Table } from "./pinball-table.js";
import { pinAt } from "./pinball-table.js";
import { drawWetSocket } from "./wet-socket.js";

/**
 * **The wet socket every piece on PINBALL's table stands in.**
 *
 * The owner, 18 September 2026: every boss should look like *something real*.
 * On this table the pieces are already the game's own two bodies — a rock for
 * what is in the way, a pod for what must go (`pinball-piece.ts`), which is his
 * instruction and stays — but each hung in the water with nothing under it, a
 * sticker on the dark rather than a thing mounted on a board a ball could
 * strike. A socket is what says *fixed*: a hollow in the table's skin, darker
 * than the water round it, with its lower inner wall catching the light from
 * above the way the inside of any hole does.
 *
 * Detail and not state: a socket is drawn under a piece that is standing, and
 * goes with it. The empty hollow a taken piece would leave is a picture of the
 * past, and the brief is the state the round has now.
 *
 * All sockets go down before any piece does, so a piece is never under its
 * neighbour's hollow.
 */

/** How much wider than its piece a hollow is, and how far below its centre it
 * sits — the light is above, so the hollow shows most under the body. */
const WIDE = 1.45;
const DROP = 0.16;

export function drawPinSockets(ctx: CanvasRenderingContext2D, t: Table, state: PinballState): void {
  const lip = Math.max(1, t.tile * 0.022);
  for (let i = 0; i < state.pieces.length; i++) {
    const piece = state.pieces[i];
    if (piece === undefined || state.alive[i] !== true) continue;
    const at = pinAt(t, piece.xMilli, piece.yMilli);
    const halfW = (piece.wMilli * t.tile) / 1000;
    const halfH = ((piece.kind === "peg" ? piece.wMilli : piece.hMilli) * t.tile) / 1000;
    drawWetSocket(ctx, at.x, at.y + halfH * DROP, halfW * WIDE, halfH * WIDE, lip);
  }
}
