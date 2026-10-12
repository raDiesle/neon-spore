import type { Point } from "@neon-spore/content";
import { bodyPath, type GooBody } from "./goo-body.js";
import type { GooStyle } from "./goo-style.js";

/**
 * **What calls the thumb to a drop no hand has yet**: under it, a breathing
 * halo and rings (`call`); over it, nothing. `enter` is the
 * seconds since the drop came in (`goo-enter.ts`).
 */

/** Put a thumb here: a breathing halo and ripples out of the drop, two at a time — a
 * little thinner and not so far out since the owner, 11 October 2026: *reduce a little
 * bit the border and range of wave animation around outside of button*. */
export function call(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  time: number,
): void {
  const breathe = 0.5 + 0.5 * Math.sin(time * 4);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(at.x, at.y, r * 0.7, at.x, at.y, r * 2.5);
  halo.addColorStop(0, style.neon);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.globalAlpha = 0.16 + 0.18 * breathe;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = style.neon;
  for (const lag of [0, 0.5]) {
    const u = (time * 0.85 + lag) % 1;
    ctx.globalAlpha = 0.7 * (1 - u);
    ctx.lineWidth = r * 0.08 * (1 - u) + 0.3;
    ctx.stroke(bodyPath({ at, r: r * (1.12 + 0.9 * u), seed: 29 }, style, time));
  }
  ctx.restore();
}

/** A call under the drop, at `at` with the drop's radius `r`. */
export type CallPaint = (
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  time: number,
  enter: number,
) => void;

/** A call over the drop once it is drawn, on the body as drawn; the shipped one puts
 * nothing there. */
export type CallOver = (
  ctx: CanvasRenderingContext2D,
  body: GooBody,
  style: GooStyle,
  time: number,
  enter: number,
) => void;

/**
 * `GOO_CALL` is one record rather than two functions so the PULL LAB's CALL
 * looks (`tools/director/src/pull-calls/`) can hold another call in its place
 * for the length of a frame, as `PULL_KNOB` is held. Nothing in the game
 * patches it.
 */
export const GOO_CALL: { paint: CallPaint; over: CallOver } = {
  paint: call,
  over: () => {},
};
