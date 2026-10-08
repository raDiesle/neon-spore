import type { Page } from "playwright-core";

/**
 * Bun's own error screen, read for the sentence on it
 *
 * A VERSUS candidate importing `@neon-spore/content` by name — a candidate
 * reaches a package by its relative path — failed to bundle, and `bun run
 * versus:shot scuttle:seat lobed` sat on `--until "[data-frozen]"` until the
 * caller's five-minute timeout with nothing printed (`docs/queue.md`, 8
 * October 2026). `page-said.ts` already cut a wait short when the page threw,
 * and neither way a candidate breaks under the director's dev server is a
 * throw Playwright hears:
 *
 * - **It does not build.** Bun answers the HTML itself with a 500 titled
 *   *Bun - Build Failed*, its overlay script runs cleanly, and the only console
 *   line is a *Failed to load resource*.
 * - **It throws while its module runs.** Bun's module loader catches it, logs
 *   it as a `console.error`, and paints a *Runtime Error* overlay over a page
 *   answered 200 — no `pageerror` ever fires.
 *
 * Both paint the same element, `<bun-hmr>`, which a healthy page does not
 * have, and its shadow root holds the file and the error in words. So the
 * element is the signal and its text is the report — read off the screen
 * rather than decoded out of Bun's private payload.
 */

/** The element Bun's dev server paints its error screen into. */
export const OVERLAY = "bun-hmr";

/** How long the overlay is given to paint its words once it is there. */
const PAINT_MS = 3_000;

/**
 * The overlay's text, one line each, without blanks, repeats or the squiggles
 * under the code — or nothing, on a page without one.
 */
export async function overlayLines(page: Page): Promise<string[]> {
  const read = () =>
    page
      .evaluate((tag) => {
        const shadow = document.querySelector(tag)?.shadowRoot;
        if (!shadow) return "";
        const texts: string[] = [];
        for (const child of shadow.children) {
          if (child instanceof HTMLElement) texts.push(child.innerText);
        }
        return texts.join("\n");
      }, OVERLAY)
      .catch(() => "");
  const present = await page
    .locator(OVERLAY)
    .count()
    .catch(() => 0);
  if (present === 0) return [];
  const deadline = Date.now() + PAINT_MS;
  let text = await read();
  while (text.trim() === "" && Date.now() < deadline) {
    await page.waitForTimeout(100);
    text = await read();
  }
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "" || /^[_\s]+$/.test(line) || seen.has(line)) continue;
    seen.add(line);
    lines.push(line);
  }
  return lines.slice(0, 20);
}
