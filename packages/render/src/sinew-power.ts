import type { SinewState } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Circle } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **What a hand's pull is worth, on the handle it is worth it on** — THE
 * SINEW's shifting fibre (`sim/sinew-shift.ts`), drawn so it cannot be
 * missed (the owner, 5 October 2026: *this must be visual very clear and with
 * some 1 beat announcement for which player and if reducing or increasing*).
 *
 * - **In force**: a strong hand's handle wears a thick gold ring and the word
 *   `STRONG` beside it, a weak one's a broken grey ring and `WEAK`; a whole
 *   hand wears nothing, so off the shifting fibre the handles are as they were.
 * - **Called**, the beat before a shift, on the hand that is about to change
 *   and only that one: the coming word with an arrow — `▲ STRONG`, `▼ WEAK`,
 *   `NORMAL` — blinking twice, and a ring in the coming colour closing in
 *   from twice the handle's size onto it over the beat, so the change lands
 *   the moment the ring does.
 *
 * Both handles on both screens, beside the handle and on its outer side: the
 * left is player 1's and the right player 2's, so *which player* is where the
 * word stands, and *more or less* is the word.
 */

const GOLD = PALETTE.pod;
const GREY = PALETTE.dim;
/** The ring's radius as a share of the handle's, and the closing ring's start. */
const RING = 1.4;
const CALL_FROM = 2.3;
const FONT = '700 16px "Courier New",monospace';

/**
 * The label, the arrow and the colour for one power. A reading of the handle
 * and not a cue: it says what the hand is worth, and asks no gesture of the
 * thumb (`decisions.md` #34's rule is for cues, `cue-verbs.test.ts`).
 */
function look(permille: number): { label: string; arrow: string; hex: string } {
  if (permille > 1000) return { label: "STRONG", arrow: "▲ ", hex: GOLD };
  if (permille < 1000) return { label: "WEAK", arrow: "▼ ", hex: GREY };
  return { label: "NORMAL", arrow: "", hex: PALETTE.text };
}

function ring(ctx: CanvasRenderingContext2D, head: Circle, r: number, permille: number, a = 1) {
  const p = new Path2D();
  p.arc(head.x, head.y, r, 0, Math.PI * 2);
  const { hex } = look(permille);
  if (permille > 1000) {
    strokeGlow(ctx, p, hex, head.r * 0.22, 1.4, a);
  } else {
    ctx.save();
    ctx.setLineDash([head.r * 0.35, head.r * 0.3]);
    ctx.globalAlpha = a;
    ctx.strokeStyle = hex;
    ctx.lineWidth = head.r * 0.12;
    ctx.stroke(p);
    ctx.restore();
  }
}

function word(
  ctx: CanvasRenderingContext2D,
  head: Circle,
  side: -1 | 1,
  text: string,
  hex: string,
  a: number,
): void {
  ctx.save();
  ctx.font = FONT;
  ctx.textBaseline = "middle";
  ctx.textAlign = side < 0 ? "right" : "left";
  const x = head.x + side * head.r * (RING + 0.35);
  const w = ctx.measureText(text).width;
  const left = side < 0 ? x - w : x;
  ctx.globalAlpha = a * 0.85;
  ctx.fillStyle = rgba(PALETTE.background, 0.85);
  ctx.fillRect(left - 5, head.y - 11, w + 10, 22);
  ctx.globalAlpha = a;
  ctx.fillStyle = hex;
  ctx.fillText(text, x, head.y + 1);
  ctx.restore();
}

/**
 * One handle's power. `side` is which handle (`-1` player 1's), `beatPhase`
 * how far through the beat — what the call's ring closes and blinks on.
 */
export function drawSinewPower(
  ctx: CanvasRenderingContext2D,
  s: SinewState,
  head: Circle,
  side: -1 | 1,
  beatPhase: number,
): void {
  const now = side < 0 ? s.powerP1Permille : s.powerP2Permille;
  const call = side < 0 ? s.callP1Permille : s.callP2Permille;
  const calling = call > 0 && call !== now;
  if (now === 1000 && !calling) return;
  if (now !== 1000) ring(ctx, head, head.r * RING, now, calling ? 0.5 : 1);
  if (!calling) {
    const { label, hex } = look(now);
    word(ctx, head, side, label, hex, 1);
    return;
  }
  const coming = look(call);
  const r = head.r * (CALL_FROM - (CALL_FROM - RING) * beatPhase);
  ring(ctx, head, r, call, 0.5 + 0.5 * beatPhase);
  const blink = Math.cos(beatPhase * Math.PI * 4) > -0.3 ? 1 : 0.25;
  word(ctx, head, side, coming.arrow + coming.label, coming.hex, blink);
}
