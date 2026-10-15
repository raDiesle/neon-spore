import type { Page } from "playwright-core";
import { Unreachable } from "./shot-state.js";

/**
 * `--row "DEFLECTED"`: **one named row of a documentation page, scrolled to
 * and drawn, with the selector looked for inside it.**
 *
 * CONTROLS › HELPERS, ON THE FIELD and GESTURES hold a row per helper, card or
 * gesture, each under a heading that says its name — and a row's picture is
 * only drawn when the row comes near the screen (`when-seen.ts`). So
 * `.field-control:has(h3[data-label="DEFLECTED"]) canvas` matched nothing on
 * a page opened at its top: the row was there and its canvas was not, and the
 * lane that found it took its PNG off the browser pane instead (14 October
 * 2026). A cold load at `?sub=helpers` restores the tab; it is the scroll that
 * was missing.
 *
 * The row is a labelled heading's own parent — a `section` on HELPERS and
 * GESTURES, a type's box on ON THE FIELD — and it is marked for the one shot
 * rather than named by a class, so the flag reaches all three. A heading with
 * no `data-label` is named by the words it ends with, and its row is the
 * `section` it is in: an ON THE FIELD card's `h4` is its enemy, and the
 * line under it names the card's rows, so `THE BLISTER'S COMBO` is the card
 * that line ends with; an EVERY WAVE row's `h3` is its gesture's stamp run
 * into its name.
 */

/** The attribute the row is marked with while it is photographed. */
export const MARK = "data-shot-row";

/** How long a row just scrolled to is given to draw its picture. */
const DRAW_MS = 800;

/** The visible headings a row can be named by, in the page's order. */
const HEADINGS = "[data-label], h3, h4, .field-use > .rows";

/** A visible heading as the page reads it: its `data-label`, if any, and its text. */
export interface Heading {
  label?: string | undefined;
  text: string;
}

/** `selector`, looked for only inside the row `--row` marked. */
export function inRow(selector: string): string {
  return `[${MARK}] ${selector}`;
}

/** What a heading is called: its label, or its own words. */
export function headingName(h: Heading): string {
  return h.label ?? h.text.trim();
}

/** Which heading is the row named `name`: a label that is it, else words
 * that are it, else words that end with it; -1 for none. A heading that only
 * ends with the name used to win whenever it stood first on the page. */
export function rowNamed(headings: readonly Heading[], name: string): number {
  const labelled = headings.findIndex((h) => h.label === name);
  if (labelled >= 0) return labelled;
  const plain = (i: number): string | undefined =>
    headings[i]?.label === undefined ? headings[i]?.text.trim() : undefined;
  const exact = headings.findIndex((_, i) => plain(i) === name);
  if (exact >= 0) return exact;
  return headings.findIndex((_, i) => plain(i)?.endsWith(name));
}

/**
 * CONTROLS' rooms, by the words on their buttons, and the key each takes in
 * the director's URL (`tools/director/src/place.ts`'s `sub`).
 *
 * A lane after THE BLISTER'S COMBO asked for `?…&ctlpage=field` — the name
 * the tab bar is bound under, not the one the URL reads — and `--tab CONTROLS`
 * looked for a top door CONTROLS is not: it is a room of DOCUMENTATION. Both
 * opened somewhere else and `--row` said only that no row had the name
 * (15 October 2026). `--controls "ON THE FIELD"` is the route, said once here.
 */
export const CONTROLS_ROOMS: Readonly<Record<string, string>> = {
  PANELS: "panels",
  "ON THE FIELD": "field",
  "EVERY WAVE": "every",
  HELPERS: "helpers",
};

/** The path that opens DOCUMENTATION › CONTROLS › `room`, by its button's words or its key. */
export function controlsPath(room: string): string {
  const key = CONTROLS_ROOMS[room.toUpperCase()] ?? room.toLowerCase();
  if (!Object.values(CONTROLS_ROOMS).includes(key)) {
    const rooms = Object.keys(CONTROLS_ROOMS).join(" · ");
    throw new Error(`--controls ${JSON.stringify(room)} is no room of CONTROLS: ${rooms}`);
  }
  return `/?sheet=states&inner=controlsets&sub=${key}`;
}

/** The names in `labels` nearest `name`, by a shared word, at most six. */
export function nearest(name: string, labels: readonly string[]): string[] {
  const words = name
    .toUpperCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && w !== "THE");
  return labels.filter((l) => words.some((w) => l.toUpperCase().includes(w))).slice(0, 6);
}

/** What to say when no row is named `name`: the names nearest it, by a shared word. */
export function rowMiss(name: string, labels: readonly string[]): string {
  const near = nearest(name, labels);
  const sentence = `no row is named ${JSON.stringify(name)} — is the tab right? --controls "ON THE FIELD" opens one, --pose a STATES card`;
  return near.length === 0 ? sentence : `${sentence} Nearest: ${near.join(" · ")}`;
}

/** Scrolls the visible row named `name` to the top, marks it, and waits for its picture. */
export async function reachRow(page: Page, name: string): Promise<void> {
  const headings = await page.evaluate(
    (sel) =>
      [...document.querySelectorAll<HTMLElement>(sel)]
        .filter((h) => h.offsetParent !== null)
        .map((h) => ({ label: h.dataset.label, text: h.textContent ?? "" })),
    HEADINGS,
  );
  const at = rowNamed(headings, name);
  if (at < 0) throw new Unreachable(rowMiss(name, headings.map(headingName)), 2);
  await page.evaluate(
    ({ sel, at, mark }) => {
      const shown = [...document.querySelectorAll<HTMLElement>(sel)].filter(
        (h) => h.offsetParent !== null,
      );
      // A labelled heading's row is its parent; a card's title sits in a
      // wrapper of its own, so its row is the card it is in.
      const heading = shown[at];
      const row = heading?.dataset.label ? heading.parentElement : heading?.closest("section");
      row?.setAttribute(mark, "");
      row?.scrollIntoView({ block: "start" });
    },
    { sel: HEADINGS, at, mark: MARK },
  );
  await page.waitForTimeout(DRAW_MS);
}
