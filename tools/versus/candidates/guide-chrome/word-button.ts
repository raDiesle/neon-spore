import { halo } from "../../../../packages/render/src/glow.js";
import type { NavBox } from "../../../../packages/render/src/guide-nav.js";
import { drawBeads, drawNavBody } from "../../../../packages/render/src/nav-button.js";
import { PALETTE } from "../../../../packages/render/src/palette.js";
import type { SeatSkin } from "../../../../packages/render/src/seat-skin.js";

/**
 * What every `guide:chrome` candidate's bar has in common: a grown body with
 * a word on it, the arrow beside the word, and the row of dots that counts
 * the pages. A file, not a directory — a directory under a slot is read as a
 * candidate (`tools/versus/registry.ts`).
 *
 * The owner's one firm ask of the bar was that NEXT *say "Next" in text
 * also, to be easier to find and to click*; the shipped bar carries signs
 * only (`packages/render/src/nav-button.ts`). So the word is the thing the
 * candidates share, and each one decides where it goes and how big it is.
 */

export interface WordBody extends NavBox {
  live: boolean;
  hex: string;
  glow: number;
  hover: boolean;
  dpr: number;
  lip: SeatSkin["lip"];
}

/** The panel's grown body with a word on it and a grown arrow beside the word. */
export function wordButton(
  ctx: CanvasRenderingContext2D,
  p: WordBody,
  word: string,
  dir: 1 | -1,
  font: string,
  size: number,
): void {
  drawNavBody(ctx, p);
  const lit = p.live && p.hover;
  ctx.font = font;
  ctx.fillStyle = p.live ? (lit || p.glow > 0 ? "#FFF6E4" : p.hex) : "#3A3160";
  ctx.textAlign = "center";
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  const tw = ctx.measureText(word).width;
  const r = size * (1 + 0.12 * p.glow);
  const shift = dir * (r + 4) * 0.5;
  ctx.fillText(word, cx - shift, cy + size * 0.65);
  arrow(ctx, cx + dir * (tw / 2 + 5 + r * 0.5) - shift, cy, r, dir);
  if (p.live) drawBeads(ctx, cx + dir * (tw / 2 + 5) - shift, cy + r * 1.05, r);
  ctx.textAlign = "left";
}

/** A grown arrow: blunt head, concave back, no straight edge. */
export function arrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  dir: 1 | -1,
): void {
  ctx.beginPath();
  ctx.moveTo(x - dir * r * 0.5, y - r);
  ctx.quadraticCurveTo(x + dir * r * 0.3, y - r * 0.4, x + dir * r * 0.8, y);
  ctx.quadraticCurveTo(x + dir * r * 0.3, y + r * 0.4, x - dir * r * 0.5, y + r);
  ctx.quadraticCurveTo(x + dir * r * 0.06, y, x - dir * r * 0.5, y - r);
  ctx.closePath();
  ctx.fill();
}

/** The pages as a row of dots, the one being read lit; `spread` is the row's widest. */
export function dots(
  ctx: CanvasRenderingContext2D,
  page: number,
  pages: number,
  mid: number,
  cy: number,
  spread = 220,
): void {
  const gap = Math.min(18, Math.max(9, spread / Math.max(1, pages)));
  const from = mid - ((pages - 1) * gap) / 2;
  for (let i = 0; i < pages; i++) {
    const here = i === page;
    if (here) halo(ctx, from + i * gap, cy, 10, PALETTE.pod, 0.5);
    ctx.fillStyle = here ? PALETTE.pod : "#332B57";
    ctx.beginPath();
    ctx.arc(from + i * gap, cy, here ? 4.6 : 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
}
