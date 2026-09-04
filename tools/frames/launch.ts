import type { Page } from "playwright-core";
import { LAUNCH_LIFE } from "../../packages/render/src/opening-fx.js";

/**
 * Getting the *wave's arrival* out of the picture, which is the step after
 * getting its opening out of the way (`opening.ts`, which calls this).
 *
 * Crossing the ready gate throws two rings over the whole field — one violet,
 * one amber — and they run on the **frame** clock. A capture steps the
 * simulation and paints only at the moment each picture is taken, so it handed
 * the animation a sixtieth of a second per photograph and never got past it:
 * every frame this tool took of a gated wave had them over the top two thirds
 * of it, and they were still there 2500 ticks in.
 *
 * Painting is the only thing that moves them, which is why this is a loop of
 * `paint` and not another `advance`. Its own file rather than the bottom of
 * `opening.ts`: that file was near the 250-line ceiling, and it is about what
 * is *holding* the field — a world thing, cleared by stepping it — where this
 * is about what is painted over it.
 */

/**
 * Frames given to the arrival before this gives up on it. `LAUNCH_LIFE` is
 * 0.72s at a sixtieth each (`render/opening-fx.ts`), so this is nearly four
 * times what it takes — enough that a slower animation still finishes, and
 * short enough that a build whose rings never end says so rather than spins.
 */
const MAX_FRAMES = 160;

/**
 * Frames painted on a build that cannot be asked.
 *
 * `bun run frames <sha>` drives a commit and its own parent, and a parent from
 * between the rings landing and `launching` being exposed has them with no way
 * to report them. `LAUNCH_LIFE` is imported rather than copied — the
 * arithmetic is in Node and only the count crosses — by source path, the way
 * `main.ts` reaches `tools/build-stamp.ts`, so this tool takes on no
 * dependency for one number. The margin covers a parent whose animation was a
 * little longer than today's.
 */
export const BLIND_FRAMES = Math.ceil(LAUNCH_LIFE * 60) + 20;

/**
 * Paint the wave's arrival out, so the frame that is kept is of the field.
 *
 * The frames are spent on the page's own clocks and not on the world's:
 * nothing is stepped here, so the picture is the same instant of the same wave
 * it would have been — with the rings a second older, which is to say gone.
 */
export async function settleLaunch(page: Page): Promise<void> {
  const asks = await page.evaluate(() => typeof window.neonSpore?.launching === "function");
  if (!asks) {
    await page.evaluate((n) => {
      for (let i = 0; i < n; i++) window.neonSpore?.paint();
    }, BLIND_FRAMES);
    return;
  }
  const painted = await page.evaluate((max) => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing mid-capture");
    let i = 0;
    while (ns.launching?.() && i < max) {
      ns.paint();
      i++;
    }
    return i;
  }, MAX_FRAMES);
  if (painted >= MAX_FRAMES) {
    throw new Error(
      `the wave was still arriving after ${MAX_FRAMES} painted frames — ` +
        "its launch animation never ends",
    );
  }
}
