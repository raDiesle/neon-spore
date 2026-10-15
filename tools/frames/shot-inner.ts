import { Unreachable } from "./shot-state.js";

/**
 * `--inner WAVES`: **which visible button is the inner tab**, the one a tab
 * bar of the sheet `--open` opened holds.
 *
 * It was the first visible button on the page with that label, and on
 * DOCUMENTATION that was the director's own menu item WAVES, earlier in the
 * page than the sheet's tab bar: the shot was of WORDINGS, the room the sheet
 * opens on, with no complaint (15 October 2026). A tab bar is an element whose
 * id ends `Tabs` — `#statesTabs`, `#controlsInnerTabs`, `#backlogTabs`,
 * `#soundTabs` — so a bar on screen is asked first, and a label none of them
 * has is refused with the labels they do have. A page with no bar showing
 * keeps the old reading, any visible button by its words.
 */

/** The tab bars an inner tab is pressed in. */
export const BARS = '[id$="Tabs"]';

/** A visible button as the page reads it: its words, and the bar it is in, if any. */
export interface ShownButton {
  label: string;
  bar: string | null;
}

const same = (a: string, b: string): boolean => a.trim().toUpperCase() === b.trim().toUpperCase();

/** Which of `shown` to press for `--inner label`; throws `Unreachable` when none is it. */
export function innerAt(shown: readonly ShownButton[], label: string): number {
  const inBar = shown.flatMap((b, i) => (b.bar === null ? [] : [i]));
  const tab = inBar.find((i) => same(shown[i]?.label ?? "", label));
  if (tab !== undefined) return tab;
  if (inBar.length > 0) {
    const bars = [...new Set(inBar.map((i) => `#${shown[i]?.bar}`))].join(", ");
    const has = inBar.map((i) => shown[i]?.label).join(" · ");
    throw new Unreachable(`--inner ${label}: no tab of ${bars} reads it — it has ${has}`, 2);
  }
  const any = shown.findIndex((b) => same(b.label, label));
  if (any >= 0) return any;
  throw new Unreachable(`no visible button reads ${label} — is --open the right sheet?`, 2);
}
