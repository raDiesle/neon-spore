import type { SimEvent } from "@neon-spore/sim";
import { drawRun } from "./fence-wire.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";

/**
 * **A wall leaving the ship it did not touch.**
 *
 * A fence that finds the dome standing in one of its ways through costs the
 * hull nothing and is taken off the field on that beat (`resolveFence`,
 * sim/hull.ts) — which left the pair's one moment of winning as a body simply
 * ceasing to exist. The owner asked for the exit itself: *when the electric
 * fence was nearest to the ship and did not damage the shield, it should do a
 * leaving animation — first it should move up one tile again, fast, then
 * starting from the gap it moves away until both ends reach the end of the
 * left and right side.*
 *
 * So two acts, in that order. The wall **lifts** a tile off the ship, quickly,
 * which is the picture of a thing that has been held off. Then it **parts at
 * the gap**: the two inner ends run outward, one to each wall, until there is
 * nothing left of the wire in the field. It comes apart at exactly the column
 * the dome was standing in, so what the pair watches is their own answer
 * opening the thing that was about to land on them.
 *
 * **It gives nothing away.** The column it parts at is the shield's own, which
 * both seats already know — it is where the navigator put the dome. Every
 * other way through the wall had is gone with the wall, so a navigator
 * watching this learns where they were standing and nothing else.
 *
 * **Pure render, and it lives in `Effects`** — `BodyTransients` next door,
 * with every other picture of one creature's last moment. Nothing here is read
 * back into a world and nothing in a world can be recovered from it; the
 * simulation finished with this wall on the beat the event was pushed.
 */

/** Seconds the wall takes to lift its tile. Short: the owner asked for *fast*,
 * and what it has to read as is a thing let go of rather than a thing rising. */
const RISE_S = 0.16;

/** And seconds the two halves take to clear the field afterwards. Long enough
 * to follow across eleven columns, short enough that the next arrival is not
 * waiting behind it. */
const PART_S = 0.44;

/** How far it lifts, in tiles. One, which is the owner's own figure and is
 * also exactly the row the shield answers on: the wall ends the moment where
 * it would have been had the dome turned it. */
const LIFT = 1;

const LIFE = RISE_S + PART_S;

/** One wall on its way out: where it parted, the row it was on, and its age. */
interface Exit {
  col: number;
  row: number;
  t: number;
}

/** Ease in and out, so the parting starts and stops rather than snapping. */
function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
}

export class FenceExitFx {
  private open: Exit[] = [];

  /** One per wall that went over the ship. `fencePass` is pushed only when the
   * dome was standing in a way through (`resolveFence`), so there is no
   * failure case to tell apart here — a wall that broke the ship breaches and
   * is drawn by `effects-breach.ts` instead. */
  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "fencePass") this.open.push({ col: e.col, row: e.row, t: 0 });
    }
  }

  update(dt: number): void {
    for (const e of this.open) e.t += dt;
    this.open = this.open.filter((e) => e.t < LIFE);
  }

  clear(): void {
    this.open = [];
  }

  /**
   * The walls on their way out. Drawn out of `fence-wire.ts`'s own `drawRun`,
   * so what leaves the field is made of the same two wires and the same rail
   * of light the thing that arrived was — a farewell drawn in some other
   * material would read as a second creature.
   */
  draw(ctx: CanvasRenderingContext2D, l: Layout, surfaceY?: SurfaceY): void {
    for (const e of this.open) {
      const rise = Math.min(1, e.t / RISE_S);
      const row = e.row - LIFT * ease(rise);
      // The two inner ends, at the lips of the gap to start with and at the
      // two walls by the end. `surfaceY` is dropped once the wall is clear of
      // the ship: it is what holds a wire up off the skin, and a wall a tile
      // above the hull is not resting on anything.
      const part = ease(Math.max(0, Math.min(1, (e.t - RISE_S) / PART_S)));
      const inner = surfaceY && rise < 1 ? surfaceY : undefined;
      const leftEnd = e.col * (1 - part);
      const rightEnd = e.col + 1 + (l.cols - e.col - 1) * part;
      if (leftEnd > 0.02) drawRun(ctx, l, 0, leftEnd, row, e.t, inner);
      if (rightEnd < l.cols - 0.02) drawRun(ctx, l, rightEnd, l.cols, row, e.t, inner);
    }
  }
}
