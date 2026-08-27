import { crystalPath, METEOR } from "@neon-spore/content";
import type { Creature } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { rockRadius } from "./torch.js";

/**
 * The rock. Angular facets rather than a contour, because it does not live —
 * that is the fiction the indestructibility rests on (docs/spec/graphics.md). Craters from
 * shots are placed from the creature id, so both screens agree without the
 * simulation having to store an angle per hole.
 */
export function drawMeteor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
): void {
  const r = rockRadius(l, c.kind);
  const spin = (c.id % 13) * 0.48;
  const wobble = Math.sin(time * 1.1 + spin) * l.tile * 0.06;
  const d = crystalPath(
    0,
    0,
    r,
    r,
    METEOR.sides,
    METEOR.depth,
    METEOR.wobble,
    time * 0.15,
    METEOR.seed,
  );
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(x + wobble, y);
  ctx.rotate(spin + time * 0.12);

  const rg = ctx.createLinearGradient(-r, -r, r, r);
  rg.addColorStop(0, "#9DA3B0");
  rg.addColorStop(0.55, "#6B707E");
  rg.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = rg;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(path);

  for (let k = 0; k < c.holes; k++) {
    const a = ((k * 2.399) % (Math.PI * 2)) + (c.id % 5) * 0.4;
    const dist = 0.3 + ((k * 7 + c.id) % 10) / 28;
    const hx = Math.cos(a) * r * dist;
    const hy = Math.sin(a) * r * dist;
    ctx.fillStyle = "#17181D";
    ctx.beginPath();
    ctx.arc(hx, hy, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(199,203,214,.5)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
  halo(ctx, x + wobble, y, r * 1.6, PALETTE.rock, 0.1);
}
