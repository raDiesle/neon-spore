import {
  type BlisterDying,
  bendAbout,
  during,
} from "../../../../../packages/render/src/blister-death.js";
import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * SNAP: press, then pull, then gone. The body is pushed down once with a
 * yellow ring off the press, then stretched out along the pull like taffy,
 * anchored at its pore by a lit cord — until the cord snaps, the body flies
 * off the way it was pulled and the cord whips back into the hole.
 */
export function drawSnap(d: BlisterDying): void {
  const { ctx, x, y, r, poreY, way } = d;
  const press = Math.sin(Math.PI * during(d.at, 0, 0.2));
  const pull = smoothstep(during(d.at, 0.18, 0.5));
  const fly = during(d.at, 0.5, 1);
  const along = way.dx !== 0;
  // Stretched from its back edge, so the front is what travels.
  const backX = x - way.dx * r;
  const backY = poreY - way.dy * r;
  const stretch = 1 + 0.9 * pull - 0.7 * smoothstep(fly * 3);
  const go = d.tile * 2.4 * fly * fly;
  ctx.save();
  ctx.globalAlpha *= 1 - during(d.at, 0.7, 1);
  d.body(
    1,
    bendAbout(backX, backY, {
      sx: (along ? stretch : 1) * (1 + 0.3 * press),
      sy: (along ? 1 : stretch) * (1 - 0.4 * press),
      dx: way.dx * go,
      dy: way.dy * go - r * 1.2 * Math.sin(Math.PI * fly) * (along ? 1 : 0),
      turn: way.dx * 0.8 * fly,
    }),
  );
  ctx.restore();
  d.control(1 - during(d.at, 0.1, 0.25));
  ring(ctx, x, y, r, during(d.at, 0.05, 0.4));
  cord(ctx, d, pull, fly);
}

/** The press's ring, yellow, out from the body's middle. */
function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number): void {
  if (t <= 0 || t >= 1) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r * (0.7 + 1.4 * t), 0, Math.PI * 2);
  ctx.lineWidth = r * 0.18 * (1 - t);
  ctx.strokeStyle = rgba(PALETTE.lamp, 0.9 * (1 - t));
  ctx.stroke();
  ctx.restore();
}

/** The cord from the pore to the body's back: taut while pulled, whipping home once it snaps. */
function cord(ctx: CanvasRenderingContext2D, d: BlisterDying, pull: number, fly: number): void {
  const { x, r, poreY, way } = d;
  if (pull <= 0) return;
  const reach = r * (0.4 + 1.6 * pull) * (1 - smoothstep(fly * 2.5));
  if (reach <= r * 0.05) return;
  const wave = fly > 0 ? Math.sin(fly * 60) * r * 0.25 * (1 - fly) : 0;
  ctx.save();
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, poreY);
  ctx.quadraticCurveTo(
    x + way.dx * reach * 0.5 - way.dy * wave,
    poreY + way.dy * reach * 0.5 + way.dx * wave,
    x + way.dx * reach,
    poreY + way.dy * reach,
  );
  ctx.lineWidth = r * 0.14;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9);
  ctx.stroke();
  ctx.restore();
}
