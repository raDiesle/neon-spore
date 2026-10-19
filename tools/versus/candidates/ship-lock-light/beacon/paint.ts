import type { LockLightAt } from "../../../../../packages/render/src/lock-light-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/** How tall the stalk stands when the lock is ready, and the bulb on it, in tiles. */
const STALK = 0.95;
const BULB = 0.24;

/**
 * A beacon on a stalk out of the cannon's shoulder. While the lock rests it
 * grows out of the lobe, grey, as far as the rest has run; ready, it stands
 * full height and burns amber with a halo that swells on the beat.
 */
export function paintBeacon(ctx: CanvasRenderingContext2D, at: LockLightAt): void {
  const ready = at.charge >= 1;
  const rise = at.tile * STALK * (0.35 + 0.65 * at.charge);
  const x = at.x - at.tile * 0.42;
  const base = at.surface(x);
  const top = base - rise;
  const r = at.tile * BULB;
  ctx.save();
  ctx.strokeStyle = ready ? PALETTE.pod : "rgba(200, 190, 220, 0.55)";
  ctx.lineWidth = Math.max(1.5, at.tile * 0.07);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x, top);
  ctx.stroke();
  if (ready) {
    const swell = 1 + 0.35 * Math.max(0, 1 - at.beatPhase * 2.5);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = PALETTE.pod;
    ctx.beginPath();
    ctx.arc(x, top, r * 2.6 * swell, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(x, top, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFF4D6";
    ctx.beginPath();
    ctx.arc(x - r * 0.3, top - r * 0.3, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "rgba(60, 50, 80, 0.95)";
    ctx.strokeStyle = "rgba(200, 190, 220, 0.7)";
    ctx.lineWidth = Math.max(1, at.tile * 0.04);
    ctx.beginPath();
    ctx.arc(x, top, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
