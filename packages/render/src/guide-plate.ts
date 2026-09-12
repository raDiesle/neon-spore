import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { drawLobeGloss, drawLobeSocket } from "./lobe-shell.js";
import { drawNavFeeder, navBlob } from "./nav-button.js";

/**
 * The body under the corner plate's words (`guide-switch.ts`): the panel's
 * button, stretched to a plate. Its own file when the words' file reached the
 * length ceiling — the words are argued about (what the plate says, how big,
 * where) far more often than the recipe under them, which is the band's.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The body under the words: the panel's button, stretched to a plate.
 *
 * Every line of it is the recipe a control on the band is drawn by — the round
 * socket and the round gloss become the long ones inside a horizontal stretch,
 * which is the same bargain `nav-button.ts` makes and the reason neither has to
 * bake a second set of sprites.
 */
export function drawPlate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  box: Box,
  hex: string,
  flash: number,
  age: number,
): void {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const r = box.h / 2;

  if (flash > 0) halo(ctx, cx, cy, box.w * 0.8, hex, 0.5 * flash);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(box.w / box.h, 1);
  drawLobeSocket(ctx, 0, 0, r, l.dpr, undefined, false);
  const body = ctx.createLinearGradient(0, -r, 0, r);
  body.addColorStop(0, tint(hex, 0.24 + 0.4 * flash));
  body.addColorStop(0.55, tint(hex, 0.1 + 0.24 * flash));
  body.addColorStop(1, "rgba(8,5,20,.96)");
  ctx.fillStyle = body;
  const path = navBlob(box.h, box.h);
  ctx.fill(path);
  ctx.strokeStyle = hex;
  ctx.lineWidth = 1.6 + 1.6 * flash;
  ctx.globalAlpha = 0.55 + 0.45 * flash;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
  drawLobeGloss(ctx, 0, 0, r, l.dpr);
  ctx.restore();

  // Fed from underneath rather than from above: nothing hangs over the top of
  // the screen, and a plate in this game is still not a thing that simply sits
  // where it was put (`band-slime.ts`).
  const foot = box.y + box.h;
  for (const [i, at] of [0.3, 0.68].entries()) {
    drawNavFeeder(ctx, box.x + box.w * at, foot - 2, foot + 11, hex, age * 1.1 + i * 2.3);
  }
}

/** `#RRGGBB` at an alpha, for a gradient that has to carry the seat's colour. */
function tint(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
