import type { GooBody } from "./goo-body.js";
import { type Press, UNPRESSED } from "./goo-press.js";
import { paintSoft, type SoftDrop, type Turn } from "./goo-soft.js";
import { RIPPLES_STILL } from "./goo-soft-crater.js";
import type { GooStyle } from "./goo-style.js";

/**
 * **How every GOO drop is drawn**: as a soft drop a thumb sinks into
 * (`goo-soft.ts`) — the owner, 11 October 2026: *more alternatives of how pull
 * button looks … not changing colour, but the 3d effect … like a slime or a
 * sponge or … soft plastic*. SOFT PLASTIC was picked the same day, then its
 * crater with ripples on a drop that all but stops turning while pulled,
 * RIPPLES · STILL (`goo-soft-crater.ts`); and the same day again the rest went —
 * *remove all variants of "drop" but keep "ripples * still"* — and with them
 * the PULL LAB's DROP picker.
 */
export const GOO_DROP: SoftDrop = RIPPLES_STILL;

/** The drop, `turn` the moment it turns by and `press` how deep a thumb is in it; gives
 * back the body drawn, pressed and turned as it is, for an arrow to be laid on. */
export function paintGoo(
  ctx: CanvasRenderingContext2D,
  b: GooBody,
  style: GooStyle,
  time: number,
  tint: { red: number; green?: number; alpha?: number },
  turn: Turn,
  press: Press = UNPRESSED,
): GooBody {
  return paintSoft(ctx, GOO_DROP, b, style, time, tint, press, turn);
}
