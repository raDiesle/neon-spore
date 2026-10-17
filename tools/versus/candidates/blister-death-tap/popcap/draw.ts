import {
  type BlisterDying,
  bendAbout,
  during,
} from "../../../../../packages/render/src/blister-death.js";
import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * POPCAP: the button comes off. The blow springs the yellow press out of the
 * body like a cap off a bottle — up, turning, and away to one side — and the
 * body, left with nothing in its middle, sags and slumps back into its pore.
 */
export function drawPopcap(d: BlisterDying): void {
  const { ctx, x, y, r, poreY } = d;
  const side = sinHash(d.seed) < 0.5 ? -1 : 1;
  // The body: a jolt up as the cap leaves it, then the air goes out of it.
  const jolt = Math.sin(Math.PI * during(d.at, 0, 0.18));
  const sag = smoothstep(during(d.at, 0.15, 0.7));
  const sink = during(d.at, 0.45, 0.9);
  const sy = 1 + 0.18 * jolt - 0.45 * sag;
  const sx = 1 - 0.08 * jolt + 0.2 * sag;
  ctx.save();
  ctx.globalAlpha *= 1 - during(d.at, 0.85, 1);
  d.body(1 - sink * sink, bendAbout(x, poreY, { sx, sy, turn: side * 0.12 * sag }));
  ctx.restore();
  // The cap: thrown up and out, turning, falling past where it started.
  const t = d.age;
  const dx = side * r * 2.6 * t;
  const dy = -r * 5.2 * t + r * 7.5 * t * t;
  const turn = side * Math.PI * 3.2 * t;
  d.control(
    1 - during(d.at, 0.7, 1),
    bendAbout(x, y, { dx, dy, turn, sx: 1 - 0.25 * d.at, sy: 1 - 0.25 * d.at }),
  );
  burst(ctx, x, y, r, d.seed, during(d.at, 0, 0.3));
}

/** Six yellow sparks out of the socket the cap left. */
function burst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  seed: number,
  t: number,
): void {
  if (t <= 0 || t >= 1) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.12 * (1 - t);
  ctx.strokeStyle = rgba(PALETTE.lamp, 1 - t);
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.45 + (sinHash(seed, i) - 0.5) * 0.3;
    const from = r * (0.5 + 1.2 * t);
    const to = from + r * 0.5;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * from, y + Math.sin(a) * from);
    ctx.lineTo(x + Math.cos(a) * to, y + Math.sin(a) * to);
    ctx.stroke();
  }
  ctx.restore();
}
