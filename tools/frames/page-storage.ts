import type { Page } from "playwright-core";
import type { StageSpec } from "./stage-spec.js";

/**
 * **What the page remembers, written before it boots**: whose screen it is and
 * the level it plays at. Both are read once on startup — the seat by the view
 * switch, the level by `apps/game/src/main-world.ts` — so a value written
 * after the bundle ran would be a second frame's worth of work and a first
 * frame of the wrong screen or the wrong tempo.
 *
 * Cut from `page.ts` on 26 September 2026 at its line limit, when the level
 * joined the seat.
 */

/**
 * `STORAGE_KEY` from `apps/game/src/view.ts` and `PROGRESS_KEY` from
 * `apps/game/src/progress.ts`, copied for `OPENING_PLAY`'s reason: the line
 * that writes them runs in the browser, before the bundle loads, where nothing
 * this file imports exists. A key that went stale would leave every capture
 * silently on the build's default, which is why the strings are named here.
 */
const SEAT_KEY = "neon-spore.view";
const PROGRESS_KEY = "neon-spore.progress";

export async function storeBeforeBoot(page: Page, spec: StageSpec): Promise<void> {
  // A refusal to store leaves the capture on whatever the build defaults to,
  // which is the same shape the game takes when storage says no.
  if (spec.seat) {
    await page.addInitScript(
      ([key, seat]: string[]) => {
        try {
          localStorage.setItem(key as string, seat as string);
        } catch {}
      },
      [SEAT_KEY, spec.seat],
    );
  }
  // The level rides in the progress record, so the record is read and only
  // its level changed: a device that has played keeps its furthest wave.
  if (spec.level) {
    await page.addInitScript(
      ([key, level]: string[]) => {
        try {
          const had = JSON.parse(localStorage.getItem(key as string) ?? "{}") ?? {};
          localStorage.setItem(key as string, JSON.stringify({ ...had, level }));
        } catch {}
      },
      [PROGRESS_KEY, spec.level],
    );
  }
}
