#!/usr/bin/env bun

/**
 * `bun run shot <#selector> <out.png> [--open "≡ RELEASE NOTES"] [--tab GRAPHICS]
 * [--inner WORDINGS] [--serve] [--wait 2500] [--select ".versus-rate=0.25"]` —
 * photograph one element of the running director.
 *
 * CLAUDE.md's *Showing the owner something* says to send a PNG and never a
 * path, and there were two tools for it: `bun run frames <sha>` for the game
 * and `bun run png <in.svg> <out.png>` for the shape sheets. There was nothing
 * for the **director**, which is where every look is now decided — SHAPES,
 * VERSUS, the concept pages, and both new effect axes are in it, and none of
 * them is an SVG on disk.
 *
 * The GLOW lane hand-rolled this same throwaway four times before it was
 * written down; the HITS lane wanted it a fifth. That is the definition of
 * friction paid again on everything that follows, so it is a tool now.
 *
 * **It wants a director on `--port`, or starts one itself with `--serve`.**
 * The second is what a session with no way to leave a server running needs
 * (`director-serve.ts`); the first is the cheap path when one is already up.
 *
 * It borrows the headless Chrome `capture.ts` already finds, for the reason
 * `svg.ts` gives: one more browser to open a page we can already open would be
 * a dependency bought for thirty lines. It lives in `tools/frames/` and not at
 * the repository root because `playwright-core` is a dependency of *that*
 * package, and a script at the root cannot resolve it — the same trap
 * CLAUDE.md names about a scratch script and `@neon-spore/*`.
 *
 * The **element** is screenshotted rather than the page, so the output is
 * cropped to the thing being judged with no chrome to trim, and at
 * `deviceScaleFactor: 2` so a 92 px card arrives as 184 px of picture. A phone
 * showing a downscaled screenshot of a downscaled card is how a look gets
 * approved that nobody actually saw. `--at` narrows that again, for an element
 * that is much larger than the change inside it.
 */

import { closeBrowser, launchBrowser } from "./capture.js";
import { startDirector } from "./director-serve.js";
import { elementOr, listen, refuseFailed, waitUntil } from "./page-said.js";
import { shootAt } from "./shot-at.js";
import { readShotFlags } from "./shot-flags.js";
import { reachPose } from "./shot-pose.js";
import { inRow, reachRow } from "./shot-row.js";
import { reachState, Unreachable } from "./shot-state.js";
import { withHeightFor } from "./tall.js";
import { REFUSED } from "./versus-refuse.js";

const {
  selector,
  out,
  reach,
  settle,
  refuse,
  until,
  row,
  pose,
  serve,
  port,
  path,
  viewport,
  scale,
  at,
} = readShotFlags(process.argv.slice(2));
const { width: vw, height: vh } = viewport;

const director = serve ? await startDirector() : null;
const url = `http://localhost:${director?.port ?? port}${path}`;

const browser = await launchBrowser();
try {
  const page = await browser.newPage({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: scale,
  });
  // Listened to before it is opened, so what a page throws while loading is
  // in the report when the element is missing or the wait runs out
  // (`page-said.ts`).
  const said = listen(page);
  const response = await page.goto(url, { waitUntil: "networkidle" });

  let target: ReturnType<typeof page.locator>;
  try {
    // A page that never built is answered with an error and throws nothing,
    // so it is refused here rather than waited on (`bun-overlay.ts`).
    await refuseFailed(page, response, said);
    await reachState(page, reach);
    if (until) await waitUntil(page, until, said);
    await page.waitForTimeout(settle);
    if (refuse && (await page.locator(refuse).count()) > 0) {
      throw new Unreachable(`refused: the page shows ${refuse}`, REFUSED);
    }
    if (row) await reachRow(page, row);
    if (pose) await reachPose(page, pose);
    target = await elementOr(page, row || pose ? inRow(selector) : selector, said);
  } catch (error) {
    if (!(error instanceof Unreachable)) throw error;
    console.error(error.message);
    process.exit(error.code);
  }
  // The page's own `scrollIntoView`, not Playwright's `scrollIntoViewIfNeeded`:
  // that one first waits for the element to be *stable* — the same box on
  // two consecutive animation frames — and a VERSUS pair on a tile crop is
  // refitted around the body it follows, so the wait timed out on echo shots
  // with the frozen frame sitting right there. Scrolling asks no questions.
  // To the middle, not the top: a documentation page's sticky heading stands
  // over the top of its body, and a HELPERS row's canvas scrolled to `start`
  // came back with THE SHIELD › DEFLECTED printed across its first 70 px.
  await target.first().evaluate((el: Element) => el.scrollIntoView({ block: "center" }));
  // A second settle after scrolling: figures are only animated while in sight,
  // so one just scrolled to has had no frames yet and would photograph in its
  // rest pose. `shape-loop.ts`'s observer is what makes that true.
  await page.waitForTimeout(Math.min(settle, 1200));
  // A crop clips in *page* coordinates, so the rectangle the caller measured
  // inside the element has to be moved onto where the element sits — the same
  // step, and the same helper, `capture.ts` uses for `#stage`. Every step of
  // it on a clock (`shot-at.ts`).
  if (at) {
    try {
      console.log(await shootAt({ page, target, selector, at, viewport, out }));
    } catch (error) {
      if (!(error instanceof Unreachable)) throw error;
      console.error(error.message);
      process.exitCode = error.code;
    }
  } else {
    // The whole of it, however tall: an element past the fold is painted black
    // below the window unless the window is grown to fit it first (`tall.ts`).
    await withHeightFor(page, target.first(), vw, vh, async () => {
      // The page's camera clipped to the element's box, not the element's own
      // `screenshot`: that one first waits for the element to be *stable* —
      // the same box on two consecutive animation frames — and a VERSUS pair
      // is never reliably that. Its stage is refitted around a body the tile
      // crop follows, and on a machine painting slowly the wait timed out on
      // one echo shot in three, at every scale, with the frozen frame sitting
      // right there. A box is measured once and photographed.
      const box = await target.first().boundingBox();
      if (!box) throw new Error(`${selector} has no box to photograph`);
      await page.screenshot({ path: out, clip: box });
    });
  }
  if (!process.exitCode) console.log(`wrote ${out}`);
} finally {
  await closeBrowser(browser);
  await director?.stop();
}
