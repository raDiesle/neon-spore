#!/usr/bin/env bun

/**
 * `bun run room-shot <out-prefix> [--size 390x844] [--scale 2] [--names "ADA,BEN"]`
 * — two phones through the four-step room screen, against a real relay.
 *
 * **The one picture nothing could take.** `bun run menu-shot` drives one
 * device, and every interesting thing about the room screen needs two: a
 * creator leaves step 3 on the *other phone arriving*, both names on step 4
 * come from the room rather than from either device, and the seat each of them
 * holds is the server's answer. Three sessions in two days wrote the same
 * throwaway to see it — start a wrangler, start a preview, open two contexts,
 * walk both trails — which is the count `menu-shot.ts` was made at.
 *
 * It starts the relay and the preview and stops both, for `menu-shot`'s
 * reason: a session with no way to leave a server standing cannot use a tool
 * that assumes one is up. The two phones arrive as devices that have been here
 * before — past the intro, each with a name — because the first meeting is a
 * different screen and `menu-shot --first-visit` is what photographs it.
 *
 * What it prints is the walk: the code the creator was given, the heading each
 * phone is under at each stop, and whether the creator's page turned when the
 * joiner arrived. What it writes is a PNG per phone at the end.
 */

import { closeBrowser, launchBrowser } from "./browser.js";
import { root } from "./exec.js";
import { menuDevice } from "./menu-device.js";
import { press } from "./menu-press.js";
import { arrivalStamps } from "./menu-stamps.js";
import { noSuchButton } from "./menu-trail.js";
import { startRelay } from "./relay-up.js";
import { startPreview } from "./serve.js";

/**
 * The two walks, as the labels on the buttons each phone presses.
 *
 * The creator stops on the code — there is nothing further to press, and the
 * page turns when the other phone arrives. The joiner's last press is the one
 * that commits the code, and the room is what answers it (`join-steps.ts`).
 */
export const CREATOR_TRAIL = ["PLAY", "NEW GAME", "CREATE"] as const;
export const JOINER_TRAIL = ["PLAY", "NEW GAME", "JOIN"] as const;
/** The button under the code field. Named here so a rename fails loudly. */
export const JOINER_COMMIT = "ENTER THE ROOM";

/** What a phone is looking at: the step's heading, and the code if it has one. */
export interface Looking {
  head: string;
  code: string;
  state: string;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (name: string): string | undefined => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const out = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  if (!out) {
    console.error('usage: bun run room-shot <out-prefix> [--size 390x844] [--names "ADA,BEN"]');
    process.exit(1);
  }
  const [creatorName, joinerName] = (flag("names") ?? "ADA,BEN").split(",");
  const [vw, vh] = (flag("size") ?? "390x844").split("x").map(Number);
  const device = menuDevice(args);

  const relay = await startRelay(root);
  const preview = await startPreview(root);
  const browser = await launchBrowser();
  try {
    const phone = async (who: string) => {
      const ctx = await browser.newContext({
        viewport: { width: vw ?? 390, height: vh ?? 844 },
        deviceScaleFactor: Number(flag("scale") ?? 2),
        ...device,
      });
      const page = await ctx.newPage();
      await page.addInitScript(
        ([pairs, name]: [[string, string][], string]) => {
          try {
            for (const [key, value] of pairs) localStorage.setItem(key, value);
            localStorage.setItem("neon-spore.name", name);
          } catch {}
        },
        [arrivalStamps({ firstVisit: false, partners: [] }), who] as [[string, string][], string],
      );
      await page.goto(`${preview.url}?relay=${encodeURIComponent(relay.url)}`, {
        waitUntil: "load",
      });
      await page.waitForSelector("#menu.on", { timeout: 30_000 });
      return page;
    };

    const looking = (p: Awaited<ReturnType<typeof phone>>): Promise<Looking> =>
      p.evaluate(() => ({
        head: document.querySelector("#joinScreen h2")?.textContent ?? "",
        code: (document.getElementById("joinCode")?.textContent ?? "").trim(),
        state: document.getElementById("joinState")?.textContent ?? "",
      }));

    const walk = async (p: Awaited<ReturnType<typeof phone>>, labels: readonly string[]) => {
      for (const label of labels) {
        const offered = await press(p, label);
        if (offered) throw new Error(noSuchButton(label, offered));
        await p.waitForTimeout(500);
      }
    };

    const creator = await phone(creatorName ?? "ADA");
    const joiner = await phone(joinerName ?? "BEN");

    await walk(creator, CREATOR_TRAIL);
    await creator.waitForTimeout(1200);
    const held = await looking(creator);
    console.log(`creator: "${held.head}" — code ${held.code || "(none)"}`);
    if (!/^[A-Z0-9]{4}$/.test(held.code)) {
      throw new Error(`the creator never got a code: "${held.code}"`);
    }

    await walk(joiner, JOINER_TRAIL);
    console.log(`joiner:  "${(await looking(joiner)).head}"`);
    await joiner.fill("#joinInput", held.code);
    await walk(joiner, [JOINER_COMMIT]);
    await joiner.waitForTimeout(2500);

    const onCreator = await looking(creator);
    const onJoiner = await looking(joiner);
    console.log(`creator: "${onCreator.head}" — ${onCreator.state}`);
    console.log(`joiner:  "${onJoiner.head}" — ${onJoiner.state}`);
    await creator.screenshot({ path: `${out}-creator.png` });
    await joiner.screenshot({ path: `${out}-joiner.png` });
    console.log(`${out}-creator.png  ${out}-joiner.png`);

    // The question no single-device shot can ask: a creator leaves step 3 on
    // the *other phone arriving*, and nothing on their own device knows the
    // code has been read out (`join-steps.ts`).
    if (onCreator.head === held.head) {
      throw new Error(`the creator's page did not turn: still "${held.head}"`);
    }
    console.log("the creator's page turned when the joiner arrived");
  } finally {
    await closeBrowser(browser);
    await preview.stop();
    await relay.stop();
  }
}
