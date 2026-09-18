import type { MazeState, SimConfig, SimEvent } from "@neon-spore/sim";
import { drawThrownRing } from "./grip-rings.js";
import type { Layout } from "./layout.js";
import { mazeHeartCircle, mazeHeartPull } from "./maze-grip.js";
import { mazeHeartBlood } from "./maze-pulse.js";
import { PALETTE } from "./palette.js";

/**
 * **The thumb landing on the heart, and the thumb leaving it** — the one
 * thing about THE MAZE's grip that outlives a frame, kept in
 * `BossTransients.maze` (`effects-boss.ts`) and cleared with it. A
 * `mazeGrip` event is the navigator's thumb arriving (`on`) or going, and
 * each throws a ring off the heart: the round's own blood colour outward
 * when it lands, the dim one when it is lost — on every screen, because the
 * tear starting and stopping is on every screen, and it is the one moment
 * the pilot is shown her thumb at all. Read above the loop, the way THE
 * MIRROR's is (`mirror-grip-fx.ts`), rather than as a row in a spark table
 * at its limit.
 */

/** How long a thrown ring runs, in seconds. */
const THROW_LIFE = 0.5;

export class MazeGripFx {
  /** Seconds left of the last throw, and whether it was the thumb landing. */
  private left = 0;
  private landed = false;

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type !== "mazeGrip") continue;
      this.left = THROW_LIFE;
      this.landed = e.on;
    }
  }

  update(dt: number): void {
    this.left = Math.max(0, this.left - dt);
  }

  clear(): void {
    this.left = 0;
    this.landed = false;
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, cfg: SimConfig, m: MazeState): void {
    if (this.left <= 0) return;
    const c = mazeHeartCircle(l, cfg, m);
    if (c.r <= 0) return;
    const k = 1 - this.left / THROW_LIFE;
    const color = this.landed ? mazeHeartBlood(m.round).rim : PALETTE.dim;
    drawThrownRing(ctx, c.x, c.y + mazeHeartPull(l, m), c.r * (0.7 + 1.2 * k), 1 - k, color);
  }
}
