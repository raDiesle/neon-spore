import { halo, strokeGlow } from "./glow.js";
import { sinHash } from "./hash.js";
import { PALETTE } from "./palette.js";

/**
 * **THE HIVE's spores, swarming round each open breach**: a cloud of glowing
 * motes circling the wound, each at its own speed and size and trailing
 * light, rising and falling as it goes. It is SPORES, the look VERSUS offered
 * for a shot's mark on 6 October 2026; the owner, 9 October 2026, of the
 * `aim:cannon` candidates he did not take for the mark: *I like the other
 * animations … a lot … apply it to some boss visuals … just one animation
 * visual for one boss.*
 *
 * In the hive's own bile and never a fire button's colour, and the same on
 * both screens: which colour a breach wants is what one screen keeps from the
 * other (`hive-sites.ts`), and a red swarm would tell it.
 */

const SPORES = 11;

/**
 * The swarm round a breach at `(x, y)`, sized by `tile` — a breach is a few
 * pixels across, and a swarm sized by it was dust — at `fade` for the mass's turn.
 */
export function drawHiveSpores(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  time: number,
  fade: number,
): void {
  if (fade <= 0) return;
  // The plain hex, faded by alpha, so the halo's sprite cache keeps one entry.
  const hex = PALETTE.bile;
  const trails = new Path2D();
  const dots: [number, number, number][] = [];
  for (let i = 0; i < SPORES; i++) {
    const u = sinHash(i + 11);
    // Half one way round and half the other, so it is a swarm and not a wheel.
    const speed = (i % 2 === 0 ? 1 : -1) * (0.6 + 0.8 * u);
    const a = (i / SPORES) * Math.PI * 2 + time * speed;
    const m = tile * (0.72 + 0.14 * Math.sin(1.9 * time + i * 2.3) + 0.12 * u);
    // Flatter than round, the way the lobe hangs.
    const px = x + Math.cos(a) * m;
    const py = y + Math.sin(a) * m * 0.7;
    const size = tile * (0.06 + 0.06 * u) * (0.8 + 0.2 * Math.sin(5 * time + i));
    dots.push([px, py, size]);
    const tail = (0.3 + 0.25 * u) * Math.sign(speed);
    trails.moveTo(px, py);
    trails.ellipse(x, y, m, m * 0.7, 0, a, a - tail, speed > 0);
  }
  strokeGlow(ctx, trails, PALETTE.bileRim, 1, 1.2 * fade, 0.6 * fade, 5);
  for (const [px, py, size] of dots) halo(ctx, px, py, size * 3.2, hex, 0.5 * fade);
  const body = new Path2D();
  const core = new Path2D();
  for (const [px, py, size] of dots) {
    body.moveTo(px + size, py);
    body.arc(px, py, size, 0, Math.PI * 2);
    core.moveTo(px + size * 0.45, py);
    core.arc(px, py, size * 0.45, 0, Math.PI * 2);
  }
  // A dark edge, so a spore over the wax is not lost in it.
  ctx.globalAlpha = 0.7 * fade;
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = 1.5;
  ctx.stroke(body);
  ctx.globalAlpha = fade;
  ctx.fillStyle = hex;
  ctx.fill(body);
  ctx.fillStyle = PALETTE.bileRim;
  ctx.fill(core);
  ctx.globalAlpha = 1;
}
