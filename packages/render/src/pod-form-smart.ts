import { faded } from "./pod-fade.js";
import { countSwell, drawShine, type PodDraw } from "./pod-pickup.js";
import { blinkAt, type Seed, seedAt } from "./pod-seed.js";
import { drawSeed } from "./pod-seed-draw.js";
import { FAKE_PAINT } from "./pod-seed-paint.js";

/**
 * **SMART** — THE SMART's seven studs on a smooth tumbling sphere, the seed
 * the rest of the pod's forms are built on; it flashes white and swells on
 * the count and the coin's shine crosses it (`pod-pickup.ts`).
 *
 * **Its fake is an EYE.** In dark blood-red, blinking red, and on the count
 * the seam parts like a lid and an eye looks out of it — a pickup that
 * watches you.
 */
export const drawSmartForm: PodDraw = (ctx, x, y, r, t, beatsLeft, fake) => {
  const s = seedAt(x, y, r, t, beatsLeft);
  const flash = blinkAt(t, beatsLeft);
  s.R *= 1 + 0.12 * flash;
  if (!fake) {
    drawSeed(ctx, s, { flash });
    drawShine(ctx, s, t);
    return;
  }
  drawSeed(ctx, s, { flash, paint: FAKE_PAINT });
  const open = countSwell(t, beatsLeft, 0.5);
  if (open > 0.05) eye(ctx, s, open);
};

/** An almond of pale white with a red iris and a black slit, `open` 0..1. */
function eye(ctx: CanvasRenderingContext2D, s: Seed, open: number) {
  const w = s.R * 0.85;
  const h = s.R * 0.55 * open;
  ctx.save();
  ctx.globalAlpha = faded(1);
  ctx.beginPath();
  ctx.moveTo(s.x - w, s.y);
  ctx.quadraticCurveTo(s.x, s.y - h * 2, s.x + w, s.y);
  ctx.quadraticCurveTo(s.x, s.y + h * 2, s.x - w, s.y);
  ctx.closePath();
  ctx.fillStyle = "#F4D8C0";
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = FAKE_PAINT.flashMid;
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.R * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.ellipse(s.x, s.y, s.R * 0.08, s.R * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
