#!/usr/bin/env bun

/**
 * `bun run shot <#selector> <out.png> [--open "≡ RELEASE NOTES"] [--tab SHAPES]
 * [--inner SPEC] [--wait 2500] [--hold Control]` — photograph one element of
 * the running director.
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

import { closeBrowser, launchBrowser } from "./capture.js";

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const [selector, out] = positional;

if (!selector || !out) {
  console.error(
    'usage: bun run shot <#selector> <out.png> [--open "≡ RELEASE NOTES"] [--tab SHAPES] [--wait 2500]',
  );
  console.error('       --click is a CSS selector pressed first, e.g. ".cell:has(img)"');
  console.error("       --nth is which of its matches to press, counting from 1");
  console.error('       --inner is a tab inside the sheet --open just opened, e.g. "SPEC"');
  console.error('       --path is what the port is asked for, e.g. "/?play=1" — the field itself');
  console.error("       --size is a viewport, e.g. 390x844 — a phone, for something a phone shows");
  console.error("       --open is a header button to press first, for a sheet that starts hidden");
  console.error("       --tab is a NOT BUILT YET tab name; omit it for the main screen");
  console.error("       --wait is milliseconds to settle before the shot, for an animation");
  console.error("       --hold is a modifier key held down for the shot, e.g. Control");
  process.exit(1);
}

const tab = flag("tab");
/**
 * A tab *inside* the sheet `--open` just opened. `--tab` presses NOT BUILT
 * YET's own strip and nothing else, so every other sheet's rooms — SPEC,
 * GUIDES, CONTROLS, the three inside CONTROLS — were unreachable and each
 * wanted a hand-rolled Playwright script again. That is the friction this
 * whole file was written to stop, so it is a flag.
 */
const inner = flag("inner");
// A state only a held key reveals cannot be photographed by pressing buttons:
// the palette says what Ctrl-click would do only while Ctrl is down
// (`tools/director/src/palette.ts`). One flag rather than a second script.
const hold = flag("hold");
/**
 * A CSS selector pressed before the shot. `--open`, `--tab` and `--inner`
 * reach a sheet by the label on its button, and nothing reached a panel that
 * only exists once something on the *map* is selected: the rows under a cell
 * are built from the arrival in it, so THE FENCE's GAPS and CRACKS chips
 * could not be photographed at all. That is the friction this file was
 * written to end, said again about a different panel, so it is a flag rather
 * than a fifth throwaway script.
 *
 * A selector and not a label, because a cell carries a picture rather than a
 * word — `.cell:nth-of-type(4)` is the only handle a map square has.
 */
const click = flag("click");
/**
 * Which of the matches `--click` presses, counting from 1. A map is a grid of
 * identical squares and the only thing that tells two of them apart is their
 * order, so a selector alone reaches the first fence on a wave and no other.
 * Default 1, which is what a selector on its own has always meant.
 */
const nth = Number(flag("nth") ?? 1);
const open = flag("open");
const settle = Number(flag("wait") ?? 2500);
const port = flag("port") ?? "4174";
/**
 * The viewport. The director is a desk tool and 1240x900 is what it is judged
 * at, but `--port` already points this at anything the tree serves — and the
 * game is a portrait phone. A picture of a phone screen taken 1240 px wide is
 * a picture of a layout nobody will ever see.
 */
const [vw, vh] = (flag("size") ?? "1240x900").split("x").map(Number);
/**
 * What to ask that port for. The director is one page and has always been the
 * bare origin, but `--port` points this at anything the tree serves — and the
 * game keeps its field behind `?play=1`, so a shot of it without this is a
 * picture of the main menu.
 */
const path = flag("path") ?? "";
const url = `http://localhost:${port}${path}`;

const browser = await launchBrowser();
try {
  const page = await browser.newPage({
    viewport: { width: vw || 1240, height: vh || 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(url, { waitUntil: "networkidle" });

  // Every full-screen sheet starts `display: none` and is only built when its
  // header button is pressed, so a selector inside one photographs nothing
  // until it has been. `--open` presses any of them by label; `--tab` is the
  // NOT BUILT YET case, which additionally has a tab strip inside it.
  if (open) {
    await page.getByRole("button", { name: open }).click();
    await page.waitForTimeout(600);
  }
  if (tab) {
    // Both waits are real: the sheet builds sixty animated figures and the tab
    // it lands on rebuilds them again.
    await page.getByRole("button", { name: "NOT BUILT YET" }).click();
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: tab, exact: true }).click();
  }
  if (inner) {
    // Pressed in the page rather than through Playwright's locator engine.
    // An inner tab lives in a sheet that was `display: none` a moment ago, and
    // both `click()` and `dispatchEvent()` on a role locator spent thirty
    // seconds waiting for that to settle and then timed out — twice, on a
    // strip of plain buttons wired to `click`. The visible one with that
    // label is unambiguous, and pressing it is one line.
    const pressed = await page.evaluate((label: string) => {
      for (const b of document.querySelectorAll("button")) {
        if (b.textContent?.trim() === label && b.offsetParent !== null) {
          b.click();
          return true;
        }
      }
      return false;
    }, inner);
    if (!pressed) {
      console.error(`no visible button reads ${inner} — is --open the right sheet?`);
      process.exit(2);
    }
    await page.waitForTimeout(600);
  }
  if (click) {
    const pressed = await page.evaluate(
      ({ sel, at }: { sel: string; at: number }) => {
        const el = document.querySelectorAll<HTMLElement>(sel)[at - 1];
        if (!el) return false;
        el.scrollIntoView({ block: "center", inline: "center" });
        el.click();
        return true;
      },
      { sel: click, at: nth },
    );
    if (!pressed) {
      console.error(`no element ${nth} matches ${click} — nothing was pressed`);
      process.exit(2);
    }
    await page.waitForTimeout(600);
  }
  if (hold) await page.keyboard.down(hold);
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
  await closeBrowser(browser);
}
