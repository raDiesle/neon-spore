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
import type { ViewRole } from "./view-role.js";
import { showsUndertowBow } from "./view-role-clocks.js";

/**
 * What THE UNDERTOW leaves behind a frame: **the plate closing** under a
 * cannon slid off in time — the design's step 11, landed.
 *
 * Everything else about the floor is drawn off the boss every frame
 * (`undertow-draw.ts`). This is the exception, and it has to be: the beat the
 * pilot slides off, the breach is gone from the world (`undertowClosed`,
 * `sim/undertow-step.ts`), and a plate that was standing off the skin one
 * frame and flat the next is a plate that vanished, not one that closed. So
 * the bow is remembered here for the beats it takes to settle — the same
 * plate, drawn by the same seam (`undertow-seam.ts`) with the lift running
 * the other way — and cleared in `Effects.reset()` like everything that
 * outlives its frame (`restart.test.ts`).
 *
 * **The pilot's, like the bow it closes** (`showsUndertowBow`): the navigator
 * never saw this plate rise, and a plate settling on her screen would be one
 * lifting for no reason. The seam's light dies with the lift, and at the
 * end a brief glow along the seam says *seated*.
 *
 * **A lobe taken is a sequence landed** — the maw held open over it, or the
 * beam burned it — and so is the swallow, so both deal the boss the blow
 * every boss takes (`boss-hurt.ts`), on both screens. The lobe taken is
 * gone that tick, so the blow is worn by what still stands of it: the other
 * lobes, and at the swallow the body (`undertow-lobe.ts`). A bow deals
 * nothing.
 */

/** Beats the plate takes to settle: the bow's own count, halved — it falls faster than it rose. */
const SETTLE_SHARE = 0.5;
/** How far into the settle the seating glow starts, 0..1. */
const SEAT_FROM = 0.75;

interface Closing {
  x: number;
  left: number;
  life: number;
}

export class UndertowFx {
  private closing: Closing[] = [];
  /** The blow a lobe taken deals the boss. */
  readonly hurt = new BossHurt();

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    /** Seconds a beat lasts. */
    spb: number,
    role: ViewRole,
  ): void {
    for (const e of events) {
      if (e.type === "undertowTaken" || e.type === "undertowSwallowed") this.hurt.hit();
    }
    if (!showsUndertowBow(role)) return;
    for (const e of events) {
      if (e.type !== "undertowClosed") continue;
      const life = cfg.undertowBowBeats * SETTLE_SHARE * spb;
      this.closing.push({ x: tileCX(l, e.col), left: life, life });
    }
  }

  update(dt: number): void {
    for (const c of this.closing) c.left -= dt;
    this.closing = this.closing.filter((c) => c.left > 0);
    this.hurt.update(dt);
  }

  /** On the finished ship, over the rim, where the bow itself is drawn. */
  drawClose(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    for (const c of this.closing) {
      const t = 1 - c.left / c.life;
      const half = PLATE_HALF * l.tile;
      drawPlateBow(ctx, l, c.x, half, 1 - smoothstep(t), time, surfaceY);
      if (t < SEAT_FROM) continue;
      // Seated: the rim over the plate flares once in its own light, brightest
      // as the plate lands and gone with it — the seam's light, on the skin.
      const seat = (t - SEAT_FROM) / (1 - SEAT_FROM);
      const glow = Math.sin(seat * Math.PI);
      const seam = splinePath(lifted(c.x - half, c.x + half, 0, surfaceY), false);
      strokeGlow(ctx, seam, PALETTE.hullRim, STROKE.inner, 0.9 * glow);
      halo(ctx, c.x, surfaceY(c.x), l.tile * 0.9, PALETTE.hullRim, 0.4 * glow);
    }
  }

  clear(): void {
    this.closing = [];
    this.hurt.clear();
  }
}
