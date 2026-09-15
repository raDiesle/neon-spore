import type { Page } from "playwright-core";

/**
 * WHICH BUTTON A WORD IN A TRAIL MEANS, on whichever screen is up.
 *
 * Split out of `menu-shot.ts` the day a trail stopped ending at the menu: NEW
 * GAME closes the menu and opens the room screen (`apps/game/src/join.ts`), so
 * "the open page" is no longer one element with one class on it, and the rule
 * for finding it grew a second half. That file was at its ceiling; this is the
 * half that is about screens rather than about cameras.
 */

/**
 * Press the button on the open page whose words are `label`, and say nothing.
 * Where there is none, the labels that *are* on it come back instead, for the
 * message `noSuchButton` makes of them.
 *
 * **A button's name is its `.label` span where it has one**, and its own text
 * otherwise. A row is a marker, a label and a description in three spans with
 * no whitespace between them, so its `textContent` reads
 * `▸SETTINGSSound, motion, buzz…` — which matches nothing a person would type
 * and is nonsense in the message. A switch is one string with its state on the
 * end, which is what the trailing-space test leaves room for: SOUND still
 * reaches `SOUND ON`.
 *
 * **Only what is on the page counts.** A row that does not apply is taken off
 * with `setEntry` rather than removed, and the two-step's own LEAVE and CANCEL
 * sit behind whichever row asked (`menu-rows.ts`, `menu-steps.ts`) — both are
 * still in the document. Pressing one of those would photograph a page nobody
 * standing here could have reached.
 */
export async function press(page: Page, label: string): Promise<string[] | null> {
  return await page.evaluate((wanted: string) => {
    // The menu while it is up, and whatever it handed over to once it is not.
    // A trail that reaches the room screen (`join.ts`) has left the menu behind
    // — NEW GAME closes it — and every press after that is on the screen that
    // press opened. Scoped to one open page rather than to the document, so a
    // button on a screen underneath this one can never be the one that is hit.
    // `.on` is still on the menu's own page after the menu is closed — the
    // class marks which page is the current one, not whether the menu is up —
    // so this asks whether it has a box rather than whether it has the class.
    const menuPage = document.querySelector("#menu .page.on");
    const open = menuPage?.getClientRects().length ? menuPage : openScreen();
    if (!open) return [];
    const shown = [...open.querySelectorAll("button")].filter((b) => b.getClientRects().length > 0);
    const name = (b: Element): string => {
      const own = b.querySelector(".label") ?? b;
      return (own.textContent ?? "").replace(/\s+/g, " ").trim();
    };
    const hit = shown.find((b) => {
      const text = name(b);
      return text === wanted || text.startsWith(`${wanted} `);
    });
    if (!hit) return shown.map(name).filter((t) => t !== "");
    (hit as HTMLButtonElement).click();
    return null;

    /**
     * The topmost overlay somebody could be pressing, or null for none. Each is
     * in the document from the first paint and put up by a `display` its own
     * binding sets, so "is it up" is whether it has a box — not a class this
     * file would have to keep a list of and keep in step with.
     */
    function openScreen(): Element | null {
      const overlays = [...document.querySelectorAll("#joinScreen, #linkHold, #hello")];
      // Last in document order wins, which is the one drawn over the others.
      const up = overlays.filter((el: Element) => el.getClientRects().length > 0);
      return up[up.length - 1] ?? null;
    }
  }, label);
}
