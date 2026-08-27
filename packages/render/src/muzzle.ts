import type { HullSkin } from "./hull.js";
import type { HullFrame } from "./hull-frame.js";
import { surface } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The fire opening — the one place on the hull that two different things now
 * draw into. A pod is taken *in* through it and a shot is laid *out* of it,
 * so its geometry is its own file rather than a private detail of the ship.
 */

const MUZZLE_RY = 0.13;
const MUZZLE_RX_OPEN = 0.94;
/** How far below the tip the opening rests, before any of it is spent. */
const MUZZLE_DROP = 0.12;

/**
 * Where the fire opening's centre actually is, given how far the maw is open.
 *
 * **Call this; do not restate it.** It was a constant until the swallow was
 * reshaped, and `cannon-maw.ts` had copied the number under a comment saying
 * it was "`drawMuzzle`'s offset" — true when written, false the moment the
 * offset started easing to zero. Two things now draw into this mouth, the
 * shot being laid and the pod being taken in, and a wind-up that gathers its
 * bolt where the mouth *used to be* is the exact failure a second copy buys.
 */
export function muzzleCenterY(l: Layout, tipY: number, intake: number): number {
  return tipY + l.tile * MUZZLE_DROP * (1 - intake);
}

export function drawMuzzle(
  ctx: CanvasRenderingContext2D,
  f: HullFrame,
  l: Layout,
  intake: number,
  skin_: HullSkin,
): void {
  const tip = surface(f, f.cannonX);
  const cy = muzzleCenterY(l, tip.y, intake);
  const rx = l.tile * (0.13 + (MUZZLE_RX_OPEN - 0.13) * intake);
  const ry = l.tile * MUZZLE_RY;
  ctx.fillStyle = skin_.muzzle;
  ctx.beginPath();
  ctx.ellipse(tip.x, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = intake > 0.5 ? PALETTE.podRim : skin_.edge;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
}

/** Where a shot leaves the hull, so the bullet starts at the muzzle. */
