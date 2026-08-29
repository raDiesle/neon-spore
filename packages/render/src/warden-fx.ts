import { openSmoothPath, type Point } from "@neon-spore/content";
import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { wardenRimY } from "./warden.js";

/**
 * The one thing about THE WARDEN that outlives a frame.
 *
 * Everything else it does is derived from the world every time it is drawn —
 * the rope's swing follows the tension, the hatch follows the same number, the
 * plates follow the count. The snap-back is the exception: the instant a shot
 * lands the line stops existing (`stepWardenTether`), and the world has nothing
 * left to derive a picture of it from.
 *
 * **It is not decoration.** The seat holding the rope cannot see the plate come
 * off — their eye is on their own hand — and the rope leaping back up into the
 * rim is how they learn their partner scored without either of them saying so.
 * Remembered here, and cleared in `Effects.reset()` like everything else that
 * is: `world.beat` is not monotonic across a restart (`restart.test.ts`).
 */

/** Seconds a cut rope takes to whip back up into the rim and go out. */
const SNAP_LIFE = 0.45;

interface Snap {
  left: number;
}

export class WardenFx {
  private snaps: Snap[] = [];

  ingest(events: readonly SimEvent[]): void {
    // `plate` is THE WARDEN's alone — the queen sheds `petal` — and a plate is
    // exactly the moment the rope is taken away from the hand holding it.
    for (const e of events) if (e.type === "plate") this.snaps.push({ left: SNAP_LIFE });
  }

  update(dt: number): void {
    for (const s of this.snaps) s.left -= dt;
    this.snaps = this.snaps.filter((s) => s.left > 0);
  }

  reset(): void {
    this.snaps = [];
  }

  /**
   * The rope leaving. It lets go of the hand it was pulled aside by, swings
   * back through its own column and runs up into the rim, shortening as it
   * goes — slack first and then gone, which is what reads as *released* rather
   * than as cut.
   *
   * `col` is the column the rope hung in, which is the ring's middle and which
   * only the caller knows: this class remembers a moment, not a place.
   */
  draw(ctx: CanvasRenderingContext2D, l: Layout, cfg: SimConfig, col: number): void {
    for (const s of this.snaps) {
      const t = 1 - s.left / SNAP_LIFE;
      const x = tileCX(l, col);
      const topY = wardenRimY(l, cfg.wardenRow);
      const restY = tileCY(l, cfg.wardenRow + cfg.wardenHangRows);
      // The free end runs up the line, so what is left of the rope is the
      // stretch above it. Eased so it leaves fastest at the start.
      const headY = topY + (restY - topY) * (1 - t) ** 0.6;
      const slack = Math.sin(Math.min(1, t * 1.4) * Math.PI) * l.tile * 0.9;
      const pts: Point[] = [];
      const N = 10;
      for (let i = 0; i <= N; i++) {
        const k = i / N;
        pts.push({ x: x + slack * Math.sin(k * Math.PI), y: topY + (headY - topY) * k });
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t) ** 1.2;
      strokeGlow(ctx, new Path2D(openSmoothPath(pts)), PALETTE.rock, STROKE.inner, 0.8);
      ctx.restore();
    }
  }
}
