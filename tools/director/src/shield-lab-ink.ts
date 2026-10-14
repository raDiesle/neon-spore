import { PALETTE, strokeGlow } from "@neon-spore/render";
import type { SeatFrame, ShieldAsk } from "./shield-lab-scene.js";

/**
 * **What THE SHIELD LAB's looks are drawn with** (`shield-lab-looks.ts`,
 * `shield-lab-looks-b.ts`, `shield-lab-button.ts`): the shield's two colours,
 * a line thick enough to see, the dome as a path, and the two readings of
 * the moment every look asks.
 */

export interface ShieldLook {
  key: string;
  name: string;
  sentence: string;
  column(ctx: CanvasRenderingContext2D, f: SeatFrame, a: ShieldAsk, time: number): void;
  moment(ctx: CanvasRenderingContext2D, f: SeatFrame, a: ShieldAsk, time: number): void;
}

export const CY = PALETTE.shield;
export const RIM = PALETTE.shieldRim;
/** Every line here, thicker than a hairline: the owner drops a look he cannot see on a phone. */
const WIDE = 1.8;

/** `strokeGlow` at the lab's width. */
export function glow(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  hex: string,
  w: number,
  intensity: number,
  alpha: number,
): void {
  strokeGlow(ctx, p, hex, w * WIDE, intensity, alpha);
}

/** 0..1 for how close the moment is: 0 four beats out, 1 on it. */
export const nearness = (a: ShieldAsk, over = 4): number =>
  Math.max(0, Math.min(1, 1 - a.beatsLeft / over));
/** Whether a press now would turn it. */
export const inWindow = (a: ShieldAsk): boolean => a.beatsLeft <= a.windowBeats;
/** A beat's pulse, 1 on the beat falling to 0 over it. */
export const pulse = (a: ShieldAsk): number => (a.beatsLeft % 1) ** 3;

/** The shield's outline as a path: a dome `w` across, `h` tall, standing on `y`. */
export function domePath(x: number, y: number, w: number, h: number): Path2D {
  const p = new Path2D();
  p.ellipse(x, y, w / 2, h, 0, Math.PI, 0);
  return p;
}

export function dashed(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  hex: string,
  w: number,
  alpha: number,
): void {
  ctx.save();
  ctx.setLineDash([w * 2.2, w * 1.6]);
  glow(ctx, p, hex, w, 0.8, alpha);
  ctx.restore();
}

/** A string from `x0,y0` to `x1,y1`, sagging sideways by `slack` and stirring with `time`. */
export function stringPath(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  slack: number,
  time: number,
): Path2D {
  const p = new Path2D();
  const mx = (x0 + x1) / 2 + slack * Math.sin(time * 2.1) * 0.35;
  const my = (y0 + y1) / 2 + Math.abs(slack);
  p.moveTo(x0, y0);
  p.quadraticCurveTo(mx + slack, my, x1, y1);
  return p;
}
