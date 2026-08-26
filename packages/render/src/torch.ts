import { crystalPath, METEOR } from "@neon-spore/content";
import type { Creature } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The torch: a rock, not a different material — the same crystal shape and
 * the same stone-grey fill as a plain meteor (`METEOR`, `drawMeteor` in
 * `creatures.ts`), so the pair reads it as the rock family at a glance. Two
 * tiles wide against a meteor's one, which is the whole of what still marks
 * it apart, plus a faint second ring in the tail's old colour — the one
 * trace it keeps of the flame it used to carry. Craters from shots place the
 * same way a meteor's do.
 *
 * It is also the fastest thing in the field (`fallTilesPerBeat` in
 * sim/types.ts), which on its own would read as a blink rather than a fall —
 * so it drags a tail the length of however far it has already dropped, from
 * the top of the field down to where it is now, fading in as it nears the
 * torch itself. The whole point is legibility at speed: even a glance that
 * lands mid-fall reads the streak as "this came from up there," not just
 * "something is here."
 */
export function drawTorch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
  _beatPhase: number,
): void {
  const r = l.tile * 0.8;
  const spin = (c.id % 13) * 0.48;
  const wobble = Math.sin(time * 1.1 + spin) * l.tile * 0.06;

  const topY = tileCY(l, 0);
  const tailGrad = ctx.createLinearGradient(x, topY, x, y);
  tailGrad.addColorStop(0, "rgba(255,122,47,0)");
  tailGrad.addColorStop(0.75, "rgba(255,122,47,0.1)");
  tailGrad.addColorStop(1, "rgba(255,122,47,0.3)");
  ctx.save();
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.12, topY);
  ctx.lineTo(x + r * 0.12, topY);
  ctx.lineTo(x + r * 0.9, y);
  ctx.lineTo(x - r * 0.9, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x + wobble, y);
  ctx.rotate(spin + time * 0.12);

  // The tail's colour, kept only as a faint ring just outside the rock's own
  // outline — a trace of the flame, not the flame itself.
  const ringD = crystalPath(
    0,
    0,
    r * 1.14,
    r * 1.14,
    METEOR.sides,
    METEOR.depth,
    METEOR.wobble,
    time * 0.15,
    METEOR.seed,
  );
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = PALETTE.ember;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(new Path2D(ringD));
  ctx.globalAlpha = 1;

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
  halo(ctx, x + wobble, y, r * 2, PALETTE.ember, 0.08);
}
