#!/usr/bin/env bun

/**
 * `bun run menu-shot <out.png> [--page "SETTINGS > CONTROLS"] [--size 390x844]
 * [--scale 2] [--wait 600] [--port 4173] [--element "#menu"] [--desk]
 * [--first-visit]` — photograph a page of the **game's menu**.
 *
 * Three tools took a picture and none of them could take this one. `bun run
 * frames <sha>` drives the field through `window.neonSpore` and photographs
 * `#stage`; `bun run shot` photographs an element of the *director*, and wants
 * a server somebody else has already started; `bun run png` rasterises an SVG
 * on disk. The menu is markup over the game's own canvas, so a lane that
 * changed a row, a page or the tagline had nothing to point at and wrote a
 * throwaway instead — twice in one sitting on the lane that queued this, which
 * is the count that turned `shot.ts` from a habit into a tool.
 *
 * **It starts its own preview and stops it again**, which is the half a flag on
 * `shot.ts` could not have been: a session with no way to leave a server
 * running — CLAUDE.md forbids backgrounding one, and `.claude/launch.json` is
 * for a person at a desk — cannot use a tool that assumes one is up.
 * `--port` skips that for somebody who does have one.
 *
 * **It arrives as a device that has already been here.** Two screens stand in
 * front of the menu on a first visit — the intro scene (`apps/game/src/intro.ts`)
 * and the question of what this device is called (`apps/game/src/hello.ts`) —
 * and either of them leaves the capture waiting on a hidden `#menu` until it
 * times out. So both are stamped away: the intro's version, and a name. The
 * stamps go in through `addInitScript`, before the first navigation, and every
 * key is imported from the game rather than typed here — one that went stale
 * would put the screen back and the failure would look like a broken selector.
 *
 * **`--first-visit` is how the first meeting itself is photographed.** It
 * leaves the name unstamped and waits for `#hello.on` instead: the screen
 * exists to be seen by a device that has never given one, and a tool that can
 * only arrive past it cannot show it. The intro stays stamped away either
 * way — twenty seconds of scene is not what is being judged.
 *
 * **And as a phone rather than as a desk.** A viewport is a size; the pointer
 * is a separate pair of context options, and without them headless Chromium
 * reports a mouse at any width. `menu-device.ts` carries that decision and the
 * argument for which way round its default goes.
 *
 * It waits for `#menu.on` and not for `#menu`: the element is in the document
 * from the first paint and hidden until the menu opens.
 */

import { INTRO_KEY, INTRO_VERSION } from "../../apps/game/src/intro.js";
import { NAME_KEY } from "../../apps/game/src/nickname.js";
import { closeBrowser, launchBrowser } from "./browser.js";
import { root } from "./exec.js";
import { menuDevice } from "./menu-device.js";
import { noSuchButton, parseTrail } from "./menu-trail.js";
import { startPreview } from "./serve.js";

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const out = positional[0];

if (!out) usage();

/** How many presses on the spore open the rig — `RIG_TAPS` in `menu-view.ts`. */
const RIG_TAPS = 3;
/** What a page takes to swap itself in. The pages are all in the document and
 * the change is one class, so this is a frame or two rather than a build. */
const PAGE_MS = 250;

const trail = parseTrail(flag("page"));
/**
 * A portrait phone by default, and not the director's desk. The menu is read
 * on a phone and nowhere else; a picture of it 1240 px wide is a picture of a
 * layout nobody will ever see, which is `shot.ts`'s own argument for `--size`.
 */
const [vw, vh] = (flag("size") ?? "390x844").split("x").map(Number);
/** Real pixels for the same picture, for `shot.ts`'s reason: a phone showing a
 * downscaled screenshot of a downscaled row is how a look gets approved that
 * nobody actually saw. */
const scale = Number(flag("scale") ?? 2);
/** Milliseconds to settle before the shot: the spore breathes and the sky
 * drifts while the menu is up, so a picture taken on arrival catches both
 * mid-step. */
const settle = Number(flag("wait") ?? 600);
/**
 * Arrive with no name, which is the one thing that puts the first meeting in
 * front of the menu (`apps/game/src/hello.ts`). The default is past it: nearly
 * every page this tool is pointed at is behind it.
 */
const firstVisit = args.includes("--first-visit");
/** The screen this shot is of. Each is in the document only while it is up, or
 * hidden until it opens, so both are waited for by their `.on`. */
const screen = firstVisit ? "#hello.on" : "#menu.on";
/** What is photographed. The whole screen; a caller judging one row can say
 * `.entry`, `.seat-card` or anything else the page carries. */
const element = flag("element") ?? (firstVisit ? "#hello" : "#menu");
/** A thumb or a mouse — `menu-device.ts` has the argument. */
const device = menuDevice(args);
const port = flag("port");

const preview = port
  ? { url: `http://127.0.0.1:${port}`, stop: async (): Promise<void> => {} }
  : await startPreview(root);
const browser = await launchBrowser();
try {
  const context = await browser.newContext({
    viewport: { width: vw || 390, height: vh || 844 },
    deviceScaleFactor: scale,
    ...device,
  });
  // Before the first navigation, so the bundle reads them on the way up rather
  // than after a screen has already opened over the one wanted.
  await context.addInitScript(
    (pairs) => {
      for (const [key, value] of pairs as [string, string][]) {
        try {
          localStorage.setItem(key, value);
        } catch {
          // A browser that refuses storage shows the screen; the wait says so.
        }
      }
    },
    [
      [INTRO_KEY, INTRO_VERSION],
      // A name, unless the shot is of the screen that asks for one. Any name:
      // nothing is drawn from it on the pages this tool photographs, and the
      // registry is never asked, because a stored name is never re-claimed.
      ...(firstVisit ? [] : [[NAME_KEY, "CAMERA"]]),
    ],
  );
  const page = await context.newPage();
  await page.goto(preview.url, { waitUntil: "networkidle" });
  await page.waitForSelector(screen, { timeout: 15_000 });

  for (const step of trail) {
    if (step.kind === "spore") {
      for (let i = 0; i < RIG_TAPS; i++) await page.locator("#menu .spore").click();
    } else {
      const offered = await press(page, step.label);
      if (offered) {
        console.error(noSuchButton(step.label, offered));
        process.exit(3);
      }
    }
    await page.waitForTimeout(PAGE_MS);
  }

  await page.waitForTimeout(settle);
  const target = page.locator(element);
  if ((await target.count()) === 0) {
    console.error(`no ${element} on the page ${flag("page") ?? "root"} is`);
    process.exit(4);
  }
  await target.first().screenshot({ path: out });
  const asWhat = device.hasTouch ? "a phone" : "a desk";
  const where = firstVisit ? "the first meeting" : (flag("page") ?? "the front page");
  console.log(`wrote ${out} — ${where}, ${vw}x${vh} at ${scale}x, as ${asWhat}`);
} finally {
  await closeBrowser(browser);
  await preview.stop();
}

/**
 * Press the button on the open page whose words are `label`, and say nothing.
 * Where there is none, the labels that *are* on it come back instead, for the
 * message `noSuchButton` makes of them.
 *
 * **A button's name is its `.label` span where it has one**, and its own text
 * otherwise. A row is a marker, a label and a description in three spans with
 * no whitespace between them, so its `textContent` reads
 * `▸SETTINGSSound, motion, buzz…` — which matches nothing a person would type
 * and is nonsense in the message. A switch is one string with its state on the
 * end, which is what the trailing-space test leaves room for: SOUND still
 * reaches `SOUND ON`.
 *
 * **Only what is on the page counts.** A row that does not apply is taken off
 * with `setEntry` rather than removed, and the two-step's own LEAVE and CANCEL
 * sit behind whichever row asked (`menu-rows.ts`, `menu-steps.ts`) — both are
 * still in the document. Pressing one of those would photograph a page nobody
 * standing here could have reached.
 */
async function press(
  page: import("playwright-core").Page,
  label: string,
): Promise<string[] | null> {
  return await page.evaluate((wanted: string) => {
    const open = document.querySelector("#menu .page.on");
    if (!open) return [];
    const shown = [...open.querySelectorAll("button")].filter((b) => b.getClientRects().length > 0);
    const name = (b: Element): string => {
      const own = b.querySelector(".label") ?? b;
      return (own.textContent ?? "").replace(/\s+/g, " ").trim();
    };
    const hit = shown.find((b) => {
      const text = name(b);
      return text === wanted || text.startsWith(`${wanted} `);
    });
    if (!hit) return shown.map(name).filter((t) => t !== "");
    (hit as HTMLButtonElement).click();
    return null;
  }, label);
}

function usage(): never {
  console.error(
    'usage: bun run menu-shot <out.png> [--page "SETTINGS > CONTROLS"] [--size 390x844]',
  );
  console.error("       --page is the words a thumb would press, in order; TESTING is the spore");
  console.error("       --size is a viewport, default 390x844 — the phone the menu is read on");
  console.error("       --scale is the device scale factor, default 2");
  console.error("       --wait is milliseconds to settle before the shot, default 600");
  console.error("       --element is what is photographed inside it, default #menu");
  console.error("       --desk photographs it as a mouse and a keyboard; the default is a thumb");
  console.error("       --port attaches to a preview already running instead of starting one");
  console.error("       --first-visit arrives with no name, on the screen that asks for one");
  process.exit(1);
}
