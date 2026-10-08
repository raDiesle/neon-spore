import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Browser } from "playwright-core";
import { overlayLines } from "../bun-overlay.js";
import { closeBrowser, launchBrowser } from "../capture.js";
import { elementOr, GRACE_MS, listen, refuseFailed, waitUntil } from "../page-said.js";
import { scratchDir } from "../scratch.js";
import { Unreachable } from "../shot-state.js";

/**
 * A candidate that throws at import, and one that does not build, under Bun's
 * own dev server — the two ways `bun run versus:shot` used to wait out its
 * caller's timeout in silence (`bun-overlay.ts`).
 *
 * The server is a real `Bun.serve` in development mode with an HTML route, the
 * same machinery the director stands on, because the thing under test is what
 * *Bun* does with a broken module: a 500 for one, a swallowed throw and a
 * `<bun-hmr>` screen for the other. A page faked with `setContent` would only
 * prove what this file believed Bun did, which is the belief that was wrong.
 */
const STARVED_MS = 120_000;

const PAGE = `<!doctype html><html><body><script type="module" src="./app.ts"></script></body></html>`;
const APPS: Record<string, string> = {
  throws: `throw new Error("the candidate threw at import");\nexport {};\n`,
  unbuilt: `import x from "@neon-spore/no-such-package";\nconsole.log(x);\n`,
  healthy: `document.body.innerHTML = '<div class="versus-stage" data-frozen></div>';\nexport {};\n`,
};

describe("Bun's error screen", () => {
  let browser: Browser;
  let dir: string;
  let server: ReturnType<typeof Bun.serve>;
  const url = (name: string) => `http://127.0.0.1:${server.port}/${name}`;

  beforeAll(async () => {
    dir = await scratchDir("bun-overlay-");
    const routes: Record<string, unknown> = {};
    for (const [name, app] of Object.entries(APPS)) {
      await mkdir(join(dir, name));
      await writeFile(join(dir, name, "page.html"), PAGE);
      await writeFile(join(dir, name, "app.ts"), app);
      routes[`/${name}`] = (await import(join(dir, name, "page.html"))).default;
    }
    server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      development: true,
      // biome-ignore lint/suspicious/noExplicitAny: an HTML import is typed by a bundler declaration this package does not load
      routes: routes as any,
      fetch: () => new Response("not here", { status: 404 }),
    });
    browser = await launchBrowser();
  }, STARVED_MS);

  afterAll(async () => {
    await closeBrowser(browser);
    await server.stop(true);
    await rm(dir, { recursive: true, force: true });
  }, STARVED_MS);

  it(
    "refuses a page that did not build at once, with the import it could not resolve",
    async () => {
      const page = await browser.newPage();
      const said = listen(page);
      const response = await page.goto(url("unbuilt"), { waitUntil: "networkidle" });
      const failure = await refuseFailed(page, response, said).catch((e: unknown) => e);
      expect(failure).toBeInstanceOf(Unreachable);
      const message = (failure as Unreachable).message;
      expect(message).toContain("the page answered 500");
      expect(message).toContain('Could not resolve: "@neon-spore/no-such-package"');
      expect((failure as Unreachable).code).toBe(2);
      await page.close();
    },
    STARVED_MS,
  );

  it(
    "gives up the --until wait on a throw at import, which Playwright never hears",
    async () => {
      const page = await browser.newPage();
      const said = listen(page);
      const response = await page.goto(url("throws"), { waitUntil: "networkidle" });
      // Answered 200 — the throw happens after, inside Bun's module loader.
      await refuseFailed(page, response, said);
      const started = Date.now();
      const failure = await waitUntil(page, "[data-frozen]", said).catch((e: unknown) => e);
      expect(failure).toBeInstanceOf(Unreachable);
      const message = (failure as Unreachable).message;
      expect(message).toContain("[data-frozen] never appeared");
      expect(message).toContain("the error screen said:");
      expect(message).toContain("the candidate threw at import");
      expect(Date.now() - started).toBeLessThan(GRACE_MS * 4);
      await page.close();
    },
    STARVED_MS,
  );

  it(
    "finds no screen and changes nothing on a page that built and ran",
    async () => {
      const page = await browser.newPage();
      const said = listen(page);
      const response = await page.goto(url("healthy"), { waitUntil: "networkidle" });
      await refuseFailed(page, response, said);
      await waitUntil(page, "[data-frozen]", said);
      expect(await (await elementOr(page, ".versus-stage", said)).count()).toBe(1);
      expect(await overlayLines(page)).toEqual([]);
      await page.close();
    },
    STARVED_MS,
  );
});
