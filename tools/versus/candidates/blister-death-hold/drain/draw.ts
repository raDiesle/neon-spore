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
 * DRAIN: held until it ran dry. The green drop it was holding shrinks to
 * nothing as a thin stream of water runs out of it down into the pore, and
 * the body, emptied, wilts over to one side and slides down after it.
 */
export function drawDrain(d: BlisterDying): void {
  const { ctx, x, y, r, poreY } = d;
  const side = sinHash(d.seed, 3) < 0.5 ? -1 : 1;
  const wilt = smoothstep(during(d.at, 0.05, 0.5));
  const sink = smoothstep(during(d.at, 0.3, 0.9));
  ctx.save();
  ctx.globalAlpha *= 1 - during(d.at, 0.85, 1);
  d.body(
    1 - sink,
    bendAbout(x, poreY, { sx: 1 - 0.15 * wilt, sy: 1 - 0.4 * wilt, turn: side * 0.5 * wilt }),
  );
  ctx.restore();
  const empty = smoothstep(during(d.at, 0, 0.55));
  d.control(1 - empty, bendAbout(x, y, { sx: 1 - 0.75 * empty, sy: 1 - 0.75 * empty }));
  stream(ctx, x, y, poreY, r, d.at);
}

/** The water running out: drops strung from the drop's middle to the pore. */
function stream(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  bottom: number,
  r: number,
  at: number,
): void {
  const on = during(at, 0.02, 0.12) * (1 - during(at, 0.55, 0.75));
  if (on <= 0) return;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.good, 0.9 * on);
  ctx.strokeStyle = rgba(PALETTE.goodRim, 0.8 * on);
  ctx.lineWidth = r * 0.05;
  const fall = bottom - top;
  for (let i = 0; i < 7; i++) {
    // Each drop runs top to bottom over a fifth of the death, one after another.
    const k = (at * 5 + i / 7) % 1;
    const dy = top + fall * k * k;
    const size = r * (0.16 - 0.05 * k);
    ctx.beginPath();
    ctx.ellipse(x, dy, size * 0.8, size * (1 + k), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // And the stream itself, a thread from the drop to the hole.
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.lineWidth = r * 0.07 * on;
  ctx.strokeStyle = rgba(PALETTE.good, 0.55 * on);
  ctx.stroke();
  ctx.restore();
}
