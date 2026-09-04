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
 * every frame this tool has ever taken of a gated wave has them over the top
 * two thirds of it, and they were still there 2500 ticks in.
 *
 * Painting is the only thing that moves them, which is why this is a loop of
 * `paint` and not another `advance`. Its own file rather than the bottom of
 * `opening.ts`: that file was near the 250-line ceiling, and it is about what
 * is *holding* the field — a world thing, cleared by stepping it — where this
 * is about what is painted over it.
 */

/**
 * How many frames the arrival takes, plus a margin.
 *
 * `LAUNCH_LIFE` is imported rather than copied — `opening.ts` copies
 * `OPENING_PLAY` because the line that reads it runs inside the browser, and
 * this number does not: it is arithmetic in Node and only the frame count
 * crosses. By source path rather than by package name, the way `main.ts`
 * reaches `tools/build-stamp.ts`, so this tool needs no dependency on the
 * package it draws one number from.
 *
 * The margin covers the one case an import cannot: `bun run frames <sha>`
 * drives a *parent* build too, whose animation may be a little longer than
 * today's. It costs nothing on a build with no arrival to paint out.
 */
const FRAMES = Math.ceil(LAUNCH_LIFE * 60) + 20;

/**
 * Paint the wave's arrival out, so the frame that is kept is of the field.
 *
 * The frames are spent on the page's own clocks and not on the world's:
 * nothing is stepped here, so the picture is the same instant of the same
 * wave it would have been — with the rings a second older, which is to say
 * gone.
 */
export async function settleLaunch(page: Page): Promise<void> {
  await page.evaluate((n) => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing mid-capture");
    for (let i = 0; i < n; i++) ns.paint();
  }, FRAMES);
}

/** What a capture spends on it — read by the test that holds this to the
 * animation's own length. */
export const LAUNCH_FRAMES = FRAMES;
