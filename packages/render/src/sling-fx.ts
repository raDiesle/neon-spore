import type { SimConfig, SimEvent } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PAINTED_STRIPS } from "./painted-strips.js";
import { slingCentre, slingHandle, slingTip } from "./sling-shape.js";
import { SlingRing } from "./sling-twang.js";
import { SlingVerdicts } from "./sling-verdicts.js";
import { SpriteBursts } from "./sprite-burst.js";

/**
 * What THE SLING leaves behind a frame: its marks' verdicts (`marks`,
 * `sling-verdicts.ts`) and, behind `?raster=1`, the
 * painted draw — a cord hauled down off its tine and locked, a smear, a
 * strain running its length and the catch snapping shut (`draw`,
 * `docs/raster.md`), which draws nothing until a host installs its atlas. The
 * rest of THE SLING is read off the boss every frame (`sling-draw.ts`),
 * but for whether its rest began with a true loose (`ring`, `sling-twang.ts`).
 *
 * The strip is painted for the pilot's cord and mirrored for the navigator's.
 * **The fork never moves** (`sling-shape.ts`), so a draw is spawned where the
 * drawn cord's middle is and stays there. **Both screens are thrown the
 * same**, like the drawing. Cleared in `Effects.reset()` (`restart.test.ts`).
 */

/** How wide the painted draw is drawn, in tiles: the drawn cord and room round its catch. */
const DRAW_TILES = 3;

export class SlingFx {
  /** The painted draw `slingLoose` throws over the cord: an offered look, off until installed. */
  readonly draw = new SpriteBursts(PAINTED_STRIPS["sling-draw"]);
  /** Each mark's last answer, for the ring over it. */
  readonly marks = new SlingVerdicts();
  /** Whether the rest standing began with a true loose, so the tines ring through it (`sling-twang.ts`). */
  readonly ring = new SlingRing();

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig): void {
    this.marks.ingest(events);
    this.ring.ingest(events);
    for (const e of events) {
      if (e.type !== "slingLoose") continue;
      const home = slingCentre(l, cfg);
      const tip = slingTip(l, e.side, 1);
      const handle = slingHandle(l, e.side, 1);
      this.draw.spawn(
        home.x + (tip.x + handle.x) / 2,
        home.y + (tip.y + handle.y) / 2,
        l.tile * DRAW_TILES,
        e.side === 1,
      );
    }
  }

  update(dt: number): void {
    this.draw.update(dt);
    this.marks.update(dt);
  }

  reset(): void {
    this.draw.clear();
    this.marks.clear();
    this.ring.clear();
  }
}
