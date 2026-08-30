#!/usr/bin/env bun

/**
 * `bun run shot <#selector> <out.png> [--tab SHAPES] [--wait 2500]` — photograph
 * one element of the running director.
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
 * approved that nobody actually saw.
 */

import { chromium } from "playwright-core";
import { findChrome } from "./capture.js";

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const [selector, out] = positional;

if (!selector || !out) {
  console.error("usage: bun run shot <#selector> <out.png> [--tab SHAPES] [--wait 2500]");
  console.error("       --tab is a NOT BUILT YET tab name; omit it for the main screen");
  console.error("       --wait is milliseconds to settle before the shot, for an animation");
  process.exit(1);
}

const tab = flag("tab");
const settle = Number(flag("wait") ?? 2500);
const port = flag("port") ?? "4174";
const url = `http://localhost:${port}`;

const browser = await chromium.launch({ executablePath: await findChrome(), headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1240, height: 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(url, { waitUntil: "networkidle" });

  if (tab) {
    // The sheets live behind the header button; the tab strip only exists once
    // it is open. Both waits are real: the sheet builds sixty animated figures
    // and the tab it lands on rebuilds them again.
    await page.getByRole("button", { name: "NOT BUILT YET" }).click();
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: tab, exact: true }).click();
  }
  await page.waitForTimeout(settle);

  const target = page.locator(selector);
  if ((await target.count()) === 0) {
    console.error(`no element matches ${selector} — is the tab right?`);
    process.exit(2);
  }
  await target.first().scrollIntoViewIfNeeded();
  // A second settle after scrolling: figures are only animated while in sight,
  // so one just scrolled to has had no frames yet and would photograph in its
  // rest pose. `shape-loop.ts`'s observer is what makes that true.
  await page.waitForTimeout(Math.min(settle, 1200));
  await target.first().screenshot({ path: out });
  console.log(`wrote ${out}`);
} finally {
  await browser.close();
}
