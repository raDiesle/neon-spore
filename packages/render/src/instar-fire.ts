import { halo } from "./glow.js";
import { faded } from "./instar-plate.js";
import { PALETTE } from "./palette.js";

/**
 * **The fire in THE INSTAR's mouth**: a ball of flame turning on itself in
 * the middle of the open jaws, growing as the window runs.
 *
 * The owner, 25 September 2026: *we can see like rotating fireball already
 * growing bigger in the middle of mouth, and we have to close the mouth, so
 * he cant spit out the fire*. So the ball is there from the moment the mouth
 * is — small while the body flies in — and grows with the window
 * (`instarThreat`), and it can never be bigger than the gap between the two
 * lips: as the pair push the jaws together the fire is squeezed out, and
 * with the mouth shut there is none (`instar-head.ts`). What it does when
 * they do not is `instar-strike.ts`.
 */

/** Arms of flame turning round the core. */
const ARMS = 5;

/** A halo's radius is cached per size, so the sizes come from a short ladder. */
const HALO_STEP = 6;

export function drawFireball(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  fade: number,
): void {
  if (radius < 1) return;
  const lit = Math.max(1, Math.round((radius * 2.2) / HALO_STEP)) * HALO_STEP;
  halo(ctx, x, y, lit, PALETTE.ember, 0.7 * fade);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.ember, fade, 0.9);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  // The arms: spirals out of the core, turning, each tapering to a tongue.
  ctx.lineCap = "round";
  for (let i = 0; i < ARMS; i++) {
    const a0 = time * 3.2 + (i * Math.PI * 2) / ARMS;
    ctx.strokeStyle = faded(i % 2 === 0 ? PALETTE.pod : PALETTE.emberRim, fade, 0.9);
    ctx.lineWidth = Math.max(1, radius * 0.22);
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) {
      const u = k / 6;
      const a = a0 + u * 2.2;
      const d = radius * (0.2 + 0.95 * u);
      if (k === 0) ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
      else ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    ctx.stroke();
  }
  // The white-hot heart, flickering.
  ctx.fillStyle = faded(PALETTE.podRim, fade);
  ctx.beginPath();
  ctx.arc(x, y, radius * (0.36 + 0.05 * Math.sin(time * 17)), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
