import type { Locator, Page } from "playwright-core";
import { Unreachable } from "./shot-state.js";

/**
 * What the page said while `shot.ts` was waiting for it
 *
 * When the VERSUS page threw while loading, `shot.ts` reported only *no
 * element matches .versus-stage — is the tab right?* and exited 2, and with
 * `--freeze` it waited for a `[data-frozen]` that was never coming until
 * something killed it. On 11 September 2026 a module cycle made every
 * candidate page throw `Cannot read properties of null (reading
 * 'saggingRoof')`, and the only way to read that sentence was to start the
 * director by hand and open the in-app browser's console — twenty minutes
 * for a one-line error that the Playwright page already held.
 *
 * So the page is listened to from the moment it is opened, the way `page.ts`
 * already listens for the game's frames: every uncaught exception and every
 * `console.error`, in order. When the element is missing
 * or the wait runs out, what it said is printed *before* the *is the tab
 * right?* line, because that line was an honest guess and this is the answer.
 *
 * An uncaught exception also cuts the `--until` wait short. A page that has
 * thrown may still reach its state — a listener somewhere else on it failing
 * changes nothing about a pair running to a freeze — so it is given
 * `GRACE_MS` more, and only a page that has thrown *and* not arrived is given
 * up on. Without a throw the wait is the full `PATIENCE_MS`: a machine running
 * a full check paints a headless frame at about eight a second, and a wrong
 * picture is worse than a slow one.
 */

/** Ten minutes, for a page that is merely slow. */
export const PATIENCE_MS = 600_000;
/** Five seconds, for a page that has thrown and might still arrive. */
export const GRACE_MS = 5_000;

export interface Said {
  /** Every line so far, oldest first: `threw: …` and `console.error: …`. */
  readonly lines: readonly string[];
  /** Resolves the first time the page throws; never, on a healthy page. */
  readonly thrown: Promise<void>;
}

/** Start listening. Call it before `page.goto`, or the load's own throw is missed. */
export function listen(page: Page): Said {
  const lines: string[] = [];
  let first: () => void = () => {};
  const thrown = new Promise<void>((resolve) => {
    first = resolve;
  });
  page.on("pageerror", (error) => {
    lines.push(`threw: ${error.message}`);
    first();
  });
  page.on("console", (message) => {
    if (message.type() === "error") lines.push(`console.error: ${message.text()}`);
  });
  return { lines, thrown };
}

/** The sentence `shot.ts` would have said, with what the page said above it. */
export function explain(said: Said, sentence: string): string {
  if (said.lines.length === 0) return sentence;
  return `the page said:\n${said.lines.map((l) => `  ${l}`).join("\n")}\n${sentence}`;
}

/**
 * `--until`: wait for the page to say it is ready, for as long as it takes —
 * unless it throws first and then does not arrive within the grace.
 */
export async function waitUntil(page: Page, selector: string, said: Said): Promise<void> {
  const locator = page.locator(selector).first();
  const arrived = locator.waitFor({ state: "attached", timeout: PATIENCE_MS }).then(() => true);
  const threw = said.thrown.then(() => false);
  if (await Promise.race([arrived, threw])) return;
  try {
    await locator.waitFor({ state: "attached", timeout: GRACE_MS });
  } catch {
    throw new Unreachable(
      explain(said, `${selector} never appeared after the page threw — the picture is not coming`),
      2,
    );
  }
}

/** The element to photograph, or the reason there is none. */
export async function elementOr(page: Page, selector: string, said: Said): Promise<Locator> {
  const target = page.locator(selector);
  if ((await target.count()) === 0) {
    throw new Unreachable(explain(said, `no element matches ${selector} — is the tab right?`), 2);
  }
  return target;
}
