import type { GooBody } from "./goo-body.js";
import { mix } from "./goo-noise.js";
import { SHADE } from "./goo-press.js";
import { GOO } from "./goo-style.js";
import { type Tone, toneHex } from "./soak-water.js";

/**
 * **ZIGZAG** — what a rub asks, drawn on its drop: the gesture itself, one
 * stroke of a zigzag for every turn the rub wants, top to bottom, so four
 * turns is a W and sixteen a tight scribble. Each turn lights the next stroke
 * green; `fresh` flashes the newest white. THE RUB LAB's one look, and every
 * rub on the field's since the owner, 14 October 2026: *about "rub lab":
 * apply "zigzag" and remove other variants. apply to all usages in game*
 * (`rub-drop.ts`; the lab's `rub-goo/zigzag.ts`).
 */
export function drawRubZigzag(
  ctx: CanvasRenderingContext2D,
  drawn: Pick<GooBody, "at" | "r">,
  turns: number,
  done: number,
  tone: Tone,
  /** How white the newest lit stroke still is, 0..1. */
  fresh = 0,
): void {
  const n = Math.max(1, turns);
  const col = toneHex(tone);
  const w = drawn.r * 0.64;
  const h = drawn.r * 0.66;
  const pt = (i: number) => ({
    x: drawn.at.x + (i % 2 === 0 ? -w : w),
    y: drawn.at.y - h + (2 * h * i) / n,
  });
  const thin = Math.max(0.7, drawn.r * (n > 8 ? 0.065 : 0.095));
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < n; i++) {
    const a = pt(i);
    const b = pt(i + 1);
    const lit = i < done;
    const flash = i === done - 1 ? fresh : 0;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    if (!lit) {
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = SHADE;
      ctx.lineWidth = thin * 1.9;
      ctx.stroke();
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = GOO.neon;
      ctx.lineWidth = thin;
      ctx.stroke();
      continue;
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = SHADE;
    ctx.lineWidth = thin * 2.6;
    ctx.stroke();
    ctx.strokeStyle = mix(col.hex, "#FFFFFF", 0.7 * flash);
    ctx.lineWidth = thin * (1.7 + flash);
    ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = thin * 4.5;
    ctx.strokeStyle = col.hex;
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
}

/** The wag a rub no thumb has touched calls with: three quick shakes each way, then a rest. */
export const SWAY = { wag: 0.24, wags: 3, round: 1.4 };

/** The wag `t` seconds into the call: signed, -1 leaning left to 1 right. It dwells
 * at each side and snaps across, a shake rather than a sway. */
export function rubSway(t: number): number {
  const s = Math.max(0, t) % SWAY.round;
  const span = SWAY.wag * SWAY.wags;
  if (s >= span + SWAY.wag * 0.5) return 0;
  const fade = s < span ? 1 : 1 - (s - span) / (SWAY.wag * 0.5);
  const w = Math.sin((2 * Math.PI * s) / SWAY.wag);
  return Math.sign(w) * Math.sqrt(Math.abs(w)) * fade;
}
