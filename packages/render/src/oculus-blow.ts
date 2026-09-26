import type { StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import { oculusRadius } from "./oculus-shape.js";
import { PALETTE } from "./palette.js";

/**
 * **THE OCULUS's own blow at the hull** (`boss-strike-look.ts`): the lens
 * does what a lens does. The light gathered in its face is let go as one
 * beam, as wide as the face where it leaves and pinched to a point where it
 * meets the column, so the whole blow reads as the eye focusing on the
 * spot the pair left open. It burns a white ring into the plating, and the
 * beam thins to a thread and goes out as the burn fades.
 */

export function oculusBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const reach = 1 - (1 - f.reach) ** 2;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const face = oculusRadius(f.l).face;
  // The tip, travelling down; the beam is a wedge from the face to it.
  const tip = { x: from.x + (to.x - from.x) * reach, y: from.y + (to.y - from.y) * reach };
  const dx = tip.x - from.x;
  const dy = tip.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  // Wide at the face, narrowing to a point; thinning to a thread as it goes out.
  const wide = face * (0.35 + 0.65 * fade);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const [share, hex, a] of [
    [1, PALETTE.red, 0.3],
    [0.5, PALETTE.redRim, 0.55],
    [0.18, PALETTE.hullRim, 0.9],
  ] as const) {
    const w = wide * share;
    ctx.fillStyle = rgba(hex, a * fade);
    ctx.beginPath();
    ctx.moveTo(from.x + nx * w, from.y + ny * w);
    ctx.lineTo(tip.x + nx * w * 0.08, tip.y + ny * w * 0.08);
    ctx.lineTo(tip.x - nx * w * 0.08, tip.y - ny * w * 0.08);
    ctx.lineTo(from.x - nx * w, from.y - ny * w);
    ctx.closePath();
    ctx.fill();
  }
  // The face lit from inside while it lets the light go.
  ctx.fillStyle = rgba(PALETTE.redRim, 0.45 * fade);
  ctx.beginPath();
  ctx.arc(from.x, from.y, face, 0, Math.PI * 2);
  ctx.fill();
  // The burn: a hot point, then a ring spreading along the plating.
  ctx.fillStyle = rgba(PALETTE.hullRim, fade);
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, tile * (0.12 + 0.18 * reach), 0, Math.PI * 2);
  ctx.fill();
  if (f.after > 0) {
    ctx.strokeStyle = rgba(PALETTE.redRim, 0.9 * fade);
    ctx.lineWidth = tile * 0.1;
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.3 + 1.5 * f.after),
      tile * (0.1 + 0.28 * f.after),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}
