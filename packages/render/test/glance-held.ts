import { afterAll, beforeAll } from "bun:test";
import { type Glance, STILL_GLANCE } from "../src/glance.js";

/**
 * **A glancing part held still for one file's tests.** A part that glances is
 * drawn onto a scratch layer and laid on the screen as one picture
 * (`glance-layer.ts`), so the screen's own log sees a `drawImage` where the
 * part's fills and strokes were — and a test that reads a colour, an alpha or
 * a path off that log has nothing to read. A test about something else the
 * part shows (its colour, its wash, its fade) holds it still and reads it as
 * before; `boss-glance.test.ts` and each boss's own glance test are where the
 * turn itself is proved.
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
