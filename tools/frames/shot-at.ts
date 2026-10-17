import type { Locator, Page } from "playwright-core";
import { type Crop, clipFor, onDocument } from "./crop.js";
import { within } from "./deadline.js";
import { Unreachable } from "./shot-state.js";
import { TALLEST } from "./tall.js";

/**
 * **`bun run shot --at`: a rectangle inside the element, photographed — and
 * every step of it on a clock.**
 *
 * It was `shot.ts`'s own branch until 17 October 2026, and on 16 October a
 * `versus:shot … --freeze 0.6 --at 0,0,380,190` printed nothing for ten
 * minutes and was stopped by hand. The same command wrote its PNG in twenty
 * seconds the next day, on that day's tree and on the commit it was filed
 * from, so the stall was the machine and not the clip — but the headless
 * Chrome of the stopped run was still alive fourteen hours later. Two of the
 * steps here, a page `evaluate` and `setViewportSize`, carry no timeout of
 * their own, so a renderer that stops answering is waited on for as long as
 * the caller will wait, the error that would name the step is never thrown,
 * and the `finally` that closes the browser never runs. `deadline.ts`
 * exists for exactly that, and now each step runs inside it.
 */

/** How long one step of the crop may take. A healthy one takes well under a second. */
export const STEP_MS = 60_000;

export interface AtShot {
  page: Page;
  /** The element the rectangle is measured inside: its first match. */
  target: Locator;
  /** How it was asked for, for the line the shot prints. */
  selector: string;
  at: Crop;
  /** The window the page was opened at, put back after any growth. */
  viewport: { width: number; height: number };
  out: string;
  /** Per step, so a test can stall one without waiting a minute. */
  stepMs?: number;
}

/** Takes the picture and returns the line `shot.ts` prints about it. Throws
 * `Unreachable` (exit 2) naming the step that ran out of time. */
export async function shootAt(shot: AtShot): Promise<string> {
  const { page, target, selector, at, out } = shot;
  const { width: vw, height: vh } = shot.viewport;
  const ms = shot.stepMs ?? STEP_MS;
  const step = <T>(name: string, p: Promise<T>): Promise<T> =>
    within(p, Date.now() + ms, `--at: ${name} took longer than ${ms} ms`).catch((e: unknown) => {
      throw new Unreachable((e as Error).message, 2);
    });

  // The rectangle has to be *on screen* before it can be clipped out of a
  // screenshot, and it used to be brought there by scrolling — the nearest
  // scrolling ancestor by the crop's own offset, or the window. That mixed
  // two coordinate systems: Playwright measures a `boundingBox` against the
  // viewport and takes a clip against the document, and the two agree only
  // while nothing has scrolled (`crop.ts`, `onDocument`). So nothing scrolls
  // now: the window is grown until the crop is inside it (`tall.ts`'s move),
  // the page is put back at its top, and a box measured then is the same
  // box in either system.
  await step(
    "scrolling to the top",
    page.evaluate(() => window.scrollTo(0, 0)),
  );
  const first = await step("measuring the element", target.first().boundingBox());
  if (!first) throw new Error(`${selector} has no box to crop out of`);
  const needed = Math.ceil(first.y + at.y + at.height) + 40;
  const grown = needed > vh ? Math.min(needed, TALLEST) : null;
  if (grown !== null) {
    await step("growing the window", page.setViewportSize({ width: vw, height: grown }));
    await step(
      "scrolling to the top",
      page.evaluate(() => window.scrollTo(0, 0)),
    );
    await page.waitForTimeout(600);
  }
  try {
    const box = await step("measuring the element", target.first().boundingBox());
    if (!box) throw new Error(`${selector} has no box to crop out of`);
    const scroll = await step(
      "reading the scroll",
      page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })),
    );
    await step(
      "taking the screenshot",
      page.screenshot({ path: out, clip: clipFor(onDocument(box, scroll), at) }),
    );
    // Said aloud, because the rectangle is in the element's own pixels and
    // an element is not always the size a caller pictured: a VERSUS window
    // on a three-tile pose is 104 px square, not the 172 a five-tile one
    // is, and a crop written for the second overran the first and came
    // back as the prose under the phones — which a lane read as a bug in
    // the clip and queued (`docs/queue.md`, 10 September 2026).
    return `clip ${at.x},${at.y},${at.width},${at.height} of ${selector} at ${Math.round(box.width)}x${Math.round(box.height)}`;
  } finally {
    // On the clock and quiet: a window that cannot be put back belongs to the
    // browser `closeBrowser` is about to take down anyway, and the reason
    // already in flight is the one worth printing.
    if (grown !== null) {
      await step("shrinking the window", page.setViewportSize({ width: vw, height: vh })).catch(
        () => {},
      );
    }
  }
}
