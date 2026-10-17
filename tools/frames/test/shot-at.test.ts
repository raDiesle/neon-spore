import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { rm, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Browser } from "playwright-core";
import { closeBrowser, launchBrowser } from "../capture.js";
import { scratchDir } from "../scratch.js";
import { shootAt } from "../shot-at.js";
import { Unreachable } from "../shot-state.js";

/**
 * `bun run shot --at` against a page in a real headless Chrome
 * (`shot-at.ts`): a frozen picture returns with its PNG written, and a page
 * whose renderer stops answering is refused, naming the step, inside the
 * step's time instead of being waited on for good. The second case is the
 * one that held a `versus:shot --at` silent for ten minutes on 16 October 2026.
 */
const STARVED_MS = 120_000;
const VIEWPORT = { width: 400, height: 300 };
/** A frozen VERSUS window, in miniature: a box marked as the pair marks one. */
const FROZEN = `<!doctype html><body style="margin:0">
<div style="height:500px"></div>
<div class="versus-crop" data-frozen style="width:200px;height:200px;background:#0ff"></div>
</body>`;

describe("a shot --at", () => {
  let browser: Browser | undefined;
  let dir: string | undefined;

  beforeAll(async () => {
    dir = await scratchDir("shot-at-");
    browser = await launchBrowser();
  }, STARVED_MS);

  afterAll(async () => {
    await closeBrowser(browser);
    if (dir) await rm(dir, { recursive: true, force: true });
  }, STARVED_MS);

  it(
    "returns from a frozen frame below the fold, with its picture written",
    async () => {
      const page = await (browser as Browser).newPage({ viewport: VIEWPORT });
      await page.setContent(FROZEN);
      const out = join(dir as string, "frozen.png");
      const said = await shootAt({
        page,
        target: page.locator(".versus-crop"),
        selector: ".versus-crop",
        at: { x: 0, y: 0, width: 100, height: 50 },
        viewport: VIEWPORT,
        out,
      });
      expect(said).toBe("clip 0,0,100,50 of .versus-crop at 200x200");
      expect((await stat(out)).size).toBeGreaterThan(0);
      // The window grown to reach the crop is put back.
      expect(page.viewportSize()).toEqual(VIEWPORT);
      await page.close();
    },
    STARVED_MS,
  );

  it(
    "refuses a page that stopped answering, naming the step, inside the step's time",
    async () => {
      const page = await (browser as Browser).newPage({ viewport: VIEWPORT });
      await page.setContent(FROZEN);
      // The renderer's thread is taken for good, so an `evaluate` never comes back.
      await page.evaluate(() => {
        setTimeout(() => {
          for (;;) {}
        }, 0);
      });
      const started = Date.now();
      const failure = await shootAt({
        page,
        target: page.locator(".versus-crop"),
        selector: ".versus-crop",
        at: { x: 0, y: 0, width: 100, height: 50 },
        viewport: VIEWPORT,
        out: join(dir as string, "stalled.png"),
        stepMs: 1500,
      }).catch((e: unknown) => e);
      expect(failure).toBeInstanceOf(Unreachable);
      expect((failure as Unreachable).message).toBe(
        "--at: scrolling to the top took longer than 1500 ms",
      );
      expect((failure as Unreachable).code).toBe(2);
      expect(Date.now() - started).toBeLessThan(10_000);
    },
    STARVED_MS,
  );
});
