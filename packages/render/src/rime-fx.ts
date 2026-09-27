import type { SimConfig, SimEvent } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { rimeCentre, rimeRadius } from "./rime-shape.js";
import { RIME_CLEAR_SHEET, SpriteBursts } from "./sprite-burst.js";

/**
 * What THE RIME leaves behind a frame: so far only, behind `?raster=1`, the
 * painted clearing — the last frost shattering off the pane as the core lies
 * bare (`clear`, `docs/raster.md`), which draws nothing until a host installs
 * its atlas. The rest of THE RIME is read off the boss every frame
 * (`rime-draw.ts`), and its hands and effects are the second half of its look.
 *
 * **Both screens are thrown the same**, like the drawing. Cleared in
 * `Effects.reset()` (`restart.test.ts`).
 */

/** How wide the painted clearing is drawn, in widths of half the pane. */
const CLEAR_WIDTH = 2.3;

export class RimeFx {
  /** The painted clearing `rimeBare` throws over the pane: an offered look, off until installed. */
  readonly clear = new SpriteBursts(RIME_CLEAR_SHEET);

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig): void {
    for (const e of events) {
      if (e.type !== "rimeBare") continue;
      const home = rimeCentre(l, cfg);
      this.clear.spawn(home.x, home.y, rimeRadius(l).rx * CLEAR_WIDTH);
    }
  }

  update(dt: number): void {
    this.clear.update(dt);
  }

  reset(): void {
    this.clear.clear();
  }
}
