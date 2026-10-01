import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { RoundStrikeFrame } from "./round-strike-look.js";
import { fuseColours } from "./slow-fuse.js";

/**
 * The round's window closing on the ship. A bar of light as wide as the field
 * comes down from where the rock would have appeared, narrowing to one tile
 * over the struck column as it falls; it pinches into a spike over the last
 * fifth of the fall, and once it has reached the skin it runs out along the
 * membrane as a flat ring while `after` goes to 1.
 *
 * The colour is a fuse's last quarter (`slow-fuse.ts`, `fuseColours(0)`): THE
 * SLOW's picture of time about to run out, so the hit reads as the window and
 * not as stone. Flat, no rig: the whole shape is the argument.
 */

/** Where the fall starts to pinch, as a share of `reach`. */
const PINCH = 0.8;

/** The bar's thickness and the ring's widest reach, in tiles. */
const BAR = 0.28;
const RING = 2.6;

const ease = (t: number): number => 1 - (1 - t) * (1 - t);

export function paintWindow(ctx: CanvasRenderingContext2D, f: RoundStrikeFrame): void {
  const { l, from, to, reach, after, tile } = f;
  const { body, core } = fuseColours(0);
  const mid = l.gridLeft + l.gridWidth / 2;
  const k = ease(reach);
  const x = mid + (to.x - mid) * k;
  const y = from.y + (to.y - from.y) * reach;
  const half = (l.gridWidth / 2) * (1 - k) + tile / 2;
  const fade = 1 - after;
  ctx.save();
  // The window behind the bar: what it has swept, from the whole field at the
  // top to the bar's own width, so the closing is on the screen as a shape.
  ctx.fillStyle = rgba(body, 0.16 * fade);
  ctx.beginPath();
  ctx.moveTo(l.gridLeft, from.y);
  ctx.lineTo(l.gridLeft + l.gridWidth, from.y);
  ctx.lineTo(x + half, y);
  ctx.lineTo(x - half, y);
  ctx.closePath();
  ctx.fill();
  // The spike: the bar's middle drawn down to the skin as the fall pinches.
  const pinch = Math.max(0, (reach - PINCH) / (1 - PINCH));
  if (pinch > 0) {
    const tipY = y + (to.y - y) * pinch;
    ctx.fillStyle = rgba(core, 0.9 * fade);
    ctx.beginPath();
    ctx.moveTo(x - half, y);
    ctx.lineTo(x + half, y);
    ctx.lineTo(x, Math.max(tipY, y + tile * 0.5 * pinch));
    ctx.closePath();
    ctx.fill();
  }
  // The bar itself, hot at its core.
  const thick = tile * BAR * (1 - 0.5 * pinch);
  ctx.fillStyle = rgba(body, 0.85 * fade);
  ctx.fillRect(x - half, y - thick / 2, half * 2, thick);
  ctx.fillStyle = rgba(core, fade);
  ctx.fillRect(x - half * 0.9, y - thick / 6, half * 1.8, thick / 3);
  if (after > 0) {
    // The ring along the membrane: flat, because it runs along the skin and
    // not out of it, and gone by the time `after` is.
    const rx = tile * (0.5 + RING * ease(after));
    ctx.strokeStyle = rgba(body, 0.9 * fade);
    ctx.lineWidth = tile * 0.12 * (1 + fade);
    ctx.beginPath();
    ctx.ellipse(to.x, to.y, rx, rx * 0.16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = rgba(core, fade);
    ctx.lineWidth = tile * 0.04;
    ctx.stroke();
  }
  ctx.restore();
  halo(ctx, x, y, tile * (1.2 + pinch), body, 0.5 * fade);
}
