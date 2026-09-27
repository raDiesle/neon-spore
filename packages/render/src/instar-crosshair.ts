import { circleSubpath } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **A shoot mark is a crosshair** — the owner, 27 September 2026, on the
 * fourth act's tail: *is it correct I have to hit the tail? It's not clear.
 * It should have not just a red circle, but a crosshair.* A ring with four
 * ticks pointing in, and nothing across the middle — no fill, no glyph — so
 * the part the bolt is for stays in plain sight under it, glowing
 * (`instar-weak.ts`). For the same reason a shoot mark has no halo
 * (`instar-marks.ts`): the part's own red is its light.
 *
 * **In the ship's violet**, because either colour of bolt counts: a red
 * crosshair would say *fire red*. Which colour it should say, if any, is
 * the owner's question in `docs/queue.md` (*a shoot mark asks for one
 * colour, or none*).
 *
 * The window ring and the progress arc are the ring's (`instar-ring.ts`),
 * drawn round this the same as round any other mark.
 */

/** Where a tick starts — out at the window ring's last, smallest reach
 * (`instar-together.ts`) — and where it stops short of the centre. */
const TICK_OUT = 1.75;
const TICK_IN = 0.45;

/**
 * How the crosshair is laid on the mark. Swapped by the test that finds it
 * on every shoot mark and on no other (`instar-crosshair.test.ts`).
 */
export const CROSSHAIR_LOOK: {
  paint: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    bright: boolean,
    k: number,
  ) => void;
} = {
  paint: (ctx, x, y, r, bright, k) => {
    const p = new Path2D(circleSubpath(x, y, r));
    for (let q = 0; q < 4; q++) {
      const dx = Math.cos((q * Math.PI) / 2);
      const dy = Math.sin((q * Math.PI) / 2);
      p.moveTo(x + dx * r * TICK_OUT, y + dy * r * TICK_OUT);
      p.lineTo(x + dx * r * TICK_IN, y + dy * r * TICK_IN);
    }
    strokeGlow(ctx, p, bright ? PALETTE.hullRim : PALETTE.hull, STROKE.outline, k);
  },
};

/** The crosshair at `r`, the ring's own radius this frame. */
export function drawInstarCrosshair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  bright: boolean,
  k: number,
): void {
  CROSSHAIR_LOOK.paint(ctx, x, y, r, bright, k);
}
