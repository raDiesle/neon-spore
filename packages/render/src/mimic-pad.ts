import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE MIMIC's drawing pad** (§42, *Player 1 and Player 2*): the lower half
 * of the play area, from its middle to the band. One rectangle for both
 * halves of it — the pad the drawer's screen shows, drawn here, and the
 * region a stroke is heard in (`apps/game/src/glyph-pad.ts` `inPad`) — so a
 * thumb that starts inside the faint frame is a thumb the pad listens to.
 */

export interface PadRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Where the pad is on this layout. */
export function mimicPad(l: Layout): PadRect {
  const y = l.playHeight / 2;
  return { x: 0, y, w: l.width, h: l.bandTop - y };
}

/** How far the frame stands in from the pad's edge, and its corners' radius, in tiles. */
const INSET = 0.25;
const ROUND = 0.4;

/**
 * The pad as the drawer sees it: a faint rounded frame over the lower field,
 * breathing on the beat to say it is listening. It is drawn only on a screen
 * whose seat owes a sign (`mimic-draw.ts`), and nothing is drawn in it.
 */
export function drawMimicPad(ctx: CanvasRenderingContext2D, l: Layout, beatPhase: number): void {
  const pad = mimicPad(l);
  const inset = INSET * l.tile;
  const frame = new Path2D();
  frame.roundRect(
    pad.x + inset,
    pad.y + inset,
    pad.w - inset * 2,
    pad.h - inset * 2,
    ROUND * l.tile,
  );
  const pulse = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.mimicSign, 0.04 + 0.03 * pulse);
  ctx.fill(frame);
  ctx.setLineDash([l.tile * 0.2, l.tile * 0.16]);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.mimicSign, 0.28 + 0.12 * pulse);
  ctx.stroke(frame);
  ctx.setLineDash([]);
}
