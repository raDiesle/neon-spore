import { afterAll, beforeAll } from "bun:test";
import { type Glance, STILL_GLANCE } from "../src/glance.js";

/**
 * **A glancing part held still for one file's tests.** A part that glances is
 * drawn onto a scratch layer and laid on the screen as one picture
 * (`glance-layer.ts`). Since 15 October 2026 the stub writes the layer's ops
 * into the screen's own tally and log (`canvas-stub-layer.ts`), so a test that
 * reads a colour or a path off the log reads the part as it did before it
 * turned, and seven files that held their boss still stopped.
 *
 * What the log still cannot say is the screen's alpha as the part is laid
 * down: the layer is drawn at the screen's alpha and laid at full alpha, by
 * design, so a test that every draw stays under a fade — `glow-faded.test.ts`
 * — reads the lay-down's 1 and holds the part still for that. The turn itself
 * is proved in `boss-glance.test.ts` and each boss's own glance test.
 */
export function holdGlancesStill(...records: Glance[]): void {
  const shipped = records.map((r) => ({ ...r }));
  beforeAll(() => {
    for (const r of records) Object.assign(r, STILL_GLANCE);
  });
  afterAll(() => {
    for (const [i, r] of records.entries()) Object.assign(r, shipped[i]);
  });
}
