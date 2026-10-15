import type { Page } from "playwright-core";
import { Unreachable } from "./shot-state.js";

/**
 * `--row "DEFLECTED"`: **one named row of a documentation page, scrolled to
 * and drawn, with the selector looked for inside it.**
 *
 * CONTROLS › HELPERS, ON THE FIELD and GESTURES hold a row per helper, card or
 * gesture, each under a heading whose `data-label` is its name — and a row's
 * picture is only drawn when the row comes near the screen (`when-seen.ts`).
 * So `.field-control:has(h3[data-label="DEFLECTED"]) canvas` matched nothing
 * on a page opened at its top: the row was there and its canvas was not, and
 * the lane that found it took its PNG off the browser pane instead (14
 * October 2026). A cold load at `?sub=helpers` restores the tab; it is the
 * scroll that was missing.
 *
 * The row is the heading's own parent — a `section` on HELPERS and GESTURES, a
 * `.field-type` box on ON THE FIELD — and it is marked for the one shot rather
 * than named by a class, so the flag reaches all three.
 */

/** The attribute the row is marked with while it is photographed. */
const MARK = "data-shot-row";

/** How long a row just scrolled to is given to draw its picture. */
const DRAW_MS = 800;

/** `selector`, looked for only inside the row `--row` marked. */
export function inRow(selector: string): string {
  return `[${MARK}] ${selector}`;
}

/** What to say when no row is named `name`: the labels nearest it, by a shared word. */
export function rowMiss(name: string, labels: readonly string[]): string {
  const words = name
    .toUpperCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && w !== "THE");
  const near = labels.filter((l) => words.some((w) => l.toUpperCase().includes(w))).slice(0, 6);
  const sentence = `no row is named ${JSON.stringify(name)} — is the tab right?`;
  return near.length === 0 ? sentence : `${sentence} Nearest: ${near.join(" · ")}`;
}

/** Scrolls the visible row named `name` to the top, marks it, and waits for its picture. */
export async function reachRow(page: Page, name: string): Promise<void> {
  const found = await page.evaluate(
    ({ name, mark }) => {
      const shown = [...document.querySelectorAll<HTMLElement>("[data-label]")].filter(
        (h) => h.offsetParent !== null,
      );
      const heading = shown.find((h) => h.dataset.label === name);
      const row = heading?.parentElement;
      if (!row) return shown.map((h) => h.dataset.label ?? "");
      row.setAttribute(mark, "");
      row.scrollIntoView({ block: "start" });
      return null;
    },
    { name, mark: MARK },
  );
  if (found !== null) throw new Unreachable(rowMiss(name, found), 2);
  await page.waitForTimeout(DRAW_MS);
}
