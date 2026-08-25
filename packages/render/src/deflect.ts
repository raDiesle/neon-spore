import { crystalPath, METEOR } from "@neon-spore/content";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  spin: number;
  vs: number;
  life: number;
}
interface Shock {
  x: number;
  y: number;
  r: number;
  life: number;
}

const DEFLECT_LIFE = 1.1;
const SHOCK_LIFE = 0.5;

/**
 * The bounced rock and its pressure wave — the one moment that needs both
 * players, split out of `Effects` on its own because the tumble physics and
 * the shockwave arc are the bulk of what a deflection draws.
 */
export class DeflectFx {
  private particles: Particle[] = [];
  private shocks: Shock[] = [];

  /**
   * `span` is the deflected creature's `colSpan` — 3 for a torch, 1 for a
   * plain rock — so the shockwave draws as wide as the thing it came off,
   * rather than a single-tile ring for a three-tile impact.
   */
  spawn(x: number, y: number, tile: number, span = 1): void {
    this.particles.push({
      x,
      y,
      r: tile * 0.4,
      vx: (Math.random() - 0.5) * 90,
      vy: -260 - Math.random() * 80,
      spin: Math.random() * 6.28,
      vs: (Math.random() - 0.5) * 7,
      life: DEFLECT_LIFE,
    });
    this.shocks.push({ x, y, r: tile * 0.4 * span, life: SHOCK_LIFE });
  }

  update(dt: number, tile: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const d = this.particles[i]!;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += 120 * dt;
      d.spin += d.vs * dt;
      d.life -= dt;
      if (d.life <= 0 || d.y < -60) this.particles.splice(i, 1);
    }
    for (let i = this.shocks.length - 1; i >= 0; i--) {
      const s = this.shocks[i]!;
      s.r += tile * 4.5 * dt;
      s.life -= dt;
      if (s.life <= 0) this.shocks.splice(i, 1);
    }
  }

  /** Drawn under the hull, so a deflected rock passes behind nothing. */
  draw(ctx: CanvasRenderingContext2D): void {
    for (const d of this.particles) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.globalAlpha = Math.min(1, d.life / 0.5);
      ctx.rotate(d.spin);
      const path = new Path2D(
        crystalPath(0, 0, d.r, d.r, METEOR.sides, METEOR.depth, METEOR.wobble, 0, METEOR.seed),
      );
      const rg = ctx.createLinearGradient(-d.r, -d.r, d.r, d.r);
      rg.addColorStop(0, "#9DA3B0");
      rg.addColorStop(0.55, "#6B707E");
      rg.addColorStop(1, PALETTE.rockDark);
      ctx.fillStyle = rg;
      ctx.fill(path);
      ctx.strokeStyle = PALETTE.shieldRim;
      ctx.lineWidth = 1.8;
      ctx.stroke(path);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    for (const s of this.shocks) {
      const a = Math.max(0, s.life / SHOCK_LIFE);
      ctx.globalAlpha = a * 0.85;
      ctx.strokeStyle = PALETTE.shieldRim;
      ctx.lineWidth = 3 * a + 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, Math.PI, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      halo(ctx, s.x, s.y, s.r * 0.5, PALETTE.shield, a * 0.4);
    }
  }
}
