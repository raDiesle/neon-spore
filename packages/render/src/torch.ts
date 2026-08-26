import { crystalPath, METEOR } from "@neon-spore/content";
import type { Creature } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/** How far a torch's radius reaches, in tiles — shared with `torch-impact.ts` so the two never drift apart. */
export function torchRadius(l: Layout): number {
  return l.tile * 0.8;
}

/**
 * The tail: an ember streak from the top of the field down to wherever the
 * torch is now, so a fall fast enough to otherwise read as a blink still
 * reads as a fall. `alpha` scales the whole thing down, for the effect that
 * keeps the tail alive a moment after the torch itself is gone
 * (`torch-impact.ts`) instead of it vanishing the instant the creature does.
 */
export function drawTorchTail(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  alpha = 1,
): void {
  const topY = tileCY(l, 0);
  const tailGrad = ctx.createLinearGradient(x, topY, x, y);
  tailGrad.addColorStop(0, "rgba(255,122,47,0)");
  tailGrad.addColorStop(0.75, `rgba(255,122,47,${0.1 * alpha})`);
  tailGrad.addColorStop(1, `rgba(255,122,47,${0.3 * alpha})`);
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
}

/**
 * The rock itself: the ember ring, then the same crystal shape and stone-grey
 * fill as a plain meteor. Assumes `ctx` is already translated to the rock's
 * centre and rotated. Shared with `torch-impact.ts`'s embed-and-reflect
 * animation, so the bounced rock is unmistakably the same thing that fell.
 */
export function drawTorchRock(ctx: CanvasRenderingContext2D, r: number, time: number): void {
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
}

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
 * the top of the field down to where it is now. The whole point is
 * legibility at speed: even a glance that lands mid-fall reads the streak as
 * "this came from up there," not just "something is here."
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
  const r = torchRadius(l);
  const spin = (c.id % 13) * 0.48;
  const wobble = Math.sin(time * 1.1 + spin) * l.tile * 0.06;

  drawTorchTail(ctx, l, x, y, r);

  ctx.save();
  ctx.translate(x + wobble, y);
  ctx.rotate(spin + time * 0.12);

  drawTorchRock(ctx, r, time);

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
