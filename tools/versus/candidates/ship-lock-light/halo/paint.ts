import { arcFromTop } from "../../../../../packages/render/src/arc-from-top.js";
import type { LockLightAt } from "../../../../../packages/render/src/lock-light-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/** The ring's radius round the cannon's mouth, and how far below the lobe's top its centre is, in tiles. */
const RING = 0.58;
const DROP = 0.22;

/**
 * The cannon's whole mouth ringed. While the lock rests the ring is a thin
 * grey track with amber sweeping round it as the rest runs; ready, it is a
 * thick amber ring with a glow that breathes on the beat — the gun itself
 * says it is armed.
 */
export function paintHalo(ctx: CanvasRenderingContext2D, at: LockLightAt): void {
  const x = at.x;
  const y = at.y + at.tile * DROP;
  const r = at.tile * RING;
  ctx.save();
  ctx.lineCap = "round";
  if (at.charge >= 1) {
    const swell = Math.max(0, 1 - at.beatPhase * 2.5);
    ctx.strokeStyle = PALETTE.pod;
    ctx.globalAlpha = 0.25 + 0.3 * swell;
    ctx.lineWidth = at.tile * (0.3 + 0.15 * swell);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = at.tile * 0.12;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeStyle = "rgba(200, 190, 220, 0.35)";
    ctx.lineWidth = at.tile * 0.06;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = PALETTE.pod;
    ctx.lineWidth = at.tile * 0.09;
    ctx.beginPath();
    arcFromTop(ctx, x, y, r, at.charge);
    ctx.stroke();
  }
  ctx.restore();
}
