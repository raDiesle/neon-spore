import type { SimConfig, ThroatState } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { RING_DOWN, RING_HEALS, SWALLOWED } from "./throat-say.js";
import { mouthX, mouthY } from "./throat-shape.js";

/**
 * **What the last thing into the mouth did**, written under it for two beats:
 * `RING DOWN` for a gum, `SWALLOWED · RING HEALS` for a body.
 *
 * The owner could not tell whether a body sucked into the mouth was good or
 * bad (`throat-say.ts`), and the picture's answer — a limp ring going taut
 * again, five rings up the tube — is the one place on the field nobody is
 * looking at the moment it happens. So the word goes where the eye already is.
 *
 * Read off `chokedBeat` and `fedBeat`, the two beats the world already keeps
 * for the tube's own darkening (`throat.ts`), so a restart reinstalls the boss
 * and the words with it and nothing here outlives a frame. The later of the
 * two wins when both are fresh. A swallow in `still` says only `SWALLOWED`:
 * nothing can be slack before the first gum, so it healed nothing.
 */

/** Beats a receipt stays up, fading over the last of them. */
const RECEIPT_BEATS = 2;
/** How far under the mouth it is written, in tiles — clear of a body
 * standing in the mouth and of the cue's words hung under that. */
const RECEIPT_DROP = 1.9;
const RECEIPT_FONT = '700 12px "Courier New",monospace';

export function throatReceipt(b: ThroatState, beat: number, beatPhase: number): string | null {
  if (b.phase === "everts") return null;
  const fed = b.fedBeat >= 0 && b.fedBeat >= b.chokedBeat;
  const at = fed ? b.fedBeat : b.chokedBeat;
  if (at < 0) return null;
  const since = beat - at + beatPhase;
  if (since < 0 || since >= RECEIPT_BEATS) return null;
  if (!fed) return RING_DOWN;
  return b.phase === "still" ? SWALLOWED : RING_HEALS;
}

export function drawThroatReceipt(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): void {
  const text = throatReceipt(b, beat, beatPhase);
  if (text === null) return;
  const at = Math.max(b.fedBeat, b.chokedBeat);
  const since = beat - at + beatPhase;
  ctx.save();
  ctx.globalAlpha = Math.min(1, RECEIPT_BEATS - since);
  ctx.font = RECEIPT_FONT;
  ctx.textAlign = "center";
  ctx.fillStyle = text === RING_DOWN ? PALETTE.venom : PALETTE.rock;
  const half = ctx.measureText(text).width / 2 + 4;
  const x = Math.max(half, Math.min(l.width - half, mouthX(l, cfg, b, beat, beatPhase)));
  const y = mouthY(l, cfg) + l.tile * RECEIPT_DROP;
  // The column's light runs under the mouth, so the words get a dark rim.
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.background;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
}
