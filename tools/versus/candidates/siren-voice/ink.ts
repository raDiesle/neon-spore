import { PALETTE } from "../../../../packages/render/src/palette.js";

/**
 * What the four `siren:voice` answers share. A talker's mark is drawn in the
 * lit block's dark ink, so anything knocked *out* of it is the block's own
 * cream; a listener's is drawn in dim ink on the dark pill.
 */
export const BLOCK = PALETTE.text;
export const TAU = Math.PI * 2;

/** 0 → 1 → 0 once per `period` seconds, offset by `lag` of a period. */
export function wave(time: number, period: number, lag = 0): number {
  return 0.5 + 0.5 * Math.cos(TAU * (time / period - lag));
}

/** One arc of a sound wave round (cx, cy), `r` out, opening towards `facing`
 * (0 = right, π = left), in `ink` at `alpha`. */
export function soundArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  facing: number,
  ink: string,
  alpha: number,
  width = 1.5,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = ink;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, r, facing - 0.85, facing + 0.85);
  ctx.stroke();
  ctx.restore();
}
