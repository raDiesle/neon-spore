import type { Page } from "playwright-core";

/**
 * Getting the page into the state that is worth photographing
 *
 * (Named for the state, not the reaching: `packages/sim/src/shot-reach.ts` is
 * about what a cannon shot meets on its way up a column, and two files under
 * one name is a grep that answers the wrong question.)
 *
 * `shot.ts` grew one flag per state somebody could not reach — a sheet behind
 * its header button, a tab inside that sheet, a panel that only exists once a
 * cell is selected, a filter that only exists once somebody has typed, a legend
 * that only shows while a key is held — and each of them was a throwaway
 * Playwright script before it was a flag. That list is the whole of *reaching*
 * a state, and it is a different job from taking the picture: the locator, the
 * crop and the write. The file was at 249 lines against a 250 limit, so the
 * next flag had nowhere to go, and the seam was already this one.
 *
 * Everything here presses, fills or holds and then waits. Nothing here knows
 * what is about to be photographed.
 */

/** How long a sheet takes to build itself after its button is pressed. */
const BUILD_MS = 600;

/** A tab's former name, still accepted: the owner renamed SHAPES to GRAPHICS
 * on 11 September 2026 and asked for the old name to keep working. */
const FORMER_TAB: Readonly<Record<string, string>> = { SHAPES: "GRAPHICS" };

export interface Reach {
  /** A full-screen sheet, by the label on its header button. */
  open?: string | undefined;
  /** NOT BUILT YET's own tab strip, which lives inside that sheet. */
  tab?: string | undefined;
  /** A tab strip inside any other sheet, by the label on its button. */
  inner?: string | undefined;
  /** A CSS selector to press — a map cell carries a picture rather than a word. */
  click?: string | undefined;
  /** Which of `click`'s matches to press, counting from 1. */
  nth?: number | undefined;
  /** `<selector>=<text>` filled into a field, because the page listens for `input`. */
  type?: string | undefined;
  /** `<selector>=<value>` chosen in a `<select>`. */
  select?: string | undefined;
  /** A key held down while the picture is taken. */
  hold?: string | undefined;
}

/** What went wrong, said the way `shot.ts` says everything else. */
export class Unreachable extends Error {
  constructor(
    message: string,
    readonly code: number,
  ) {
    super(message);
  }
}

function split(flag: string, value: string): [string, string] {
  const at = value.indexOf("=");
  if (at < 1) {
    throw new Unreachable(`--${flag} wants <selector>=<value>, got ${JSON.stringify(value)}`, 1);
  }
  return [value.slice(0, at), value.slice(at + 1)];
}

/** Reach the state, in the order the page builds itself. Throws `Unreachable`. */
export async function reachState(page: Page, reach: Reach): Promise<void> {
  // Every full-screen sheet starts `display: none` and is only built when its
  // header button is pressed, so a selector inside one photographs nothing
  // until it has been.
  if (reach.open) {
    await page.getByRole("button", { name: reach.open }).click();
    await page.waitForTimeout(BUILD_MS);
  }
  if (reach.tab) {
    // Both waits are real: the sheet builds sixty animated figures and the tab
    // it lands on rebuilds them again.
    await page.getByRole("button", { name: "NOT BUILT YET" }).click();
    await page.waitForTimeout(BUILD_MS);
    const label = FORMER_TAB[reach.tab] ?? reach.tab;
    await page.getByRole("button", { name: label, exact: true }).click();
  }
  if (reach.inner) {
    // Pressed in the page rather than through Playwright's locator engine. An
    // inner tab lives in a sheet that was `display: none` a moment ago, and
    // both `click()` and `dispatchEvent()` on a role locator spent thirty
    // seconds waiting for that to settle and then timed out — twice, on a strip
    // of plain buttons wired to `click`. The visible one with that label is
    // unambiguous, and pressing it is one line.
    const pressed = await page.evaluate((label: string) => {
      for (const b of document.querySelectorAll("button")) {
        if (b.textContent?.trim() === label && b.offsetParent !== null) {
          b.click();
          return true;
        }
      }
      return false;
    }, reach.inner);
    if (!pressed) {
      throw new Unreachable(
        `no visible button reads ${reach.inner} — is --open the right sheet?`,
        2,
      );
    }
    await page.waitForTimeout(BUILD_MS);
  }
  if (reach.click) {
    const nth = reach.nth ?? 1;
    const pressed = await page.evaluate(
      ({ sel, at }: { sel: string; at: number }) => {
        const el = document.querySelectorAll<HTMLElement>(sel)[at - 1];
        if (!el) return false;
        el.scrollIntoView({ block: "center", inline: "center" });
        el.click();
        return true;
      },
      { sel: reach.click, at: nth },
    );
    if (!pressed) {
      throw new Unreachable(`no element ${nth} matches ${reach.click} — nothing was pressed`, 2);
    }
    await page.waitForTimeout(BUILD_MS);
  }
  if (reach.type) {
    const [selector, text] = split("type", reach.type);
    await page.locator(selector).fill(text);
    await page.waitForTimeout(300);
  }
  if (reach.select) {
    // `fill` throws on a `<select>`, so a picker was out of reach entirely —
    // and VERSUS's rate picker is one. At 0.25× a thrust that burns for one
    // beat of a two-second replay stretches past the whole window, so every
    // frame carries it; without this, finding one frame that did cost about
    // thirty-five shots ranked by PNG file size.
    const [selector, value] = split("select", reach.select);
    await page.locator(selector).selectOption(value);
    await page.waitForTimeout(300);
  }
  if (reach.hold) await page.keyboard.down(reach.hold);
}
