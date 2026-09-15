import type { Browser, Page } from "playwright-core";
import type { MenuDevice } from "./menu-device.js";
import { press } from "./menu-press.js";
import { arrivalStamps, type Played } from "./menu-stamps.js";
import { noSuchButton } from "./menu-trail.js";

/**
 * A PHONE IN A ROOM, as `room-shot.ts` and a throwaway probe both drive one.
 *
 * Split out of `room-shot.ts` the day a second walk wanted the same three
 * verbs — open a phone that has been here before, read what it is looking at,
 * press a trail of labels — without the command's own argument parsing round
 * them. The command is the walk; this is the phone.
 */

/** What a phone is looking at: the step's heading, and the code if it has one. */
export interface Looking {
  head: string;
  code: string;
  state: string;
  /** Who the two seat pills say, P1 then P2 — the names the room handed down. */
  seats: string[];
  /** What is inside each READY circle, P1 then P2: "" until a hold fills it. */
  ready: string[];
}

export interface PhoneShape {
  width: number;
  height: number;
  scale: number;
  device: MenuDevice;
}

/**
 * A phone that has been here before — past the intro, with a name — standing
 * on the menu of `url`, with `partners` in its list. The first meeting is a
 * different screen and `menu-shot --first-visit` is what photographs it.
 */
export async function openPhone(
  browser: Browser,
  url: string,
  who: string,
  shape: PhoneShape,
  partners: readonly Played[] = [],
): Promise<Page> {
  const ctx = await browser.newContext({
    viewport: { width: shape.width, height: shape.height },
    deviceScaleFactor: shape.scale,
    ...shape.device,
  });
  const page = await ctx.newPage();
  await page.addInitScript(
    ([pairs, name]: [[string, string][], string]) => {
      try {
        for (const [key, value] of pairs) localStorage.setItem(key, value);
        localStorage.setItem("neon-spore.name", name);
      } catch {}
    },
    [arrivalStamps({ firstVisit: false, partners }), who] as [[string, string][], string],
  );
  await page.goto(url, { waitUntil: "load" });
  await page.waitForSelector("#menu.on", { timeout: 30_000 });
  return page;
}

export function looking(page: Page): Promise<Looking> {
  return page.evaluate(() => ({
    head: document.querySelector("#joinScreen h2")?.textContent ?? "",
    code: (document.getElementById("joinCode")?.textContent ?? "").trim(),
    state: document.getElementById("joinState")?.textContent ?? "",
    seats: [...document.querySelectorAll("#joinSeats .pill .who")].map((s) =>
      (s.textContent ?? "").trim(),
    ),
    ready: [...document.querySelectorAll("#joinReady .circle .word")].map((s) =>
      (s.textContent ?? "").trim(),
    ),
  }));
}

/**
 * Hold this phone's own READY circle until it fills (`join-room-step.ts`):
 * the thumb goes down, stays past the hold, and lifts. The one press on step 4
 * that is not a click, which is why `walk` cannot do it.
 */
export async function holdReady(page: Page): Promise<void> {
  const box = await page.locator("#joinReady .circle.mine").boundingBox();
  if (!box) throw new Error("no READY circle of this phone's own is on the screen");
  await page.mouse.move(box.x + box.width / 2, box.y + box.width / 2);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(300);
}

/** Press each label in turn on whichever page is up, and fail loudly on the
 * first one that is not there. */
export async function walk(page: Page, labels: readonly string[]): Promise<void> {
  for (const label of labels) {
    const offered = await press(page, label);
    if (offered) throw new Error(noSuchButton(label, offered));
    await page.waitForTimeout(500);
  }
}
