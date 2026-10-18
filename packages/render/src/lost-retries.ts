import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { lostButtons } from "./lost-boxes.js";
import { PALETTE } from "./palette.js";

/**
 * The run's retries, under the lost screen's buttons, counting up by one.
 *
 * The owner, 18 October 2026: *retries must be much more visible and a cool
 * animation effect, which counts it up by one. I suggest to move it below the
 * buttons. And it is something negative.* It stood beside the wave's name as
 * `· 9 TRIES` in the name's own small type from 24 September, a count of every
 * try including the first, and it read as a footnote.
 *
 * **What it counts is retries, not tries**: the number the corner and the
 * balance sheet read (`World.retries`). The count goes up when the wave opens
 * again (`sim/wave-start.ts`), so this screen still holds the old number — and
 * that is the animation: the old number stands, then rolls up out of a window
 * and the new one is punched in from under it, with a red flash, a shake and a
 * `+1` rising off it. The number it lands on is the one the run will carry
 * into the retry.
 *
 * **Red, because it is a cost.** The heading's red and its cast shadow, and
 * nothing in the pod colour the buttons wear — the buttons are what to do and
 * this is what it cost.
 *
 * Stateless: every part is a function of the screen's age, which `openingKey`
 * resets on each loss (`opening-key.ts`), so both phones roll at once and a
 * restart leaves nothing behind.
 */

/** When it comes up — after the buttons have settled (`lost-answer.ts`). */
const APPEAR = 0.85;
const APPEAR_FOR = 0.25;
/** When the old number rolls out, and how long the roll takes. */
const TICK = 1.35;
const ROLL = 0.32;
/** The punch, the shake and the flash after the new number lands. */
const PUNCH_FOR = 0.35;
const SHAKE_PX = 5;
const FLASH_FOR = 0.7;
/** How long the `+1` takes to rise and go. */
const PLUS_FOR = 1.1;

/** The number's size, and the gap from the last button to its baseline. */
const NUM_PX = 72;
const GAP = 86;
const LABEL_GAP = 22;
/** The glow's radius: the heading's bloom's own, so `halo` bakes no sprite of
 * its own for it (`lost-words.ts`, `baked-growth.test.ts`). */
const GLOW = 62;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function numberFace(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  ctx.fillStyle = PALETTE.redDark;
  ctx.fillText(text, x, y + 4);
  ctx.fillStyle = PALETTE.red;
  ctx.fillText(text, x, y);
  const was = ctx.globalAlpha;
  ctx.globalAlpha = was * 0.35;
  ctx.fillStyle = PALETTE.redRim;
  ctx.fillText(text, x, y - 2);
  ctx.globalAlpha = was;
}

/** Where the number's baseline sits: under the lowest button. */
export function retriesBaseline(l: Layout, guided: boolean): number {
  const quit = lostButtons(l, guided).quit;
  return quit.y + quit.h + GAP;
}

export function drawLostRetries(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  v: { age: number; retries: number; guided: boolean },
): void {
  const shown = clamp01((v.age - APPEAR) / APPEAR_FOR);
  if (shown <= 0) return;
  const mid = l.width / 2;
  const y = retriesBaseline(l, v.guided);
  const roll = clamp01((v.age - TICK) / ROLL);
  // Eased so the roll snaps rather than drifts.
  const r = 1 - (1 - roll) ** 3;
  const landed = v.age - TICK - ROLL;
  const punch = landed >= 0 ? 1 - clamp01(landed / PUNCH_FOR) : 0;
  const flash = landed >= 0 ? 1 - clamp01(landed / FLASH_FOR) : 0;
  const shake = punch * SHAKE_PX * Math.sin(landed * 70);

  ctx.textAlign = "center";
  const lift = (1 - shown) * 10;

  // The steady glow behind it, and the burst when the count lands.
  halo(ctx, mid, y - NUM_PX * 0.35, GLOW, PALETTE.red, 0.12 * shown + 0.45 * flash);
  ctx.globalAlpha = shown;

  // Said for the number it lands on, so it never changes under the roll.
  ctx.font = '700 13px "Courier New",monospace';
  ctx.fillStyle = PALETTE.red;
  ctx.fillText(v.retries === 0 ? "R E T R Y" : "R E T R I E S", mid, y + LABEL_GAP + lift);

  // The window the numbers roll through: one number tall, so the old one
  // leaves out of the top and the new one comes up from the foot — which is
  // the baseline, so the new number rises out from above the word and never
  // across it. Only while it rolls: the punch after it is let grow freely.
  ctx.save();
  if (r < 1) {
    ctx.beginPath();
    ctx.rect(0, y - NUM_PX * 1.2, l.width, NUM_PX * 1.2 + 6);
    ctx.clip();
  }
  ctx.font = `700 ${NUM_PX}px "Courier New",monospace`;
  const travel = NUM_PX * 1.1;
  if (r < 1) {
    ctx.globalAlpha = shown * (1 - r);
    numberFace(ctx, String(v.retries), mid, y + lift - travel * r);
  }
  if (r > 0) {
    ctx.globalAlpha = shown * r;
    const s = 1 + 0.4 * punch;
    ctx.translate(mid + shake, y + travel * (1 - r));
    ctx.scale(s, s);
    numberFace(ctx, String(v.retries + 1), 0, 0);
  }
  ctx.restore();

  // The `+1`, off the number's shoulder, rising and going.
  const plus = landed >= 0 ? clamp01(landed / PLUS_FOR) : -1;
  if (plus >= 0 && plus < 1) {
    ctx.globalAlpha = 1 - plus;
    ctx.font = '700 26px "Courier New",monospace';
    ctx.fillStyle = PALETTE.redRim;
    ctx.fillText("+1", mid + NUM_PX * 0.85, y - NUM_PX * 0.55 - plus * 30);
  }

  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}
