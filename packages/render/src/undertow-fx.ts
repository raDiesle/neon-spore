import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { smoothstep } from "./ease.js";
import { halo, strokeGlow } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { drawPlateBow, lifted } from "./undertow-seam.js";
import { PLATE_HALF } from "./undertow-shape.js";

/**
 * What THE UNDERTOW leaves behind a frame: **the plate closing** over a lobe
 * that went back down, and **the burst** of one left tall too long.
 *
 * Everything else about the floor is drawn off the boss every frame
 * (`undertow-draw.ts`). These are the exceptions, and they have to be: the
 * tick a lobe is taken, or bursts, it is gone from the world
 * (`sim/undertow-press.ts`, `sim/undertow-step.ts`), and a plate that was
 * parted one frame and flat the next is a plate that vanished, not one that
 * closed. So each is remembered here for the second or so it takes, and
 * cleared in `Effects.reset()` like everything that outlives its frame
 * (`restart.test.ts`).
 *
 * **Both screens.** A lobe is answered from either seat now — the maw's from
 * the pilot's, the shield's from the navigator's — so either may have done
 * it, and both see it done.
 *
 * **A lobe taken is a sequence landed**, so it deals the boss the blow every
 * boss takes (`boss-hurt.ts`), worn by the lobes still standing. The burst
 * deals the ship one instead: a flash the hull's own colour and a ring going
 * out from it, over the hole the simulation has already torn in the plating
 * (`scarHull`, drawn with the rest of the hull's scars).
 */

/** Seconds a plate takes to settle over a lobe gone down. */
const SETTLE_SECONDS = 0.5;
/** Seconds the burst's flash and ring last. */
const BURST_SECONDS = 1.1;
/** How far the burst's ring goes out, in tiles. */
const BURST_REACH = 2.4;
/** How far into the settle the seating glow starts, 0..1. */
const SEAT_FROM = 0.6;

interface Moment {
  kind: "close" | "burst";
  x: number;
  left: number;
  life: number;
}

export class UndertowFx {
  private moments: Moment[] = [];
  /** The blow a lobe taken deals the boss. */
  readonly hurt = new BossHurt();

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    _cfg: SimConfig,
    /** Seconds a beat lasts. */
    _spb: number,
  ): void {
    for (const e of events) {
      if (e.type === "undertowTaken") {
        this.hurt.hit();
        this.push("close", tileCX(l, e.col), SETTLE_SECONDS);
      } else if (e.type === "undertowEbb") {
        this.push("close", tileCX(l, e.col), SETTLE_SECONDS);
      } else if (e.type === "undertowBurst") {
        this.push("burst", tileCX(l, e.col), BURST_SECONDS);
      }
    }
  }

  private push(kind: Moment["kind"], x: number, life: number): void {
    this.moments.push({ kind, x, left: life, life });
  }

  update(dt: number): void {
    for (const m of this.moments) m.left -= dt;
    this.moments = this.moments.filter((m) => m.left > 0);
    this.hurt.update(dt);
  }

  /** On the finished ship, over the rim, where the plating itself is drawn. */
  draw(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    for (const m of this.moments) {
      const t = 1 - m.left / m.life;
      if (m.kind === "burst") drawBurst(ctx, l, m.x, t, surfaceY);
      else drawClose(ctx, l, m.x, t, time, surfaceY);
    }
  }

  clear(): void {
    this.moments = [];
    this.hurt.clear();
  }
}

/** A plate settling flat, `t` 0..1, and the seam flaring once as it lands. */
function drawClose(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  t: number,
  time: number,
  surfaceY: SurfaceY,
): void {
  const half = PLATE_HALF * l.tile;
  drawPlateBow(ctx, l, x, half, 1 - smoothstep(t), time, surfaceY);
  if (t < SEAT_FROM) return;
  const glow = Math.sin(((t - SEAT_FROM) / (1 - SEAT_FROM)) * Math.PI);
  const seam = splinePath(lifted(x - half, x + half, 0, surfaceY), false);
  strokeGlow(ctx, seam, PALETTE.hullRim, STROKE.inner, 0.9 * glow);
  halo(ctx, x, surfaceY(x), l.tile * 0.9, PALETTE.hullRim, 0.4 * glow);
}

/** The burst, `t` 0..1: a white-hot flash at the skin and a ring going out across the hull. */
function drawBurst(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  t: number,
  surfaceY: SurfaceY,
): void {
  const y = surfaceY(x);
  const fade = 1 - smoothstep(t);
  halo(ctx, x, y, l.tile * (1.2 + 1.4 * t), PALETTE.hull, 0.9 * fade);
  halo(ctx, x, y, l.tile * 0.8, PALETTE.hullRim, fade * fade);
  ctx.save();
  ctx.globalAlpha = 0.8 * fade;
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = STROKE.inner * (1 + 2 * fade);
  ctx.beginPath();
  ctx.arc(x, y, l.tile * BURST_REACH * smoothstep(Math.min(1, t * 1.6)), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
