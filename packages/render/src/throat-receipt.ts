import type { SimConfig, ThroatState } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { SWALLOWED } from "./throat-say.js";
import { mouthX, mouthY } from "./throat-shape.js";

/**
 * **What the last thing into the mouth did**, written under it for two beats:
 * `SWALLOWED`, for a body the colour answered.
 *
 * The owner could not tell whether a body sucked into the mouth was good or
 * bad (`throat-say.ts`), and the picture's answer — a ring going limp, up the
 * tube — is the one place on the field nobody is looking at the moment it
 * happens. So the word goes where the eye already is. A refusal says nothing
 * here: the body shaking in place, unmoved, is its own answer, and the red of
 * the mouth's verdict ring is the touch's (`throat-marks.ts`).
 *
 * Read off `fedBeat`, which the world already keeps for the gulp (`throat.ts`),
 * so a restart reinstalls the boss and the word with it and nothing here
 * outlives a frame.
 */

/** Beats a receipt stays up, fading over the last of them. */
const RECEIPT_BEATS = 2;
/** How far under the mouth it is written, in tiles — clear of the circle a
 * pumped mouth sucks from and of the cue's words hung under that. */
const RECEIPT_DROP = 1.9;
const RECEIPT_FONT = '700 12px "Courier New",monospace';

/** How many beats since the last swallow, or null once its receipt is down. */
function since(b: ThroatState, beat: number, beatPhase: number): number | null {
  if (b.phase === "everts" || b.fedBeat < 0) return null;
  const s = beat - b.fedBeat + beatPhase;
  return s < 0 || s >= RECEIPT_BEATS ? null : s;
}

export function throatReceipt(b: ThroatState, beat: number, beatPhase: number): string | null {
  return since(b, beat, beatPhase) === null ? null : SWALLOWED;
}

export function drawThroatReceipt(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  _cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): void {
  const s = since(b, beat, beatPhase);
  if (s === null) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, RECEIPT_BEATS - s);
  ctx.font = RECEIPT_FONT;
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.rock;
  const half = ctx.measureText(SWALLOWED).width / 2 + 4;
  const x = Math.max(half, Math.min(l.width - half, mouthX(l, b)));
  const y = mouthY(l, b) + l.tile * RECEIPT_DROP;
  // The column's light runs under the mouth, so the words get a dark rim.
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.background;
  ctx.strokeText(SWALLOWED, x, y);
  ctx.fillText(SWALLOWED, x, y);
  ctx.restore();
}
