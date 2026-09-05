import { crystalPath, METEOR } from "@neon-spore/content";
import type { CreatureKind } from "@neon-spore/sim";
import { hash01 } from "./backdrop.js";
import { DEFLECT_LOOK } from "./deflect-look.js";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";
import { drawEmberRing, rockTileRadius } from "./torch.js";

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
   * `DEFLECT_LOOK.pressLife`); ordinary flight (`vx`, `vy`, gravity) is held off until it
   * elapses, so the rock reads as pressing into the shield before it leaves
   * rather than reversing on one tick. */
  pressT: number;
  /** How far in, in px, this particle presses — fixed at spawn from the
   * `tile` that frame had, so `draw` never needs one. */
  pressDepth: number;
  /** Whether this rock carries the torch's flame ring. The one mark that
   * survives a bounce: the tail is a picture of falling and there is no
   * falling left to do (`rock-impact.ts`), so without the ring a turned torch
   * is a grey stone nobody can name. */
  ember: boolean;
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
  /** Advances on every spawn, seeding `hash01` — see `clear`. Deterministic
   * so two devices deflecting the same rock throw the same tumble. */
  private seed = 0;

  /** Drop every bounce still running, and rewind the seed so the next spawn
   * matches a fresh instance's. For a restart — see `Effects.reset`. */
  clear(): void {
    this.particles.length = 0;
    this.shocks.length = 0;
    this.seed = 0;
  }

  /**
   * `x, y` is where `rock-impact.ts` stopped the rock — its own `arriveY`,
   * already a `tile` above the hull's breathing skin for everything the
   * shield turns at `shieldRow`, and the skin itself for the last-beat
   * catch that turns a rock already standing on the plating (`hull.ts`).
   * This used to shift up by a `tile` here instead, which was right for the
   * first case and a visible jump in the second; the correction belongs
   * where the rock's position is known, not where the bounce is drawn.
   *
   * `span` is the deflected creature's own width — two for a torch or a big
   * meteor, one for a plain rock — and it sizes **both** the shockwave and the
   * rock itself. The rock used to be drawn at a flat `tile * 0.4` whatever it
   * came off, so a two-tile body the pair had been watching all the way down
   * halved the instant the shield turned it; it is `rockTileRadius` now, the
   * same rule the falling rock and its crater are drawn by, so the bounced
   * body is the same size and keeps its whole footprint inside the columns it
   * occupied.
   *
   * `kind` is that creature's kind, and the only thing it decides is the
   * torch's ember ring — see `Particle.ember`.
   *
   * Both the crystal and the ring open with a short press-and-release before
   * the crystal's ordinary flight and the ring's ordinary growth begin — see
   * `DEFLECT_LOOK.pressLife` — so the moment of contact reads as the rock pressing into
   * the shield and the shield giving like rubber, not as a reversal on one
   * tick.
   */
  spawn(x: number, y: number, tile: number, span = 1, kind?: CreatureKind): void {
    const sy = y;
    const shockR = tile * DEFLECT_LOOK.ringSpanFrac * span;
    this.particles.push({
      x,
      y: sy,
      r: rockTileRadius(tile, span),
      vx: (hash01(this.seed++) - 0.5) * 90,
      vy: -260 - hash01(this.seed++) * 80,
      spin: hash01(this.seed++) * 6.28,
      vs: (hash01(this.seed++) - 0.5) * 7,
      life: DEFLECT_LOOK.life,
      pressT: 0,
      pressDepth: tile * DEFLECT_LOOK.pressDepthFrac,
      ember: kind === "torch",
    });
    this.shocks.push({
      x,
      y: sy,
      r: shockR,
      life: DEFLECT_LOOK.shockLife,
      pressT: 0,
      baseR: shockR,
    });
  }

  update(dt: number, tile: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const d = this.particles[i]!;
      // The press-and-release runs before the ordinary bounce physics
      // starts, not alongside it: while it is still pressing, `x`/`y` stay
      // put (the visible dip is `draw`'s alone) so the rock reads as leaving
      // from exactly where it pressed in, with no jump onto a trajectory
      // already carrying it away.
      if (d.pressT < DEFLECT_LOOK.pressLife) {
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
      if (s.pressT < DEFLECT_LOOK.pressLife) {
        s.pressT += dt;
      } else {
        s.r += tile * DEFLECT_LOOK.ringGrowTiles * dt;
      }
      s.life -= dt;
      if (s.life <= 0) this.shocks.splice(i, 1);
    }
  }

  /** Drawn under the hull, so a deflected rock passes behind nothing. */
  draw(ctx: CanvasRenderingContext2D): void {
    for (const d of this.particles) {
      // A single in-and-back bump over `DEFLECT_LOOK.pressLife`: 0 at the moment of
      // contact, peaking mid-press, back to 0 exactly when the ordinary
      // bounce (`update`) takes over — so the dip and the squash both
      // resolve to nothing right where the flight trajectory picks up,
      // rather than leaving a seam between the two.
      const pressLife = DEFLECT_LOOK.pressLife;
      const pt = d.pressT < pressLife ? Math.sin((d.pressT / pressLife) * Math.PI) : 0;
      ctx.save();
      // The dip reads as pressing into the shield regardless of the rock's
      // own spin, so it is added in screen space, ahead of `rotate`.
      ctx.translate(d.x, d.y + pt * d.pressDepth);
      const squash = DEFLECT_LOOK.squashAmount;
      if (pt > 0) ctx.scale(1 + pt * squash, 1 - pt * squash);
      ctx.globalAlpha = Math.min(1, d.life / 0.5);
      ctx.rotate(d.spin);
      // The flame first, under the stone, exactly as `drawTorchRock` lays it:
      // a ring just outside the outline rather than a glow over it, so the
      // rock's own contour is still the edge the eye reads.
      if (d.ember) drawEmberRing(ctx, d.r, 0);
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
      // `ringCompressFrac` of its rest size and eases out past `baseR`
      // before settling there — the small rubber-band snap `backEaseOut`
      // exists for — then, once `update` takes over, grows from that same
      // resting point as before.
      const k = DEFLECT_LOOK;
      const compress = k.ringCompressFrac;
      const r =
        s.pressT < k.pressLife
          ? s.baseR * (compress + (1 - compress) * backEaseOut(s.pressT / k.pressLife))
          : s.r;
      const a = Math.max(0, s.life / k.shockLife);
      ctx.strokeStyle = PALETTE.shieldRim;
      // One arc as shipped; a candidate that answers the catch with a ripple
      // asks for more, each one a share of the radius further in and fainter.
      for (let i = 0; i < Math.max(1, Math.round(k.rings)); i++) {
        const ri = r * (1 - i * k.ringGap);
        if (ri <= 0) break;
        const ai = a * (1 - i * 0.3);
        if (ai <= 0) break;
        ctx.globalAlpha = ai * k.ringAlpha;
        ctx.lineWidth = k.ringWidth * ai + k.ringWidthFloor;
        ctx.beginPath();
        ctx.arc(s.x, s.y, ri, Math.PI, 0);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      halo(ctx, s.x, s.y, r * k.haloMul, PALETTE.shield, a * k.haloAlpha);
    }
  }
}
