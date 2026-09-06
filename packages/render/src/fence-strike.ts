import type { SimEvent } from "@neon-spore/sim";
import type { LobePositions, SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { drawShieldOutage } from "./shield-outage.js";

/**
 * **A wall landing on the ship, remembered.**
 *
 * One event — a `breach` carrying the fence's own kind — and two pictures that
 * outlive the frame it arrived in: the shield's line burnt out in places
 * (`shield-outage.ts`) and the whole ship conducting for a moment
 * (`hull-shock.ts`). They are one thing to remember rather than two, because
 * they are one thing that happened: a live wire found the dome in its way and
 * earthed through it. Keeping two clocks for it would be two chances for the
 * ship to still be shaking after the line has come back, or the other way
 * round.
 *
 * There is no other way to make one. A fence that passes over a dome standing
 * in one of its gaps touches nothing and leaves the ship whole.
 *
 * **It is held by `RenderState` rather than by `Effects`**, on the same terms
 * as the lure's blast beside it: everything `Effects` owns is drawn inside the
 * field pass and painted over by the hull, and both of these are drawn on top
 * of the ship they are about. `RenderState.forget` clears it when a wave
 * starts over.
 */

/** Seconds the shield's line stays out. Long enough to be read after the burst
 * that shares the moment with it, short enough that two fences in a wave are
 * two separate outages rather than one that never ends. */
const OUTAGE = 2.2;

/** Seconds the ship goes on conducting. Much shorter: a shock is the discharge
 * itself, and a hull still crawling with current a second later would read as
 * a fault the pair has to do something about rather than as a blow taken. */
const SHOCK = 0.75;

export class FenceStrike {
  private life = 0;
  /** The column the wall earthed in, and the whole of what the outage is
   * shaped from — so one fence's is not a copy of the last one's. */
  private seed = 0;

  /** One frame's events. */
  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "breach" && e.kind === "fence") this.hit(e.col);
    }
  }

  /** A wall has earthed through the dome, in that column. */
  hit(col: number): void {
    this.life = OUTAGE;
    this.seed = col + 1;
  }

  update(dt: number): void {
    this.life = Math.max(0, this.life - dt);
  }

  clear(): void {
    this.life = 0;
    this.seed = 0;
  }

  /** Both pictures, on the ship as it is drawn this frame. */
  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    at: LobePositions,
    surfaceY: SurfaceY,
    time: number,
  ): void {
    if (this.life <= 0) return;
    // The line goes out at once and comes back slowly, so the knee rather than
    // a straight fade: a line that dimmed from the first frame reads as one
    // going out gradually, and what happened here was sudden.
    const outage = Math.min(1, this.life / OUTAGE / 0.55);
    // The shock runs off the same clock, over its own much shorter window, so
    // the ship has stopped ringing long before the shield line is whole again.
    const shock = Math.max(0, (this.life - (OUTAGE - SHOCK)) / SHOCK);
    drawHullShock(ctx, l, surfaceY, time, shock);
    drawShieldOutage(ctx, l, at, surfaceY, time, outage, this.seed);
  }
}
