import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";
import type { RepriseFrame } from "./reprise-body.js";
import type { ReprisePhase } from "./reprise-fx.js";
import { lensRadius } from "./reprise-lens.js";

/**
 * **THE REPRISE's count: a ring of eggs round the lens**, one for each body
 * it holds, and a hollow ring for each one it has sent that is still out on
 * the field unseen.
 *
 * It replaced the row of teeth hung from the tear, which the owner could not
 * read (25 September 2026: *not clear what the teeths are about*), and it
 * answers the other half of the same message: *the remaining enemies on the
 * screen (some kind of count)*. So the ring says three things, each as a shape
 * and never a digit:
 *
 * - **While a stretch is recorded, an egg is laid into the ring** for each
 *   body that comes down seen, and pops as it arrives — *it is taking this
 *   one down*.
 * - **While the echo plays, the eggs are spent**: each body sent takes one out
 *   of the ring with a flash and a drop into the tear, so *three left* is three
 *   eggs.
 * - **A hollow ring stands for every unseen body still falling**, and pulses on
 *   the beat. It goes when that body is taken or reaches the hull, so the pair
 *   knows how many are still out there — the one number they could not count
 *   for themselves — and still not where.
 *
 * The slots are fixed, `max(8, n)` of them round the circle, so an egg never
 * slides when another comes or goes; the ring turns slowly as one piece. No
 * colour, no column: rock grey, and it circles the middle column's eye.
 */

export interface BroodState {
  phase: ReprisePhase;
  /** Bodies recorded so far, or still owed. */
  eggs: number;
  /** Unseen bodies still on the field. */
  standing: number;
  /** 1 on the frame a body is sent, easing to 0. */
  swallow: number;
  /** Seconds since a body was last recorded. */
  take: number;
  beatPhase: number;
  time: number;
}

export function drawBrood(ctx: CanvasRenderingContext2D, f: RepriseFrame, s: BroodState): void {
  const going = s.phase === "play" && s.swallow > 0 ? 1 : 0;
  const shown = s.eggs + going + s.standing;
  if (shown === 0) return;
  const slots = Math.max(8, shown);
  const ring = lensRadius(f) * 1.12 + f.u * 0.26;
  const egg = Math.min(f.u * 0.21, (Math.PI * ring) / slots / 1.15);
  const spin = s.time * 0.25;
  const pulse = (1 - s.beatPhase) ** 2;
  // Filled eggs first, from the top clockwise, then the hollow rings after
  // them, so the two counts are two arcs and never a mix.
  for (let i = 0; i < shown; i++) {
    const a = -Math.PI / 2 + spin + (Math.PI * 2 * i) / slots;
    const ex = f.x + Math.cos(a) * ring;
    const ey = f.cy + Math.sin(a) * ring;
    if (i < s.eggs + going) {
      const last = i === s.eggs + going - 1;
      let size = 1;
      let alpha = 1;
      // The newest recorded egg pops in.
      if (s.phase === "rec" && last && s.take < 0.3)
        size = 0.4 + 0.6 * easeOut(s.take / 0.3) + 0.25 * (1 - s.take / 0.3);
      // The one just sent goes out with a flash, and drops into the tear.
      if (going && last) {
        alpha = s.swallow;
        size = 1 + 0.6 * (1 - s.swallow);
        drawDrop(ctx, ex, ey, f, s.swallow, egg);
      }
      drawEgg(ctx, ex, ey, a, egg * size, alpha);
    } else {
      drawHollow(ctx, ex, ey, a, egg * (0.92 + 0.12 * pulse), 0.45 + 0.55 * pulse);
    }
  }
}

/** One egg: an oval pointed out from the lens, lit on its upper left. */
function drawEgg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  a: number,
  r: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  const shell = new Path2D();
  shell.ellipse(x, y, r, r * 0.72, a, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, PALETTE.text);
  g.addColorStop(0.5, PALETTE.rock);
  g.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = g;
  ctx.fill(shell);
  strokeGlow(ctx, shell, PALETTE.rock, STROKE.inner, 0.7);
  ctx.restore();
}

/**
 * An egg-shaped hollow for a body still out there unseen: a shell with
 * nothing in it, its outline broken into dashes and faintly filled, the same
 * size and shape as the eggs beside it — so it reads as *one that left* and
 * never as a letter or a nought.
 */
function drawHollow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  a: number,
  r: number,
  glow: number,
): void {
  const shell = new Path2D();
  shell.ellipse(x, y, r, r * 0.72, a, 0, Math.PI * 2);
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.rock, 0.12 + 0.12 * glow);
  ctx.fill(shell);
  ctx.setLineDash([r * 0.45, r * 0.3]);
  ctx.lineWidth = Math.max(1, r * 0.2);
  ctx.strokeStyle = rgba(PALETTE.text, 0.4 + 0.5 * glow);
  ctx.stroke(shell);
  ctx.restore();
}

/** A drop falling from an egg that has just been spent, down to the tear. */
function drawDrop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  f: RepriseFrame,
  swallow: number,
  r: number,
): void {
  const k = 1 - swallow;
  const dy = y + (f.y0 + f.u * 0.3 - y) * k * k;
  const dx = x + (f.x - x) * k;
  ctx.fillStyle = rgba(PALETTE.text, 0.8 * swallow);
  ctx.beginPath();
  ctx.ellipse(dx, dy, r * 0.4, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
}

const easeOut = (v: number): number => 1 - (1 - Math.min(1, v)) ** 3;
