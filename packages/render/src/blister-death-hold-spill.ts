import { bendAbout, during } from "./blister-bend.js";
import type { BlisterDying } from "./blister-death.js";
import { smoothstep } from "./ease.js";
import { signedHash, sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * SPILL: held so long the drop bursts. It swells in the body's grip and
 * breaks into a crown of water, cyan against the green body, thrown up and
 * out; the drops come down round the pore and lie there as splashes, while
 * the body flinches and drops back into its hole.
 */
export function drawSpill(d: BlisterDying): void {
  const { ctx, x, y, r, poreY } = d;
  const flinch = Math.sin(Math.PI * during(d.at, 0.1, 0.32));
  const sink = smoothstep(during(d.at, 0.25, 0.75));
  ctx.save();
  ctx.globalAlpha *= 1 - during(d.at, 0.7, 0.85);
  d.body(1 - sink, bendAbout(x, poreY, { sx: 1 + 0.25 * flinch, sy: 1 - 0.22 * flinch }));
  ctx.restore();
  const swell = smoothstep(during(d.at, 0, 0.12));
  d.control(
    1 - during(d.at, 0.1, 0.16),
    bendAbout(x, y, { sx: 1 + 0.6 * swell, sy: 1 + 0.6 * swell }),
  );
  crown(ctx, d, x, y, poreY, r);
}

/** Eleven drops thrown off the burst, and where each one lands. */
function crown(
  ctx: CanvasRenderingContext2D,
  d: BlisterDying,
  x: number,
  y: number,
  floor: number,
  r: number,
): void {
  const t = d.age - 0.12;
  if (t <= 0) return;
  const fade = 1 - during(d.at, 0.8, 1);
  ctx.save();
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI / 2 + ((i - 5) / 5) * 1.25 + signedHash(d.seed, i) * 0.15;
    const speed = r * (4.5 + 2.5 * sinHash(d.seed, i, 1));
    const vx = Math.cos(a) * speed;
    const vy = Math.sin(a) * speed;
    const g = r * 22;
    // Lands on the skin a little either side of the pore, and lies there.
    const land = floor + r * 0.3 * signedHash(d.seed, i, 2);
    const tLand = (-vy + Math.sqrt(vy * vy + 2 * g * (land - y))) / g;
    const tt = Math.min(t, tLand);
    const px = x + vx * tt;
    const py = y + vy * tt + 0.5 * g * tt * tt;
    const size = r * (0.16 + 0.08 * sinHash(d.seed, i, 3));
    ctx.beginPath();
    if (t < tLand) {
      ctx.ellipse(
        px,
        py,
        size,
        size * 1.3,
        Math.atan2(vy + g * tt, vx) + Math.PI / 2,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = rgba(PALETTE.cyan, 0.95 * fade);
    } else {
      const spread = 1 + 0.6 * Math.min(1, (t - tLand) * 6);
      ctx.ellipse(px, py, size * 1.6 * spread, size * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(PALETTE.cyan, 0.7 * fade);
    }
    ctx.fill();
    ctx.lineWidth = r * 0.06;
    ctx.strokeStyle = rgba(PALETTE.cyanDark, 0.9 * fade);
    ctx.stroke();
  }
  ctx.restore();
}
