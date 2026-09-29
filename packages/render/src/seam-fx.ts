import type { SimEvent } from "@neon-spore/sim";

/**
 * What THE SEAM leaves behind a frame: so far only the **reseal** — the flash
 * down the whole crack as a bolt fired into the dark holds the ridge shut one
 * beat longer (§26 row 16, `sim/seam-step.ts` `seamFiredInto`). The state
 * says the ridge was held (`held`) but not when, so the flash is kept here.
 *
 * Held in `BossBlows` beside the ridge's verdicts, for a boss with no fx
 * class in the roster; the hands, the second half of its look, grow it.
 * Cleared in `Effects.reset()` (`restart.test.ts`).
 */

/** How fast the reseal's flash dies, per second. */
const RESEAL_DECAY = 2.5;

export class SeamFx {
  private resealNow = 0;

  /** How bright the reseal's flash still is, 0..1. */
  get reseal(): number {
    return this.resealNow;
  }

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) if (e.type === "seamReseal") this.resealNow = 1;
  }

  update(dt: number): void {
    this.resealNow = Math.max(0, this.resealNow - RESEAL_DECAY * Math.min(dt, 1 / 30));
  }

  clear(): void {
    this.resealNow = 0;
  }
}
