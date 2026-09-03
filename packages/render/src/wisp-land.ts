import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The two ends of THE WISP's jump as they show on the *tile*: the ring that
 * closes on the square it is about to leave, and the shock that goes out
 * across the square it comes down on.
 *
 * Split off `wisp-ground.ts` at the line that file's subject already divides
 * along: everything left there is about the flight — the pool under the body,
 * the arc, the tile being aimed at — and these two are what happens at rest,
 * one at each end of it. Both are behind `showsWisp`, which `drawCreatures`
 * asks once before any of this runs.
 */

const TAU = Math.PI * 2;

/**
 * The landing: two rings going out across the tile and a scatter of droplets,
 * over the head of the beat after the touchdown.
 *
 * It is on the *tile* rather than on the body, and that is the whole of why it
 * is worth drawing: the pair has just been told a square, and this is the
 * square answering. The rings start small and hard and end wide and gone,
 * which is the one shape an impact has.
 */
export function drawImpact(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  to: { x: number; y: number },
  land: number,
): void {
  // `land` runs 1 at the instant of impact down to 0, so the rings read it
  // backwards: `u` is how far the shock has travelled.
  const u = 1 - land;
  ctx.save();
  ctx.lineCap = "round";
  for (const [ring, hex] of [
    [1, PALETTE.wispRim],
    [0.62, PALETTE.cyan],
  ] as const) {
    const rx = l.tile * (0.2 + 1.15 * u) * ring;
    ctx.strokeStyle = hex;
    ctx.lineWidth = Math.max(1.4, l.tile * 0.07 * land);
    ctx.globalAlpha = land * 0.85 * ring;
    ctx.beginPath();
    ctx.ellipse(to.x, to.y, rx, rx * 0.3, 0, 0, TAU);
    ctx.stroke();
  }

  // Droplets thrown off the rim. Six, on fixed bearings rather than a random
  // scatter: `sim` owns the only stream two devices agree about, and a splash
  // that rolled its own would be a different splash on each phone.
  ctx.fillStyle = PALETTE.wispRim;
  ctx.globalAlpha = land * 0.8;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.4;
    const d = l.tile * (0.3 + 0.9 * u);
    const dx = Math.cos(a) * d;
    // Up and out, then down: a droplet that only went sideways would read as a
    // ring drawn in dots.
    const dy = Math.sin(a) * d * 0.3 - l.tile * 0.5 * Math.sin(Math.PI * u);
    ctx.beginPath();
    ctx.arc(to.x + dx, to.y + dy, Math.max(1, l.tile * 0.05 * land), 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  halo(ctx, to.x, to.y, l.tile * (0.9 + u), PALETTE.wisp, 0.45 * land);
}

/**
 * The gather: one ring drawing *inward* on the tile it is about to leave.
 *
 * The landing's shape with the sign turned round, and deliberately — an
 * expanding ring is something arriving and a closing one is something winding
 * up. It is also the only warning player 2 gets that the tile they are
 * currently calling is about to expire, which is worth a quarter of a beat's
 * notice.
 */
export function drawGather(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: { x: number; y: number },
  crouch: number,
): void {
  const rx = l.tile * (0.85 - 0.5 * crouch);
  ctx.save();
  ctx.strokeStyle = PALETTE.wisp;
  ctx.lineWidth = Math.max(1.2, l.tile * 0.05);
  ctx.globalAlpha = 0.25 + 0.5 * crouch;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, rx, rx * 0.3, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}
