#!/usr/bin/env bun

/**
 * `bun run shot <#selector> <out.png> [--open "≡ RELEASE NOTES"] [--tab SHAPES]
 * [--inner SPEC] [--wait 2500] [--hold Control] [--select ".versus-rate=0.25"]` —
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
import { clipFor, parseAt } from "./crop.js";
import { reachState, Unreachable } from "./shot-state.js";
import { usage } from "./shot-usage.js";
import { withHeightFor } from "./tall.js";

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const [selector, out] = positional;

if (!selector || !out) usage();

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
/**
 * `--until <selector>`: wait for something on the page to *say* it is ready
 * before the timed settle starts. A page that reaches its state on its own
 * clock — a VERSUS pair running tick by tick to a `--freeze` — cannot be
 * waited for by guessing a number of milliseconds; the guess was short every
 * time the page had more to do first, and the picture was of the wrong
 * moment with nothing to say so.
 */
const until = flag("until");
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
/**
 * `--at x,y,w,h`, a rectangle inside the element, in its own CSS pixels.
 *
 * The element is the unit this tool photographs, and some of them are not the
 * size of the thing being judged: the map's `#grid` is twenty-five beats tall
 * and a change to what one *cell* draws arrives as a stamp somewhere in four
 * thousand pixels of empty board. `bun run frames` has had this flag since the
 * eyelid lane could not see its own work; the same argument applies here, and
 * the parser is `crop.ts`'s rather than a second copy of it.
 */
const at = flag("at") === undefined ? null : parseAt(flag("at") as string);
/**
 * `--type "#waveFilter=boss"`, a field to fill before the shot.
 *
 * A page that only *has* a state once somebody has typed into it cannot be
 * photographed by pressing buttons — the wave list under a filter
 * (`tools/director/src/rail-filter.ts`) is the first, and it is the same
 * argument `--hold` already makes about a state only a held key reveals.
 * `fill` rather than `press`, because what the page listens for is `input`.
 */
const typed = flag("type");
/**
 * `--select ".versus-rate=0.25"`, a picker to turn before the shot.
 *
 * `--type` is `locator.fill` and throws on a `<select>`, so a state that only a
 * dropdown reaches was out of reach entirely. VERSUS's own rate picker is the
 * one that paid for this: at 0.25× a thrust that burns for one beat of a
 * two-second replay stretches past the whole window, so every frame carries it
 * — and finding one frame that did had cost about thirty-five shots ranked by
 * PNG file size.
 */
const select = flag("select");
/**
 * `--scale 6`, the device scale factor, default 2.
 *
 * `--at` clips a rectangle out of the frame and the magnification is only
 * ever this number — so a crop the size of a creature came back as a body
 * ninety pixels wide, which is not a picture a session can correct a look
 * from. The ghost interior lane took five shots at 2x before finding that the
 * flag it wanted did not exist. A creature is judged at 26 px on a phone and
 * at six times that on a desk, and both are the same frame at a different
 * scale factor; the browser paints it, and nothing is stretched.
 */
const scale = Number(flag("scale") ?? 2);
const url = `http://localhost:${port}${path}`;

const browser = await launchBrowser();
try {
  const page = await browser.newPage({
    viewport: { width: vw || 1240, height: vh || 900 },
    deviceScaleFactor: scale,
  });
  await page.goto(url, { waitUntil: "networkidle" });

  try {
    await reachState(page, { open, tab, inner, click, nth, type: typed, select, hold });
  } catch (error) {
    if (!(error instanceof Unreachable)) throw error;
    console.error(error.message);
    process.exit(error.code);
  }
  // Ten minutes: a machine running a full check paints a headless frame at
  // about eight a second, and a wrong picture is worse than a slow one.
  if (until) await page.locator(until).first().waitFor({ state: "attached", timeout: 600_000 });
  await page.waitForTimeout(settle);

  const target = page.locator(selector);
  if ((await target.count()) === 0) {
    console.error(`no element matches ${selector} — is the tab right?`);
    process.exit(2);
  }
  // The page's own `scrollIntoView`, not Playwright's `scrollIntoViewIfNeeded`:
  // that one first waits for the element to be *stable* — the same box on
  // two consecutive animation frames — and a VERSUS pair on a tile crop is
  // refitted around the body it follows, so the wait timed out on echo shots
  // with the frozen frame sitting right there. Scrolling asks no questions.
  await target.first().evaluate((el: Element) => el.scrollIntoView({ block: "start" }));
  // A second settle after scrolling: figures are only animated while in sight,
  // so one just scrolled to has had no frames yet and would photograph in its
  // rest pose. `shape-loop.ts`'s observer is what makes that true.
  await page.waitForTimeout(Math.min(settle, 1200));
  // A crop clips in *page* coordinates, so the rectangle the caller measured
  // inside the element has to be moved onto where the element sits — the same
  // step, and the same helper, `capture.ts` uses for `#stage`.
  if (at) {
    // The rectangle has to be *on screen* before it can be clipped out of a
    // screenshot, and `scrollIntoViewIfNeeded` only brings the element's top
    // into view — a crop 1200 px down a map twenty-five beats tall was outside
    // the picture and Playwright refused it. So the nearest ancestor that
    // actually scrolls is moved by the crop's own offset first; the director's
    // columns scroll inside themselves, so this is rarely the window.
    await target.first().evaluate((el: Element, dy: number) => {
      for (let node = el.parentElement; node; node = node.parentElement) {
        if (node.scrollHeight > node.clientHeight) {
          node.scrollTop += dy;
          return;
        }
      }
      window.scrollBy(0, dy);
    }, at.y);
    await page.waitForTimeout(200);
    const box = await target.first().boundingBox();
    if (!box) throw new Error(`${selector} has no box to crop out of`);
    await page.screenshot({ path: out, clip: clipFor(box, at) });
  } else {
    // The whole of it, however tall: an element past the fold is painted black
    // below the window unless the window is grown to fit it first (`tall.ts`).
    await withHeightFor(page, target.first(), vw || 1240, vh || 900, async () => {
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
  console.log(`wrote ${out}`);
} finally {
  await closeBrowser(browser);
}
