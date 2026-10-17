import { bendAbout, during } from "./blister-bend.js";
import type { BlisterDying } from "./blister-death.js";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * SPRING: wound too far, and let go. The body spins hard the other way, up
 * off its pore and shrinking to a point, while the turn it was holding
 * uncoils out of it as a lit spiral that unwinds across the tile and fades.
 */
export function drawSpring(d: BlisterDying): void {
  const { ctx, x, y, r, spin } = d;
  const t = during(d.at, 0, 0.7);
  const back = -spin;
  const turn = back * Math.PI * 2 * 2.2 * (1 - (1 - t) * (1 - t));
  const shrink = 1 - 0.9 * smoothstep(t);
  const lift = -r * 1.2 * Math.sin(t * Math.PI * 0.5);
  ctx.save();
  ctx.globalAlpha *= 1 - during(d.at, 0.55, 0.75);
  d.body(1, bendAbout(x, y, { turn, sx: shrink, sy: shrink, dy: lift }));
  ctx.restore();
  d.control(1 - during(d.at, 0, 0.3), bendAbout(x, y, { turn, sx: shrink, sy: shrink, dy: lift }));
  coil(ctx, x, y + lift, r, back, d.at);
}

/** The spiral unwinding: an Archimedean coil, its far end running outward. */
function coil(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  way: number,
  at: number,
): void {
  const open = smoothstep(during(at, 0.05, 0.6));
  const a = 1 - during(at, 0.6, 1);
  if (open <= 0 || a <= 0) return;
  const turns = 2.6;
  const steps = 96;
  const start = Math.PI * 2 * turns * (1 - open);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [w, colour, alpha] of [
    [0.22, PALETTE.hull, 0.45],
    [0.09, PALETTE.hullRim, 0.95],
  ] as const) {
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const th = start + (Math.PI * 2 * turns - start) * (i / steps);
      const rad = r * 0.25 + (th / (Math.PI * 2)) * r * 0.35 * (1 + open);
      const px = x + Math.cos(way * th) * rad;
      const py = y + Math.sin(way * th) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineWidth = r * w;
    ctx.strokeStyle = rgba(colour, alpha * a);
    ctx.stroke();
  }
  ctx.restore();
}
