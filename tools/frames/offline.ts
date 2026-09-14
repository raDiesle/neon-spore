import type { Page } from "playwright-core";

/**
 * **A capture reaches the preview and nothing else.**
 *
 * Since the sign-in landed, loading the built game in a headless Chrome asks
 * three third parties for something: `fonts.googleapis.com` for the menu's
 * face, and `accounts.google.com` and `www.google.com` for Firebase Auth —
 * 37 refused connections in one run of `test/opening.test.ts` alone, behind
 * the egress proxy a cloud session runs under.
 *
 * Nothing there is a *failure*: the file passes either way, the font has a
 * real stack behind it (`menu.css`) and nobody signs in headlessly. What is
 * wrong is subtler and worth more than the time it costs. A frame of this
 * checkout is supposed to be comparable to another frame of this checkout,
 * and a page that fetches a stylesheet from a third party is a page whose
 * picture depends on a network — it renders one way on a desk, another way
 * behind a proxy, and a third way when that host is slow. `run.ts`'s
 * `identical:` guard exists to say *nothing changed*, and it cannot mean that
 * about a picture with a variable in it.
 *
 * So every request that is not the preview's own is refused at the browser,
 * and what asked is kept — a list, not a count, so a test can name the host
 * rather than say a number went up. Refusing rather than stubbing is the
 * honest shape: a stub is a second answer to maintain, and the page already
 * has the answer it gives a phone with no network.
 *
 * `data:` and `blob:` are the page's own bytes under a different scheme —
 * a baked sprite, a canvas handed back to itself — and never leave it.
 */
export interface OffOrigin {
  /** Every off-origin URL the page asked for, in the order it asked. */
  readonly asked: string[];
}

export async function refuseOffOrigin(page: Page, baseUrl: string): Promise<OffOrigin> {
  const origin = new URL(baseUrl).origin;
  const asked: string[] = [];
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith(origin) || url.startsWith("data:") || url.startsWith("blob:")) {
      await route.continue();
      return;
    }
    asked.push(url);
    await route.abort();
  });
  return { asked };
}
