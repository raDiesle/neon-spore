import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { Browser } from "playwright-core";
import { closeBrowser, launchBrowser } from "../capture.js";
import { elementOr, explain, GRACE_MS, listen, waitUntil } from "../page-said.js";
import { Unreachable } from "../shot-state.js";

/**
 * The page that throws on load, and the sentence reaching the report.
 *
 * `bun run versus:shot` said *no element matches .versus-stage — is the tab
 * right?* for a page that had thrown while loading, and with `--freeze` it
 * waited ten minutes for a frame that was never coming. Both are asked here
 * against a real page, because the thing under test is Playwright delivering
 * a page's own exception to a listener — nothing a fake page could prove.
 *
 * One browser for the file and no server: the page is set from a string.
 * `opening.test.ts` has why the browser is shared and the budget is generous.
 */
const STARVED_MS = 120_000;

const THROWING = `<!doctype html><title>t</title>
<script>throw new Error("Cannot read properties of null (reading 'saggingRoof')")</script>
<script>console.error("and the console saw this")</script>
<p>nothing of the pair was built</p>`;

const HEALTHY = `<!doctype html><title>t</title><div class="versus-stage" data-frozen></div>`;

describe("what the page said", () => {
  let browser: Browser;
  beforeAll(async () => {
    browser = await launchBrowser();
  }, STARVED_MS);
  afterAll(async () => {
    await closeBrowser(browser);
  }, STARVED_MS);

  it(
    "names the throw and the console error before 'is the tab right?'",
    async () => {
      const page = await browser.newPage();
      const said = listen(page);
      await page.setContent(THROWING);
      await said.thrown;
      expect(said.lines[0]).toBe("threw: Cannot read properties of null (reading 'saggingRoof')");
      expect(said.lines).toContain("console.error: and the console saw this");
      const failure = await elementOr(page, ".versus-stage", said).catch((e: unknown) => e);
      expect(failure).toBeInstanceOf(Unreachable);
      const message = (failure as Unreachable).message;
      expect(message.indexOf("saggingRoof")).toBeLessThan(message.indexOf("is the tab right?"));
      expect((failure as Unreachable).code).toBe(2);
      await page.close();
    },
    STARVED_MS,
  );

  it(
    "gives up the --until wait once the page has thrown and not arrived",
    async () => {
      const page = await browser.newPage();
      const said = listen(page);
      await page.setContent(THROWING);
      const started = Date.now();
      const failure = await waitUntil(page, "[data-frozen]", said).catch((e: unknown) => e);
      expect(failure).toBeInstanceOf(Unreachable);
      expect((failure as Unreachable).message).toContain("[data-frozen] never appeared");
      expect((failure as Unreachable).message).toContain("saggingRoof");
      // Well inside the ten minutes it used to hang for, and past the grace.
      expect(Date.now() - started).toBeGreaterThanOrEqual(GRACE_MS - 50);
      expect(Date.now() - started).toBeLessThan(GRACE_MS * 4);
      await page.close();
    },
    STARVED_MS,
  );

  it(
    "says nothing extra on a page that behaved",
    async () => {
      const page = await browser.newPage();
      const said = listen(page);
      await page.setContent(HEALTHY);
      await waitUntil(page, "[data-frozen]", said);
      const target = await elementOr(page, ".versus-stage", said);
      expect(await target.count()).toBe(1);
      expect(said.lines).toEqual([]);
      expect(explain(said, "is the tab right?")).toBe("is the tab right?");
      await page.close();
    },
    STARVED_MS,
  );
});
