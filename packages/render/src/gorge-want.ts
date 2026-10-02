import type { GorgeIntake } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What a bubble of THE GORGE wants, poured into it** — on the navigator's
 * screen only (`gorge-draw.ts`, `showsGorgeNearest`). The floor's glow alone
 * read as a faint rim at the size a phone draws a lobe, and the colour is
 * the half of the sentence that is hers to say, so it fills the lobe.
 *
 * **A bubble wanting both is two-tone, split at its share**: red from the
 * bottom up to the share of its shots that are red, cyan above — the order
 * the beads stack in (`gorge-lobe.ts`), so a fed bubble fills to the line.
 * The share is all she is shown; *how many* is the pilot's (`drawTally`),
 * and the two of them make the split between them.
 */

/** How strong the colour is at the bottom of a lobe, and at its top. */
const DEEP = 0.62;
const SHALLOW = 0.3;

/** The red share of a bubble's shots, 0..1: 1 for a red one, 0 for a cyan one. */
export function gorgeRedShare(k: GorgeIntake): number {
  const total = k.needRed + k.needCyan;
  return total > 0 ? k.needRed / total : 0;
}

export function paintLobeWant(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  k: GorgeIntake,
  x: number,
  cy: number,
  rx: number,
  ry: number,
  tile: number,
): void {
  const share = gorgeRedShare(k);
  const bottom = cy + ry;
  const top = cy - ry;
  const g = ctx.createLinearGradient(0, bottom, 0, top);
  if (share >= 1 || share <= 0) {
    const hex = share >= 1 ? PALETTE.red : PALETTE.cyan;
    g.addColorStop(0, rgba(hex, DEEP));
    g.addColorStop(1, rgba(hex, SHALLOW));
  } else {
    const mid = (DEEP + SHALLOW) / 2;
    g.addColorStop(0, rgba(PALETTE.red, DEEP));
    g.addColorStop(share, rgba(PALETTE.red, mid));
    g.addColorStop(share, rgba(PALETTE.cyan, mid));
    g.addColorStop(1, rgba(PALETTE.cyan, SHALLOW));
  }
  ctx.save();
  ctx.fillStyle = g;
  ctx.fill(body);
  if (share > 0 && share < 1) {
    // The line between the two, across the lobe, so the share reads at a glance.
    const y = bottom - (bottom - top) * share;
    ctx.clip(body);
    ctx.fillStyle = PALETTE.text;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x - rx, y - tile * 0.02, rx * 2, tile * 0.04);
  }
  ctx.restore();
}
