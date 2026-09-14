#!/usr/bin/env bun

/**
 * `bun run menu-shot <out.png> [--page "SETTINGS > CONTROLS"] [--size 390x844]
 * [--scale 2] [--wait 600] [--port 4173] [--element "#menu"]` — photograph a
 * page of the **game's menu**.
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
 * **It arrives as a device that has already met the intro.** The scene plays
 * over the menu on a first visit (`apps/game/src/intro.ts`), so without this
 * the capture waits on a hidden `#menu` until it times out. The stamp is
 * written through `addInitScript`, before the first navigation, and its key
 * and version are imported from the game rather than typed here: a version
 * that went stale would put the scene back and the failure would look like a
 * broken selector.
 *
 * It waits for `#menu.on` and not for `#menu`: the element is in the document
 * from the first paint and hidden until the menu opens.
 */

import { INTRO_KEY, INTRO_VERSION } from "../../apps/game/src/intro.js";
import { closeBrowser, launchBrowser } from "./browser.js";
import { root } from "./exec.js";
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
/** What is photographed. `#menu` is the whole of it; a caller judging one row
 * can say `.entry`, `.seat-card` or anything else the page carries. */
const element = flag("element") ?? "#menu";
const port = flag("port");

const preview = port
  ? { url: `http://127.0.0.1:${port}`, stop: async (): Promise<void> => {} }
  : await startPreview(root);
const browser = await launchBrowser();
try {
  const context = await browser.newContext({
    viewport: { width: vw || 390, height: vh || 844 },
    deviceScaleFactor: scale,
  });
  // Before the first navigation, so the bundle reads it on the way up rather
  // than after the scene has already started.
  await context.addInitScript(
    ([key, version]) => {
      try {
        localStorage.setItem(key as string, version as string);
      } catch {
        // A browser that refuses storage shows the intro; the wait below says so.
      }
    },
    [INTRO_KEY, INTRO_VERSION],
  );
  const page = await context.newPage();
  await page.goto(preview.url, { waitUntil: "networkidle" });
  await page.waitForSelector("#menu.on", { timeout: 15_000 });

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
  console.log(`wrote ${out} — ${flag("page") ?? "the front page"}, ${vw}x${vh} at ${scale}x`);
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
  console.error("       --port attaches to a preview already running instead of starting one");
  process.exit(1);
}
