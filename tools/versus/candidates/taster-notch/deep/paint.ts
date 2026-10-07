import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { TasterState } from "../../../../../packages/sim/src/index.js";

/**
 * How far on gap `i` is: its own cuts out of the four that open the crest,
 * rather than every gap's together (`TasterBlade.cuts`, 7 October 2026).
 */
export function deepWet(t: TasterState, i: number, crestCuts: number): number {
  return Math.min(1, (t.blades[i]?.cuts ?? 0) / Math.max(1, crestCuts));
}

/**
 * The gap at its own depth: the game's own notch where the blade came off and
 * nothing since, and cut down through the crest where the pair has worked it.
 * Wider, darker and wetter the deeper it goes, so the gaps the pilot has been
 * feeding read at a glance against the ones nobody has touched.
 */
export function paintDeep(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  thick: number,
  wet: number,
  breath: number,
): void {
  const w = tile * (0.32 + 0.14 * wet);
  // The curve's apex is half its control point: the game's own notch at
  // none, so an untouched gap still reads as the target it is, and down
  // through the crest and out under it at four.
  const deep = thick * (0.7 + 2.3 * wet);
  const dent = new Path2D();
  dent.moveTo(x - w, y);
  dent.quadraticCurveTo(x, y + deep, x + w, y);
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.55 * wet;
  ctx.fillStyle = PALETTE.background;
  ctx.fill(dent);
  ctx.clip(dent);
  ctx.lineWidth = tile * (0.1 + 0.08 * wet);
  ctx.strokeStyle = PALETTE.hull;
  ctx.globalAlpha = 0.55 + 0.35 * wet + 0.1 * breath;
  ctx.stroke(dent);
  ctx.restore();
  // The drop, sunk to the bottom of it and swollen with every cut.
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.35 + 0.55 * wet);
  ctx.beginPath();
  const r = tile * (0.035 + 0.05 * wet);
  ctx.ellipse(x - w * 0.15, y + deep * 0.42, r, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
