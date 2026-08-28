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
  /** Seconds into the press-and-release that opens every bounce (capped at
   * `PRESS_LIFE`); ordinary flight (`vx`, `vy`, gravity) is held off until it
   * elapses, so the rock reads as pressing into the shield before it leaves
   * rather than reversing on one tick. */
  pressT: number;
  /** How far in, in px, this particle presses — fixed at spawn from the
   * `tile` that frame had, so `draw` never needs one. */
  pressDepth: number;
}
interface Shock {
  x: number;
  y: number;
  r: number;
  life: number;
  /** Same press-and-release clock as its particle, kept separately: the ring
   * has its own resting size to spring back to. */
  pressT: number;
  /** The ring's resting radius — what it presses in from and springs back
   * to before its ordinary growth (`update`'s `r += ...`) takes over. */
  baseR: number;
}

const DEFLECT_LIFE = 1.1;
const SHOCK_LIFE = 0.5;
/** How long the press-and-release before a bounce takes, in seconds. Short
 * on purpose — the owner asked for "slightly" twice, and a press that reads
 * as its own event rather than a hitch in the bounce has to be over before
 * the eye catches up to it. */
const PRESS_LIFE = 0.08;
/** How far into the shield the rock presses, as a fraction of `tile`. */
const PRESS_DEPTH_FRAC = 0.16;
/** Squash/stretch scale swing at the peak of the press — 18%, not more. */
const SQUASH_AMOUNT = 0.18;
/** How compressed the shockwave ring starts, as a fraction of its resting
 * radius — the shield giving before it springs back out to `baseR`. */
const RING_COMPRESS_FRAC = 0.78;

/**
 * Standard "back" ease-out: rises past 1 before settling exactly there. Used
 * only for the shockwave ring's press-and-release, so the shield's own give
 * reads as a small rubber-band snap rather than a ring that merely grows
 * from a stop.
 */
function backEaseOut(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const u = t - 1;
  return 1 + c3 * u * u * u + c1 * u * u;
}

/**
 * The bounced rock and its pressure wave — the one moment that needs both
 * players, split out of `Effects` on its own because the tumble physics and
 * the shockwave arc are the bulk of what a deflection draws.
 */
export class DeflectFx {
  private particles: Particle[] = [];
  private shocks: Shock[] = [];

  /** Drop every bounce still running. For a restart — see `Effects.reset`. */
  clear(): void {
    this.particles.length = 0;
    this.shocks.length = 0;
  }

  /**
   * `x, y` is where `rock-impact.ts` last saw the rock — the hull's own
   * breathing skin (`hullSkinY`), the same point a rock that was *not*
   * deflected sinks into. That is a row too low for a rock that was: the rule
   * answers a meteor at `shieldRow`, one whole row above the hull
   * (`hull.ts`), and the skin only bulges toward it while the shield is
   * freshly armed — by the time the fall's replay actually reaches `y`, the
   * arm has almost always eased back off (`canvas2d.ts`'s `armed`, an eight
   * -per-second ease against a window a few beats shorter than the replay
   * takes), so `y` reads as the plain hull surface regardless. Shifting up by
   * one `tile` — exactly the row `shieldRow` stands off `hullRow` by — is the
   * one correction that holds without knowing any of that: it is a fixed
   * fact about the rule, not a read of the skin's current mood.
   *
   * `span` is the deflected creature's `colSpan` — 3 for a torch, 1 for a
   * plain rock — so the shockwave draws as wide as the thing it came off,
   * rather than a single-tile ring for a three-tile impact.
   *
   * Both the crystal and the ring open with a short press-and-release before
   * the crystal's ordinary flight and the ring's ordinary growth begin — see
   * `PRESS_LIFE` — so the moment of contact reads as the rock pressing into
   * the shield and the shield giving like rubber, not as a reversal on one
   * tick.
   */
  spawn(x: number, y: number, tile: number, span = 1): void {
    const sy = y - tile;
    const shockR = tile * 0.4 * span;
    this.particles.push({
      x,
      y: sy,
      r: tile * 0.4,
      vx: (Math.random() - 0.5) * 90,
      vy: -260 - Math.random() * 80,
      spin: Math.random() * 6.28,
      vs: (Math.random() - 0.5) * 7,
      life: DEFLECT_LIFE,
      pressT: 0,
      pressDepth: tile * PRESS_DEPTH_FRAC,
    });
    this.shocks.push({ x, y: sy, r: shockR, life: SHOCK_LIFE, pressT: 0, baseR: shockR });
  }

  update(dt: number, tile: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const d = this.particles[i]!;
      // The press-and-release runs before the ordinary bounce physics
      // starts, not alongside it: while it is still pressing, `x`/`y` stay
      // put (the visible dip is `draw`'s alone) so the rock reads as leaving
      // from exactly where it pressed in, with no jump onto a trajectory
      // already carrying it away.
      if (d.pressT < PRESS_LIFE) {
        d.pressT += dt;
      } else {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += 120 * dt;
        d.spin += d.vs * dt;
      }
      d.life -= dt;
      if (d.life <= 0 || d.y < -60) this.particles.splice(i, 1);
    }
    for (let i = this.shocks.length - 1; i >= 0; i--) {
      const s = this.shocks[i]!;
      // Same idea: the ring holds at `baseR` through its own press-and-
      // release (drawn, not stored) and only starts growing once that ends.
      if (s.pressT < PRESS_LIFE) {
        s.pressT += dt;
      } else {
        s.r += tile * 4.5 * dt;
      }
      s.life -= dt;
      if (s.life <= 0) this.shocks.splice(i, 1);
    }
  }

  /** Drawn under the hull, so a deflected rock passes behind nothing. */
  draw(ctx: CanvasRenderingContext2D): void {
    for (const d of this.particles) {
      // A single in-and-back bump over `PRESS_LIFE`: 0 at the moment of
      // contact, peaking mid-press, back to 0 exactly when the ordinary
      // bounce (`update`) takes over — so the dip and the squash both
      // resolve to nothing right where the flight trajectory picks up,
      // rather than leaving a seam between the two.
      const pt = d.pressT < PRESS_LIFE ? Math.sin((d.pressT / PRESS_LIFE) * Math.PI) : 0;
      ctx.save();
      // The dip reads as pressing into the shield regardless of the rock's
      // own spin, so it is added in screen space, ahead of `rotate`.
      ctx.translate(d.x, d.y + pt * d.pressDepth);
      if (pt > 0) ctx.scale(1 + pt * SQUASH_AMOUNT, 1 - pt * SQUASH_AMOUNT);
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
      // The shield's own give: the ring starts compressed to
      // `RING_COMPRESS_FRAC` of its rest size and eases out past `baseR`
      // before settling there — the small rubber-band snap `backEaseOut`
      // exists for — then, once `update` takes over, grows from that same
      // resting point as before.
      const r =
        s.pressT < PRESS_LIFE
          ? s.baseR *
            (RING_COMPRESS_FRAC + (1 - RING_COMPRESS_FRAC) * backEaseOut(s.pressT / PRESS_LIFE))
          : s.r;
      const a = Math.max(0, s.life / SHOCK_LIFE);
      ctx.globalAlpha = a * 0.85;
      ctx.strokeStyle = PALETTE.shieldRim;
      ctx.lineWidth = 3 * a + 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, Math.PI, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      halo(ctx, s.x, s.y, r * 0.5, PALETTE.shield, a * 0.4);
    }
  }
}
