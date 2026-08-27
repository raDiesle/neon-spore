import { openSmoothPath, type Point } from "@neon-spore/content";
import type { SimEvent } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The one thing about THE WARDEN that outlives a frame.
 *
 * Everything else it does is derived from the world every time it is drawn —
 * the bow follows the grip, the dilation follows `openBeat`, the plates follow
 * the count. The tear is the exception: the moment the line comes out of the
 * rim the creature stops existing, and the world has nothing left to derive a
 * picture of it from. So the whip is remembered here, and cleared in
 * `Effects.reset()` like everything else that is — `world.beat` is not
 * monotonic across a restart (`restart.test.ts`).
 */

/** Seconds a torn line takes to whip down, lie across the field and go out. */
const WHIP_LIFE = 1.0;

interface Whip {
  col: number;
  /** The row the head had reached when it was torn. */
  row: number;
  left: number;
}

export class WardenFx {
  private whips: Whip[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "tetherTorn") this.whips.push({ col: e.col, row: e.row, left: WHIP_LIFE });
    }
  }

  update(dt: number): void {
    for (const w of this.whips) w.left -= dt;
    this.whips = this.whips.filter((w) => w.left > 0);
  }

  reset(): void {
    this.whips = [];
  }

  /**
   * The line parting at the rim: it whips down, lies limp across the field for
   * a beat, and goes out. Drawn slack rather than taut — a line under no
   * tension is the whole point of the picture, and it is the only moment in
   * this fight where anything is.
   */
  draw(ctx: CanvasRenderingContext2D, l: Layout, wardenRow: number): void {
    for (const w of this.whips) {
      const t = 1 - w.left / WHIP_LIFE;
      const x = tileCX(l, w.col);
      const topY = tileCY(l, wardenRow);
      const headY = tileCY(l, w.row);
      // The severed end falls away from the rim, and the slack it loses on the
      // way is what makes it read as cut rather than as retracted.
      const fall = (headY - topY) * Math.min(1, t * 2.2);
      const slack = Math.sin(Math.min(1, t * 1.6) * Math.PI) * l.tile * 1.4;
      const pts: Point[] = [];
      const N = 10;
      for (let i = 0; i <= N; i++) {
        const k = i / N;
        pts.push({
          x: x + slack * Math.sin(k * Math.PI * 2) * (1 - k * 0.3),
          y: topY + fall + (headY - topY - fall) * k * 0.4 + slack * 0.4 * k,
        });
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t) ** 1.5;
      strokeGlow(ctx, new Path2D(openSmoothPath(pts)), PALETTE.rock, STROKE.inner, 0.8);
      ctx.restore();
    }
  }
}
