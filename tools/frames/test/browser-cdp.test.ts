import { afterAll, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { PROFILE_PREFIX, tmpRoot } from "../../tmp-litter.js";
import { launchBrowser } from "../browser.js";
import { launchOverCdp } from "../browser-cdp.js";
import { findChrome } from "../chrome.js";
import { root } from "../exec.js";

/**
 * The second way into a browser, exercised on a machine that does not need it.
 *
 * `launchBrowser` only reaches `launchOverCdp` where `chromium.launch()` has
 * already failed, which is a property of the *machine* — the cloud sandbox,
 * or a worktree whose profile path runs past `AF_UNIX`'s 108 bytes. So the
 * fallback would otherwise ship untested everywhere it works and be run for
 * the first time on the one machine nobody is watching. It is asked here
 * directly instead: it is an ordinary function, and a real Chrome started
 * with `--remote-debugging-port` is a real Chrome anywhere.
 *
 * The budget is `page-said.test.ts`'s, and for its reason: a cold browser on
 * a loaded machine is slow, and a test that times out reads as a broken
 * fallback rather than as a busy box.
 */
const STARVED_MS = 120_000;

const made: string[] = [];

afterAll(async () => {
  for (const dir of made) await rm(dir, { recursive: true, force: true }).catch(() => {});
});

async function profile(): Promise<string> {
  const dir = await mkdtemp(join(tmpRoot(root), PROFILE_PREFIX));
  made.push(dir);
  return dir;
}

describe("launchOverCdp", () => {
  it(
    "opens a browser that draws a page, and ends its process when stopped",
    async () => {
      const over = await launchOverCdp(findChrome(), await profile());
      const page = await over.browser.newPage();
      await page.setContent("<title>t</title><p id=said>a real page</p>");
      expect(await page.textContent("#said")).toBe("a real page");
      // A screenshot rather than only text: taking pictures is the whole of
      // what the tools behind this call it for.
      expect((await page.screenshot({ type: "png" })).length).toBeGreaterThan(0);

      await over.stop();
      // `stop` kills the process it spawned; `close()` on a connection would
      // leave it up, which is how the litter this repository sweeps is made.
      expect(over.browser.isConnected()).toBe(false);
    },
    STARVED_MS,
  );

  it(
    "says on one line what a browser that is not one said, rather than hanging",
    async () => {
      const notABrowser = process.execPath;
      await expect(launchOverCdp(notABrowser, await profile())).rejects.toThrow(/chrome exited/);
    },
    STARVED_MS,
  );
});

/**
 * That the retry is reached at all. It cannot be *succeeded* at here — the
 * ordinary launch works on this machine, which is the whole reason the
 * fallback needed a test of its own — so what is asked is the other half: a
 * browser that cannot open either way names both attempts, in one sentence,
 * instead of the one about a target that has been closed.
 */
describe("launchBrowser when the ordinary launch cannot work", () => {
  it(
    "retries over a debugging port and reports both reasons when that fails too",
    async () => {
      await expect(launchBrowser(process.execPath)).rejects.toThrow(
        /could not open a browser: .* — and not over a debugging port: /,
      );
    },
    STARVED_MS,
  );
});
