import type { Locator, Page } from "playwright-core";

/**
 * **An element taller than the window, photographed whole.**
 *
 * Playwright screenshots an element by clipping it out of the page, and a page
 * only paints what is in the viewport: an element taller than the window came
 * back as its top and then black — the director's STYLE tab returned three of
 * its six colour groups drawn and the rest an empty rectangle the height of
 * the missing content. A longer `--wait` changed nothing, because it is not a
 * settling problem, and the picture *looks* like a page that failed to render
 * rather than a shot that failed to take. The workaround a lane found on its
 * own was to raise `--size` until the element fitted, which is not
 * discoverable and is the wrong number to have to know.
 *
 * So the window is grown to the element's own height for the length of the
 * shot and put back afterwards. The viewport rather than the scroll container,
 * because that needs no knowledge of which ancestor scrolls — and everything
 * in the director lays out against the window's width, which is left alone.
 */

/** As tall as a shot will grow the window. Beyond this the picture is bigger
 * than anything a phone will show and the browser starts refusing the buffer;
 * a taller element is photographed to here and said to be cut. */
const TALLEST = 8000;

export async function withHeightFor(
  page: Page,
  target: Locator,
  width: number,
  height: number,
  shoot: () => Promise<void>,
): Promise<void> {
  const box = await target.boundingBox();
  const wanted = Math.ceil(box?.height ?? 0) + 40;
  if (wanted <= height) {
    await shoot();
    return;
  }
  const grown = Math.min(wanted, TALLEST);
  if (wanted > TALLEST) {
    console.error(
      `the element is ${Math.ceil(box?.height ?? 0)} px tall and the window stops at ${TALLEST} — ` +
        "the picture is cut off the bottom. Use --at to take it in bands",
    );
  }
  await page.setViewportSize({ width, height: grown });
  // The layout is recomputed against the taller window and anything watching
  // for an element coming into sight — `shape-loop.ts`'s observer, which is
  // what animates a figure at all — now sees the whole of it.
  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  try {
    await shoot();
  } finally {
    await page.setViewportSize({ width, height });
  }
}
